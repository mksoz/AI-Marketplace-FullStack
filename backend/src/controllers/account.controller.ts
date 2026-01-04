import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function mapMilestoneToFinanceStatus(m: any) {
    if (m.isPaid) return 'Pagado';
    if (m.paymentRequest) {
        if (m.paymentRequest.status === 'COMPLETED') return 'Pagado';
        if (m.paymentRequest.status === 'APPROVED') return 'Aprobado';
        if (m.paymentRequest.status === 'PENDING') return 'Pendiente';
        if (m.paymentRequest.status === 'REJECTED') return 'Rechazado';
    }
    if (m.status === 'COMPLETED') return 'En Garantía'; // Completed but not paid
    if (m.status === 'IN_PROGRESS') return 'En Escrow';
    return 'Pendiente'; // For PENDING milestones
};

// Get account balance (works for both client and vendor)
export const getAccountBalance = async (req: Request, res: Response) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        let account: any;
        let pendingRequests = 0;

        if (user.role === 'CLIENT') {
            const clientProfile = await prisma.clientProfile.findUnique({
                where: { userId: user.userId },
                include: {
                    account: true,
                    projects: {
                        include: {
                            milestones: {
                                include: {
                                    paymentRequest: {
                                        where: {
                                            status: 'PENDING'
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            if (!clientProfile) {
                return res.status(404).json({ message: 'Client profile not found' });
            }

            // Create account if doesn't exist
            if (!clientProfile.account) {
                account = await prisma.clientAccount.create({
                    data: {
                        clientId: clientProfile.id
                    }
                });
            } else {
                account = clientProfile.account;
            }

            // Calculate pending payment requests amount
            pendingRequests = clientProfile.projects.reduce((total, project) => {
                return total + project.milestones.reduce((sum, milestone) => {
                    if (milestone.paymentRequest) {
                        return sum + milestone.paymentRequest.amount;
                    }
                    return sum;
                }, 0);
            }, 0);

        } else if (user.role === 'VENDOR') {
            const vendorProfile = await prisma.vendorProfile.findUnique({
                where: { userId: user.userId },
                include: {
                    account: true,
                    projects: {
                        include: {
                            milestones: {
                                include: {
                                    paymentRequest: {
                                        where: {
                                            status: 'APPROVED'
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            if (!vendorProfile) {
                return res.status(404).json({ message: 'Vendor profile not found' });
            }

            // Create account if doesn't exist
            if (!vendorProfile.account) {
                account = await prisma.vendorAccount.create({
                    data: {
                        vendorId: vendorProfile.id
                    }
                });
            } else {
                account = vendorProfile.account;
            }

            // Calculate approved but not yet processed payments
            pendingRequests = vendorProfile.projects.reduce((total, project) => {
                return total + project.milestones.reduce((sum, milestone) => {
                    if (milestone.paymentRequest) {
                        return sum + milestone.paymentRequest.amount;
                    }
                    return sum;
                }, 0);
            }, 0);
        } else {
            return res.status(403).json({ message: 'Invalid user role' });
        }

        const availableBalance = user.role === 'CLIENT'
            ? account.balance - pendingRequests
            : account.balance + pendingRequests;

        res.json({
            balance: account.balance,
            currency: account.currency,
            pendingRequests,
            availableBalance: Math.max(0, availableBalance)
        });
    } catch (error) {
        console.error('Error fetching account balance:', error);
        res.status(500).json({ message: 'Error fetching account balance' });
    }
};

// Deposit money (simulation mode only)
export const depositMoney = async (req: Request, res: Response) => {
    try {
        const { amount } = req.body;
        const user = req.user;

        if (!user || user.role !== 'CLIENT') {
            return res.status(403).json({ message: 'Only clients can deposit money' });
        }

        // Check if simulation mode is enabled
        const userRecord = await prisma.user.findUnique({
            where: { id: user.userId }
        });

        if (!userRecord?.simulationMode) {
            return res.status(400).json({
                message: 'Simulation mode is disabled. Enable it in settings to deposit funds.'
            });
        }

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        // Get or create client account
        const clientProfile = await prisma.clientProfile.findUnique({
            where: { userId: user.userId },
            include: { account: true }
        });

        if (!clientProfile) {
            return res.status(404).json({ message: 'Client profile not found' });
        }

        let account = clientProfile.account;
        if (!account) {
            account = await prisma.clientAccount.create({
                data: {
                    clientId: clientProfile.id
                }
            });
        }

        // Create deposit transaction and update balance
        const result = await prisma.$transaction(async (tx) => {
            const transaction = await tx.transaction.create({
                data: {
                    amount,
                    type: 'DEPOSIT',
                    status: 'COMPLETED',
                    description: 'Simulated deposit',
                    fromAccountId: account!.id,
                    completedAt: new Date(),
                    metadata: {
                        simulationMode: true
                    }
                }
            });

            const updatedAccount = await tx.clientAccount.update({
                where: { id: account!.id },
                data: {
                    balance: { increment: amount }
                }
            });

            return { transaction, account: updatedAccount };
        });

        res.json({
            transaction: result.transaction,
            newBalance: result.account.balance
        });
    } catch (error) {
        console.error('Error depositing money:', error);
        res.status(500).json({ message: 'Error depositing money' });
    }
};

// Get transaction history
export const getTransactionHistory = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const { limit = 50, offset = 0, type } = req.query;

        if (!user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        let accountId: string | null = null;
        let isClient = false;

        if (user.role === 'CLIENT') {
            const clientProfile = await prisma.clientProfile.findUnique({
                where: { userId: user.userId },
                include: { account: true }
            });

            if (clientProfile?.account) {
                accountId = clientProfile.account.id;
                isClient = true;
            }
        } else if (user.role === 'VENDOR') {
            const vendorProfile = await prisma.vendorProfile.findUnique({
                where: { userId: user.userId },
                include: { account: true }
            });

            if (vendorProfile?.account) {
                accountId = vendorProfile.account.id;
            }
        }

        if (!accountId) {
            return res.json({ transactions: [], total: 0 });
        }

        const whereClause: any = {
            OR: isClient
                ? [{ fromAccountId: accountId }]
                : [{ toAccountId: accountId }]
        };

        if (type) {
            whereClause.type = type;
        }

        const [transactions, total] = await Promise.all([
            prisma.transaction.findMany({
                where: whereClause,
                orderBy: { createdAt: 'desc' },
                take: Number(limit),
                skip: Number(offset),
                include: {
                    paymentRequest: {
                        include: {
                            milestone: {
                                select: {
                                    id: true,
                                    title: true,
                                    projectId: true
                                }
                            }
                        }
                    }
                }
            }),
            prisma.transaction.count({ where: whereClause })
        ]);

        res.json({ transactions, total });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Error fetching transactions' });
    }
};

// Get Vendor Finance Summary (Custom Dashboard Data)
export const getVendorFinanceSummary = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user || user.role !== 'VENDOR') {
            return res.status(403).json({ message: 'Only vendors can access this' });
        }

        const vendorProfile = await prisma.vendorProfile.findUnique({
            where: { userId: user.userId },
            include: {
                account: true,
                projects: {
                    include: {
                        client: {
                            include: {
                                user: { select: { email: true } }
                            }
                        },
                        milestones: {
                            include: {
                                paymentRequest: true
                            }
                        }
                    }
                }
            }
        });

        if (!vendorProfile) {
            return res.status(404).json({ message: 'Vendor profile not found' });
        }

        // 1. Balance
        const balance = vendorProfile.account?.balance || 0;
        const currency = vendorProfile.account?.currency || 'USD';

        // 2. Escrow & Projected Calculation
        let escrowAmount = 0;
        let projectedAmount = 0;
        let financialItems: any[] = [];

        vendorProfile.projects.forEach(project => {
            project.milestones.forEach(milestone => {
                // Escrow: Milestones In Progress OR Payment Request Pending/Approved (but not completed)
                // Actually "En Escrow" implies funds are locked. 
                // We'll define: 
                // - Escrow: Status IN_PROGRESS or PaymentRequest != COMPLETED
                // - Projected: Status PENDING (Not started)

                if ((milestone.status as string) === 'IN_PROGRESS') {
                    escrowAmount += milestone.amount;
                } else if (milestone.paymentRequest && (milestone.paymentRequest.status as string) !== 'COMPLETED' && (milestone.paymentRequest.status as string) !== 'REJECTED') {
                    // If it has a payment request that is pending/approved, it's definitely "in flight" or escrow
                    // Avoid double counting if it was IN_PROGRESS (usually PR changes status to COMPLETED)
                    if ((milestone.status as string) !== 'IN_PROGRESS') {
                        escrowAmount += milestone.amount;
                    }
                } else if ((milestone.status as string) === 'PENDING') {
                    projectedAmount += milestone.amount;
                }

                // Add to financial items list for the table
                // We want to show ALL milestones as financial records? 
                // Or only those that are relevant (active/recent/history). 
                // Let's adding all for MVP filtering.
                financialItems.push({
                    id: milestone.id,
                    reference: `#MIL-${milestone.id.substring(0, 8)}`,
                    project: project.title,
                    client: project.client.companyName || project.client.user.email,
                    date: milestone.dueDate ? new Date(milestone.dueDate) : new Date(project.createdAt),
                    amount: milestone.amount,
                    status: mapMilestoneToFinanceStatus(milestone),
                    type: 'MILESTONE',
                    originalStatus: milestone.status
                });
            });
        });

        // 3. Transactions (Completed Payments/Withdrawals)
        if (vendorProfile.account) {
            const transactions = await prisma.transaction.findMany({
                where: {
                    OR: [
                        { toAccountId: vendorProfile.account.id },
                        { fromAccountId: vendorProfile.account.id }
                    ]
                },
                orderBy: { createdAt: 'desc' },
                take: 50
            });

            transactions.forEach(tx => {
                // If it's a payment derived from a milestone, we might have duplication if we list both.
                // But transactions are "Real Money Moved". Milestones are "Work".
                // The design shows "Invoices" or "Reference".
                // Usually meaningful to show Milestones as the "Source" of income.
                // WE WILL USE MILESTONES as the primary "Invoice" equivalent.
                // AND Transactions (Withdrawals) as separate items.

                if (tx.type === 'WITHDRAWAL' || tx.type === 'DEPOSIT') {
                    financialItems.push({
                        id: tx.id,
                        reference: `#TX-${tx.id.substring(0, 8)}`,
                        project: tx.description || 'N/A',
                        client: 'Platform',
                        date: new Date(tx.createdAt),
                        amount: tx.amount,
                        status: tx.status === 'COMPLETED' ? 'Pagado' : 'Pendiente',
                        type: 'TRANSACTION',
                        isDebit: tx.fromAccountId === vendorProfile.account!.id // If true, it's money OUT (Withdrawal)
                    });
                }
            });
        }

        // Sort items by date desc
        financialItems.sort((a, b) => b.date.getTime() - a.date.getTime());

        res.json({
            balance,
            currency,
            escrowAmount,
            projectedAmount,
            financialItems
        });

    } catch (error) {
        console.error('Error fetching vendor summary:', error);
        res.status(500).json({ message: 'Error fetching summary' });
    }
};

export const getClientFundsSummary = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;

        // 1. Get Client Profile & Account
        const clientProfile: any = await prisma.clientProfile.findUnique({
            where: { userId: userId },
            include: {
                account: true,
                projects: {
                    include: {
                        milestones: {
                            include: {
                                paymentRequest: true,
                                project: {
                                    include: {
                                        vendor: { select: { companyName: true } }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!clientProfile) {
            return res.status(404).json({ message: 'Client profile not found' });
        }

        // Initialize Summary
        let balance = 0;
        let currency = 'USD';
        let escrowAmount = 0; // In Progress / Funds Locked
        let projectedAmount = 0; // Future Obligations
        let totalSpent = 0;
        let financialItems: any[] = [];

        if (clientProfile.account) {
            balance = clientProfile.account.balance;
            currency = clientProfile.account.currency;
        }

        // 2. Process Projects & Milestones
        const allMilestones = clientProfile.projects.flatMap((p: any) => p.milestones);

        allMilestones.forEach((m: any) => {
            // Calculate Escrow & Projected
            if (m.status === 'IN_PROGRESS') {
                escrowAmount += m.amount;
            } else if (m.status === 'PENDING') {
                projectedAmount += m.amount;
            } else if (m.status === 'COMPLETED') {
                // If completed, it means it's paid (usually). 
                // We'll trust Transaction history for "Spent", but strictly strictly logic wise:
                // If we rely on Transaction history, we don't add here.
            }

            // Create Financial Item for active/pending work
            if (m.status !== 'COMPLETED' && m.status !== 'CANCELLED') {
                financialItems.push({
                    id: m.id,
                    reference: m.title,
                    project: m.project.title,
                    counterparty: m.project.vendor?.companyName || 'Unassigned',
                    date: new Date(m.dueDate),
                    amount: m.amount,
                    status: mapMilestoneToFinanceStatus(m),
                    originalStatus: m.status,
                    type: 'MILESTONE',
                    isDebit: true // For client, milestones are expenses
                });
            }
        });

        // 3. Transactions (Deposits & Withdrawals/Payments)
        if (clientProfile.account) {
            // Get transactions for this account
            const transactions = await prisma.transaction.findMany({
                where: {
                    OR: [
                        { toAccountId: clientProfile.account.id },
                        { fromAccountId: clientProfile.account.id }
                    ]
                },
                orderBy: { createdAt: 'desc' },
                take: 50
            });

            transactions.forEach(tx => {
                const isDebit = tx.fromAccountId === clientProfile.account!.id;

                // Track Spent
                if (isDebit && (tx.type === 'WITHDRAWAL' || tx.type === 'PAYMENT')) {
                    totalSpent += tx.amount;
                }

                financialItems.push({
                    id: tx.id,
                    reference: `#TX-${tx.id.substring(0, 8)}`,
                    project: tx.description || 'N/A',
                    counterparty: 'Platform', // Or Vendor if we tracked it deeper
                    date: new Date(tx.createdAt),
                    amount: tx.amount,
                    status: tx.status === 'COMPLETED' ? (isDebit ? 'Pagado' : 'Recibido') : 'Pendiente',
                    type: 'TRANSACTION',
                    isDebit: isDebit
                });
            });
        }

        // Sort items
        financialItems.sort((a, b) => b.date.getTime() - a.date.getTime());

        res.json({
            balance,
            currency,
            escrowAmount,
            projectedAmount,
            totalSpent,
            financialItems
        });

    } catch (error) {
        console.error('Error fetching client funds summary:', error);
        res.status(500).json({ message: 'Error fetching summary' });
    }
};


