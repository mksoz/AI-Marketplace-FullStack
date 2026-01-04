import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Complete milestone without payment (for milestones with amount = 0 or vendor self-completion)
export const completeMilestone = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { completionNote } = req.body;
        const user = req.user;

        if (!user || user.role !== 'VENDOR') {
            return res.status(403).json({ message: 'Only vendors can complete milestones' });
        }

        if (!completionNote || !completionNote.trim()) {
            return res.status(400).json({ message: 'Completion note is required' });
        }

        // Get milestone and validate
        const milestone = await prisma.milestone.findUnique({
            where: { id },
            include: {
                project: {
                    include: {
                        vendor: true
                    }
                }
            }
        });

        if (!milestone) {
            return res.status(404).json({ message: 'Milestone not found' });
        }

        // Verify vendor owns this project
        if (milestone.project.vendor?.userId !== user.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Update milestone to completed
        const updated = await prisma.milestone.update({
            where: { id },
            data: {
                status: 'COMPLETED',
                completionNote: completionNote.trim(),
                completedAt: new Date()
            }
        });

        res.json({ milestone: updated });
    } catch (error) {
        console.error('Error completing milestone:', error);
        res.status(500).json({ message: 'Error completing milestone' });
    }
};

// Request payment for completed milestone
export const requestPayment = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { vendorNote } = req.body;
        const user = req.user;

        if (!user || user.role !== 'VENDOR') {
            return res.status(403).json({ message: 'Only vendors can request payment' });
        }

        // Get milestone and validate
        const milestone = await prisma.milestone.findUnique({
            where: { id },
            include: {
                project: {
                    include: {
                        vendor: true
                    }
                },
                paymentRequest: true
            }
        });

        if (!milestone) {
            return res.status(404).json({ message: 'Milestone not found' });
        }

        // Verify vendor owns this project
        if (milestone.project.vendor?.userId !== user.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Verify no existing payment request
        if (milestone.paymentRequest) {
            return res.status(400).json({ message: 'Payment request already exists for this milestone' });
        }

        // Verify milestone has payment amount
        if (milestone.amount <= 0) {
            return res.status(400).json({ message: 'This milestone has no payment amount' });
        }

        // Create payment request
        const paymentRequest = await prisma.paymentRequest.create({
            data: {
                milestoneId: id,
                amount: milestone.amount,
                vendorNote: vendorNote?.trim() || null,
                status: 'PENDING'
            }
        });

        res.json({ paymentRequest });
    } catch (error) {
        console.error('Error requesting payment:', error);
        res.status(500).json({ message: 'Error requesting payment' });
    }
};

// Get all payment requests for a project
export const getProjectPaymentRequests = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.params;
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        // Get project and verify access
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                client: true,
                vendor: true,
                milestones: {
                    include: {
                        paymentRequest: true
                    },
                    orderBy: {
                        order: 'asc'
                    }
                }
            }
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Verify user has access (either client or vendor)
        const isClient = project.client.userId === user.userId;
        const isVendor = project.vendor?.userId === user.userId;

        if (!isClient && !isVendor) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Extract payment requests from milestones
        const requests = project.milestones
            .filter(m => m.paymentRequest)
            .map(m => ({
                ...m.paymentRequest,
                milestone: {
                    id: m.id,
                    title: m.title,
                    description: m.description,
                    amount: m.amount,
                    status: m.status,
                    order: m.order
                }
            }));

        res.json({ requests });
    } catch (error) {
        console.error('Error fetching payment requests:', error);
        res.status(500).json({ message: 'Error fetching payment requests' });
    }
};

