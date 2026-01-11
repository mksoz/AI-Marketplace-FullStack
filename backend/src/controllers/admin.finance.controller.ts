import { Request, Response } from 'express';
import { PrismaClient, TransactionStatus, TransactionType, PaymentRequestStatus } from '@prisma/client';
import { logAdminAction } from '../middlewares/admin-auth.middleware';

const prisma = new PrismaClient();

// GET /admin/finance/dashboard - Finance metrics
export const getFinanceDashboard = async (req: Request, res: Response) => {
    try {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Platform balance (total held funds)
        const clientAccounts = await prisma.clientAccount.aggregate({
            _sum: { balance: true }
        });
        const vendorAccounts = await prisma.vendorAccount.aggregate({
            _sum: { balance: true }
        });

        const platformBalance = (clientAccounts._sum.balance || 0) + (vendorAccounts._sum.balance || 0);

        // Pending transactions
        const pendingTransactions = await prisma.transaction.count({
            where: { status: TransactionStatus.PENDING }
        });

        // This month revenue (platform fees)
        const thisMonthRevenue = await prisma.transaction.aggregate({
            where: {
                type: TransactionType.FEE,
                status: TransactionStatus.COMPLETED,
                createdAt: { gte: firstDayOfMonth }
            },
            _sum: { amount: true }
        });

        // Pending payment requests
        const pendingPaymentRequests = await prisma.paymentRequest.count({
            where: { status: PaymentRequestStatus.PENDING }
        });

        // Failed transactions (last 7 days)
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const failedTransactions = await prisma.transaction.count({
            where: {
                status: TransactionStatus.FAILED,
                createdAt: { gte: sevenDaysAgo }
            }
        });

        const disputedPayments = await prisma.dispute.count({
            where: {
                status: 'OPEN'
            }
        });

        res.json({
            platformBalance,
            pendingTransactions,
            thisMonthRevenue: thisMonthRevenue._sum.amount || 0,
            pendingPaymentRequests,
            failedTransactions,
            disputedPayments
        });
    } catch (error) {
        console.error('Error fetching finance dashboard:', error);
        res.status(500).json({ message: 'Error fetching finance dashboard' });
    }
};

