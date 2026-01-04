import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