// Approve payment request (Client only)
export const approvePaymentRequest = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = req.user;

        if (!user || user.role !== 'CLIENT') {
            return res.status(403).json({ message: 'Only clients can approve payment requests' });
        }

        // Get payment request with related data
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

        // Verify client owns this project
        if (paymentRequest.milestone.project.client.userId !== user.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Verify status is PENDING
        if (paymentRequest.status !== 'PENDING') {
            return res.status(400).json({ message: 'Payment request is not pending' });
        }

        // Get or create client account
        let clientAccount = paymentRequest.milestone.project.client.account;
        if (!clientAccount) {
            clientAccount = await prisma.clientAccount.create({
                data: {
                    clientId: paymentRequest.milestone.project.client.id
                }
            });
        }

        // Get or create vendor account
        let vendorAccount = paymentRequest.milestone.project.vendor?.account;
        if (!vendorAccount && paymentRequest.milestone.project.vendor) {
            vendorAccount = await prisma.vendorAccount.create({
                data: {
                    vendorId: paymentRequest.milestone.project.vendor.id
                }
            });
        }

        // Verify sufficient balance
        if (clientAccount.balance < paymentRequest.amount) {
            // Check if user has simulation mode enabled
            const clientUser = await prisma.user.findUnique({
                where: { id: user.userId }
            });

            if (clientUser?.simulationMode) {
                // Auto-deposit in simulation mode
                const requiredAmount = paymentRequest.amount - clientAccount.balance;
                await prisma.clientAccount.update({
                    where: { id: clientAccount.id },
                    data: {
                        balance: { increment: requiredAmount }
                    }
                });

                // Create deposit transaction record
                await prisma.transaction.create({
                    data: {
                        amount: requiredAmount,
                        type: 'DEPOSIT',
                        status: 'COMPLETED',
                        description: '[SIMULACIÓN] Depósito automático',
                        toAccountId: clientAccount.id,
                        completedAt: new Date()
                    }
                });

                // Refresh balance
                clientAccount.balance += requiredAmount;
            } else {
                return res.status(400).json({
                    message: 'Insufficient balance',
                    required: paymentRequest.amount,
                    available: clientAccount.balance
                });
            }
        }

        // Execute payment in transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create transaction record
            const transaction = await tx.transaction.create({
                data: {
                    amount: paymentRequest.amount,
                    type: 'PAYMENT',
                    status: 'COMPLETED',
                    description: `Payment for milestone: ${paymentRequest.milestone.title}`,
                    fromAccountId: clientAccount!.id,
                    toAccountId: vendorAccount!.id,
                    projectId: paymentRequest.milestone.projectId,
                    milestoneId: paymentRequest.milestone.id,
                    completedAt: new Date()
                }
            });

            // Update payment request
            const updatedRequest = await tx.paymentRequest.update({
                where: { id },
                data: {
                    status: 'COMPLETED',
                    reviewedAt: new Date(),
                    transactionId: transaction.id
                }
            });

            // Update accounts
            await tx.clientAccount.update({
                where: { id: clientAccount!.id },
                data: {
                    balance: { decrement: paymentRequest.amount }
                }
            });

            await tx.vendorAccount.update({
                where: { id: vendorAccount!.id },
                data: {
                    balance: { increment: paymentRequest.amount }
                }
            });

            // Mark milestone as paid
            await tx.milestone.update({
                where: { id: paymentRequest.milestoneId },
                data: {
                    isPaid: true,
                    status: 'PAID'
                }
            });

            return { updatedRequest, transaction };
        });

        res.json({
            paymentRequest: result.updatedRequest,
            transaction: result.transaction
        });
    } catch (error) {
        console.error('Error approving payment:', error);
        res.status(500).json({ message: 'Error approving payment' });
    }
};

// Reject payment request (Client only)
export const rejectPaymentRequest = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { rejectionReason } = req.body;
        const user = req.user;

        if (!user || user.role !== 'CLIENT') {
            return res.status(403).json({ message: 'Only clients can reject payment requests' });
        }

        if (!rejectionReason || !rejectionReason.trim()) {
            return res.status(400).json({ message: 'Rejection reason is required' });
        }

        // Get payment request with related data
        const paymentRequest = await prisma.paymentRequest.findUnique({
            where: { id },
            include: {
                milestone: {
                    include: {
                        project: {
                            include: {
                                client: true
                            }
                        }
                    }
                }
            }
        });

        if (!paymentRequest) {
            return res.status(404).json({ message: 'Payment request not found' });
        }

        // Verify client owns this project
        if (paymentRequest.milestone.project.client.userId !== user.userId) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Verify status is PENDING
        if (paymentRequest.status !== 'PENDING') {
            return res.status(400).json({ message: 'Payment request is not pending' });
        }

        // Update payment request
        const updated = await prisma.paymentRequest.update({
            where: { id },
            data: {
                status: 'REJECTED',
                reviewedAt: new Date(),
                rejectionReason: rejectionReason.trim()
            }
        });

        res.json({ paymentRequest: updated });
    } catch (error) {
        console.error('Error rejecting payment:', error);
        res.status(500).json({ message: 'Error rejecting payment' });
    }
};