// GET /admin/finance/transactions - List transactions
export const getTransactions = async (req: Request, res: Response) => {
    try {
        const {
            type,
            status,
            minAmount,
            maxAmount,
            startDate,
            endDate,
            userId,
            projectId,
            page = '1',
            limit = '20'
        } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};

        if (type) where.type = type;
        if (status) where.status = status;
        if (minAmount || maxAmount) {
            where.amount = {};
            if (minAmount) where.amount.gte = parseFloat(minAmount as string);
            if (maxAmount) where.amount.lte = parseFloat(maxAmount as string);
        }
        if (startDate) where.createdAt = { gte: new Date(startDate as string) };
        if (endDate) where.createdAt = { ...where.createdAt, lte: new Date(endDate as string) };
        if (projectId) where.projectId = projectId;
        if (userId) {
            where.OR = [
                { fromAccount: { client: { userId } } },
                { toAccount: { vendor: { userId } } }
            ];
        }

        const [transactions, total] = await Promise.all([
            prisma.transaction.findMany({
                where,
                skip,
                take: limitNum,
                include: {
                    fromAccount: {
                        include: {
                            client: {
                                include: {
                                    user: { select: { email: true } }
                                }
                            }
                        }
                    },
                    toAccount: {
                        include: {
                            vendor: {
                                include: {
                                    user: { select: { email: true } }
                                }
                            }
                        }
                    },
                    paymentRequest: {
                        include: {
                            milestone: {
                                select: {
                                    title: true,
                                    projectId: true
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.transaction.count({ where })
        ]);

        res.json({
            transactions,
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum)
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Error fetching transactions' });
    }
};

// GET /admin/finance/transactions/:id - Transaction details
export const getTransaction = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const transaction = await prisma.transaction.findUnique({
            where: { id },
            include: {
                fromAccount: {
                    include: {
                        client: {
                            include: {
                                user: { select: { email: true, id: true } }
                            }
                        }
                    }
                },
                toAccount: {
                    include: {
                        vendor: {
                            include: {
                                user: { select: { email: true, id: true } }
                            }
                        }
                    }
                },
                paymentRequest: {
                    include: {
                        milestone: {
                            include: {
                                project: {
                                    select: {
                                        id: true,
                                        title: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        res.json(transaction);
    } catch (error) {
        console.error('Error fetching transaction:', error);
        res.status(500).json({ message: 'Error fetching transaction details' });
    }
};

// POST /admin/finance/transactions/:id/complete - Force complete transaction
export const completeTransaction = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const adminId = (req as any).user?.userId;

        if (!reason) {
            return res.status(400).json({ message: 'Reason is required' });
        }

        const transaction = await prisma.transaction.findUnique({
            where: { id }
        });

        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        if (transaction.status === TransactionStatus.COMPLETED) {
            return res.status(400).json({ message: 'Transaction already completed' });
        }

        const updated = await prisma.transaction.update({
            where: { id },
            data: {
                status: TransactionStatus.COMPLETED,
                completedAt: new Date()
            }
        });

        // Update account balances based on transaction type
        if (transaction.type === TransactionType.PAYMENT && transaction.toAccountId) {
            await prisma.vendorAccount.update({
                where: { id: transaction.toAccountId },
                data: {
                    balance: {
                        increment: transaction.amount
                    }
                }
            });
        }

        await logAdminAction(
            adminId,
            'TRANSACTION_COMPLETED',
            'transaction',
            id,
            `Force completed transaction. Reason: ${reason}`
        );

        res.json({
            message: 'Transaction completed successfully',
            transaction: updated
        });
    } catch (error) {
        console.error('Error completing transaction:', error);
        res.status(500).json({ message: 'Error completing transaction' });
    }
};

// POST /admin/finance/transactions/:id/refund - Refund transaction
export const refundTransaction = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { reason, amount } = req.body;
        const adminId = (req as any).user?.userId;

        if (!reason) {
            return res.status(400).json({ message: 'Reason is required' });
        }

        const originalTransaction = await prisma.transaction.findUnique({
            where: { id }
        });

        if (!originalTransaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        const refundAmount = amount || originalTransaction.amount;

        if (refundAmount > originalTransaction.amount) {
            return res.status(400).json({
                message: 'Refund amount cannot exceed original transaction'
            });
        }

        // Create refund transaction
        const refund = await prisma.transaction.create({
            data: {
                amount: refundAmount,
                type: TransactionType.REFUND,
                status: TransactionStatus.COMPLETED,
                description: `Refund for transaction ${id}. Reason: ${reason}`,
                fromAccountId: originalTransaction.toAccountId,
                toAccountId: originalTransaction.fromAccountId,
                projectId: originalTransaction.projectId,
                metadata: {
                    originalTransactionId: id,
                    adminRefund: true
                },
                completedAt: new Date()
            }
        });

        // Update balances
        if (originalTransaction.toAccountId) {
            await prisma.vendorAccount.update({
                where: { id: originalTransaction.toAccountId },
                data: { balance: { decrement: refundAmount } }
            });
        }
        if (originalTransaction.fromAccountId) {
            await prisma.clientAccount.update({
                where: { id: originalTransaction.fromAccountId },
                data: { balance: { increment: refundAmount } }
            });
        }

        await logAdminAction(
            adminId,
            'TRANSACTION_REFUNDED',
            'transaction',
            id,
            `Refunded ${refundAmount}. Reason: ${reason}`
        );

        res.json({
            message: 'Refund processed successfully',
            refund
        });
    } catch (error) {
        console.error('Error processing refund:', error);
        res.status(500).json({ message: 'Error processing refund' });
    }
};

// GET /admin/finance/payment-requests - List payment requests
export const getPaymentRequests = async (req: Request, res: Response) => {
    try {
        const { status, overdue, page = '1', limit = '20' } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};
        if (status) where.status = status;

        const [requests, total] = await Promise.all([
            prisma.paymentRequest.findMany({
                where,
                skip,
                take: limitNum,
                include: {
                    milestone: {
                        include: {
                            project: {
                                select: {
                                    id: true,
                                    title: true,
                                    client: {
                                        include: {
                                            user: { select: { email: true } }
                                        }
                                    },
                                    vendor: {
                                        include: {
                                            user: { select: { email: true } }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    transaction: true
                },
                orderBy: { requestedAt: 'desc' }
            }),
            prisma.paymentRequest.count({ where })
        ]);

        res.json({
            requests,
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum)
        });
    } catch (error) {
        console.error('Error fetching payment requests:', error);
        res.status(500).json({ message: 'Error fetching payment requests' });
    }
};

// PUT /admin/finance/payment-requests/:id/approve - Force approve payment
export const approvePaymentRequest = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const adminId = (req as any).user?.userId;

        if (!reason) {
            return res.status(400).json({ message: 'Reason is required' });
        }

        const paymentRequest = await prisma.paymentRequest.findUnique({
            where: { id },
            include: {
                milestone: {
                    include: {
                        project: {
                            include: {
                                client: {
                                    include: {
                                        account: true
                                    }
                                },
                                vendor: {
                                    include: {
                                        account: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!paymentRequest) {
            return res.status(404).json({ message: 'Payment request not found' });
        }

        if (paymentRequest.status === PaymentRequestStatus.COMPLETED) {
            return res.status(400).json({ message: 'Payment request already completed' });
        }

        // Create transaction
        const transaction = await prisma.transaction.create({
            data: {
                amount: paymentRequest.amount,
                type: TransactionType.PAYMENT,
                status: TransactionStatus.COMPLETED,
                description: `Payment for milestone: ${paymentRequest.milestone.title}`,
                fromAccountId: paymentRequest.milestone.project.client.account?.id,
                toAccountId: paymentRequest.milestone.project.vendor?.account?.id,
                projectId: paymentRequest.milestone.projectId,
                milestoneId: paymentRequest.milestoneId,
                completedAt: new Date()
            }
        });

        // Update payment request
        await prisma.paymentRequest.update({
            where: { id },
            data: {
                status: PaymentRequestStatus.COMPLETED,
                reviewedAt: new Date(),
                transactionId: transaction.id
            }
        });

        // Mark milestone as paid
        await prisma.milestone.update({
            where: { id: paymentRequest.milestoneId },
            data: { isPaid: true }
        });

        // Update vendor balance
        if (paymentRequest.milestone.project.vendor?.account) {
            await prisma.vendorAccount.update({
                where: { id: paymentRequest.milestone.project.vendor.account.id },
                data: {
                    balance: { increment: paymentRequest.amount }
                }
            });
        }

        await logAdminAction(
            adminId,
            'PAYMENT_APPROVED',
            'paymentRequest',
            id,
            `Force approved payment of ${paymentRequest.amount}. Reason: ${reason}`
        );

        res.json({
            message: 'Payment approved successfully',
            transaction
        });
    } catch (error) {
        console.error('Error approving payment:', error);
        res.status(500).json({ message: 'Error approving payment' });
    }
};

// GET /admin/finance/accounts - List all accounts
export const getAccounts = async (req: Request, res: Response) => {
    try {
        const { type, search } = req.query; // type: 'client' | 'vendor'

        let clientAccounts: any[] = [];
        let vendorAccounts: any[] = [];

        if (!type || type === 'client') {
            clientAccounts = await prisma.clientAccount.findMany({
                include: {
                    client: {
                        include: {
                            user: { select: { email: true, id: true } }
                        }
                    }
                }
            });
        }

        if (!type || type === 'vendor') {
            vendorAccounts = await prisma.vendorAccount.findMany({
                include: {
                    vendor: {
                        include: {
                            user: { select: { email: true, id: true } }
                        }
                    }
                }
            });
        }

        res.json({
            clientAccounts,
            vendorAccounts
        });
    } catch (error) {
        console.error('Error fetching accounts:', error);
        res.status(500).json({ message: 'Error fetching accounts' });
    }
};

// PUT /admin/finance/accounts/:id/balance - Adjust account balance
export const adjustAccountBalance = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { amount, reason, accountType } = req.body; // accountType: 'client' | 'vendor'
        const adminId = (req as any).user?.userId;

        if (!amount || !reason || !accountType) {
            return res.status(400).json({
                message: 'Amount, reason, and account type are required'
            });
        }

        let account;
        if (accountType === 'client') {
            account = await prisma.clientAccount.update({
                where: { id },
                data: {
                    balance: { increment: amount }
                }
            });
        } else if (accountType === 'vendor') {
            account = await prisma.vendorAccount.update({
                where: { id },
                data: {
                    balance: { increment: amount }
                }
            });
        } else {
            return res.status(400).json({ message: 'Invalid account type' });
        }

        await logAdminAction(
            adminId,
            'BALANCE_ADJUSTED',
            `${accountType}Account`,
            id,
            `Adjusted balance by ${amount}. Reason: ${reason}`
        );

        res.json({
            message: 'Balance adjusted successfully',
            account
        });
    } catch (error) {
        console.error('Error adjusting balance:', error);
        res.status(500).json({ message: 'Error adjusting balance' });
    }
};

// POST /admin/finance/accounts/:id/freeze - Freeze account
export const freezeAccount = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { reason, accountType } = req.body;
        const adminId = (req as any).user?.userId;

        if (!reason || !accountType) {
            return res.status(400).json({ message: 'Reason and account type are required' });
        }

        // TODO: Implement account freezing - add frozen field to schema
        // For now, just log the action

        await logAdminAction(
            adminId,
            'ACCOUNT_FROZEN',
            `${accountType}Account`,
            id,
            `Froze account. Reason: ${reason}`
        );

        res.json({ message: 'Account frozen successfully' });
    } catch (error) {
        console.error('Error freezing account:', error);
        res.status(500).json({ message: 'Error freezing account' });
    }
};
