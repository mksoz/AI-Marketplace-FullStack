import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logAdminAction } from '../middlewares/admin-auth.middleware';

const prisma = new PrismaClient();

// GET /admin/disputes
export const getDisputes = async (req: Request, res: Response) => {
    try {
        const {
            status,
            search,
            page = '1',
            limit = '20',
            sortBy = 'newest',
            dateFrom,
            dateTo,
            amountMin,
            amountMax
        } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};

        // Status filter
        if (status && status !== 'all') {
            if (typeof status === 'string' && status.includes(',')) {
                // Multiple statuses
                where.status = { in: status.split(',') };
            } else {
                where.status = status;
            }
        }

        // Search filter (project title or vendor comment)
        if (search) {
            where.OR = [
                { project: { title: { contains: search as string, mode: 'insensitive' } } },
                { vendorComment: { contains: search as string, mode: 'insensitive' } },
                { milestoneTitle: { contains: search as string, mode: 'insensitive' } }
            ];
        }

        // Date range filter
        if (dateFrom || dateTo) {
            where.createdAt = {};
            if (dateFrom) {
                where.createdAt.gte = new Date(dateFrom as string);
            }
            if (dateTo) {
                where.createdAt.lte = new Date(dateTo as string);
            }
        }

        // Amount range filter
        if (amountMin || amountMax) {
            where.amount = {};
            if (amountMin) {
                where.amount.gte = parseFloat(amountMin as string);
            }
            if (amountMax) {
                where.amount.lte = parseFloat(amountMax as string);
            }
        }

        // Sorting
        let orderBy: any = { createdAt: 'desc' }; // default: newest
        switch (sortBy) {
            case 'oldest':
                orderBy = { createdAt: 'asc' };
                break;
            case 'highestAmount':
                orderBy = { amount: 'desc' };
                break;
            case 'lowestAmount':
                orderBy = { amount: 'asc' };
                break;
            case 'newest':
            default:
                orderBy = { createdAt: 'desc' };
        }

        const [disputes, total] = await Promise.all([
            prisma.dispute.findMany({
                where,
                skip,
                take: limitNum,
                include: {
                    project: {
                        select: {
                            id: true,
                            title: true,
                            budget: true,
                            client: {
                                select: {
                                    id: true,
                                    companyName: true,
                                    user: {
                                        select: {
                                            id: true,
                                            email: true
                                        }
                                    }
                                }
                            },
                            vendor: {
                                select: {
                                    id: true,
                                    companyName: true,
                                    user: {
                                        select: {
                                            id: true,
                                            email: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    evidenceFiles: {
                        select: {
                            id: true,
                            filename: true,
                            fileSize: true,
                            mimeType: true
                        }
                    }
                },
                orderBy
            }),
            prisma.dispute.count({ where })
        ]);

        // Get plaintiff and defendant details for each dispute
        const disputesWithUsers = await Promise.all(
            disputes.map(async (dispute) => {
                const [plaintiffUser, defendantUser] = await Promise.all([
                    prisma.user.findUnique({
                        where: { id: dispute.plaintiffId },
                        select: {
                            id: true,
                            email: true,
                            role: true
                        }
                    }),
                    prisma.user.findUnique({
                        where: { id: dispute.defendantId },
                        select: {
                            id: true,
                            email: true,
                            role: true
                        }
                    })
                ]);

                return {
                    ...dispute,
                    plaintiffUser,
                    defendantUser
                };
            })
        );

        res.json({
            disputes: disputesWithUsers,
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum)
        });
    } catch (error) {
        console.error('Error getting disputes:', error);
        res.status(500).json({ message: 'Error obteniendo disputas' });
    }
};

// GET /admin/disputes/:id
export const getDispute = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const dispute = await prisma.dispute.findUnique({
            where: { id },
            include: {
                project: {
                    include: {
                        client: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        email: true,
                                        role: true
                                    }
                                }
                            }
                        },
                        vendor: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        email: true,
                                        role: true
                                    }
                                }
                            }
                        }
                    }
                },
                evidenceFiles: {
                    orderBy: {
                        uploadedAt: 'desc'
                    }
                }
            }
        });

        if (!dispute) {
            return res.status(404).json({ message: 'Disputa no encontrada' });
        }

        // Get plaintiff and defendant user details
        const [plaintiffUser, defendantUser] = await Promise.all([
            prisma.user.findUnique({
                where: { id: dispute.plaintiffId },
                select: {
                    id: true,
                    email: true,
                    role: true
                }
            }),
            prisma.user.findUnique({
                where: { id: dispute.defendantId },
                select: {
                    id: true,
                    email: true,
                    role: true
                }
            })
        ]);

        // Get the specific milestone for this dispute
        const milestone = await prisma.milestone.findUnique({
            where: { id: dispute.milestoneId },
            include: {
                deliverableFolders: {
                    include: {
                        files: true,
                        subfolders: true
                    }
                },
                reviews: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        });

        res.json({
            ...dispute,
            plaintiffUser,
            defendantUser,
            milestone
        });
    } catch (error) {
        console.error('Error getting dispute:', error);
        res.status(500).json({ message: 'Error obteniendo disputa' });
    }
};

// POST /admin/disputes/:id/analyze
export const analyzeWithAI = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const adminId = (req as any).user?.userId;

        const dispute = await prisma.dispute.findUnique({
            where: { id },
            include: {
                project: true
            }
        });

        if (!dispute) {
            return res.status(404).json({ message: 'Disputa no encontrada' });
        }

        // TODO: Implement actual AI analysis using Gemini
        // For now, mock response
        const aiAnalysis = {
            sentiment: 'neutral',
            recommendation: 'Based on the evidence, a split resolution is recommended.',
            confidence: 0.75,
            justification: 'Both parties have valid points. Client paid in full but deliverable is incomplete. Suggest 60-40 split.'
        };

        // Update dispute with AI analysis
        const updatedDispute = await prisma.dispute.update({
            where: { id },
            data: {
                aiSentiment: aiAnalysis.sentiment,
                aiRecommendation: aiAnalysis.recommendation,
                aiConfidence: aiAnalysis.confidence
            }
        });

        // Log action
        await logAdminAction(
            adminId,
            'DISPUTE_ANALYZED',
            'dispute',
            id,
            'Ran AI analysis on dispute'
        );

        res.json(updatedDispute);
    } catch (error) {
        console.error('Error analyzing dispute:', error);
        res.status(500).json({ message: 'Error analizando disputa' });
    }
};

// POST /admin/disputes/:id/resolve
export const resolveDispute = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { resolution, splitClient, splitVendor, notes } = req.body;
        const adminId = (req as any).user?.userId;

        if (!resolution) {
            return res.status(400).json({ message: 'Resolución es requerida' });
        }

        if (resolution === 'SPLIT_CUSTOM' && (!splitClient || !splitVendor)) {
            return res.status(400).json({ message: 'Montos de split son requeridos' });
        }

        const dispute = await prisma.dispute.findUnique({
            where: { id },
            include: {
                project: {
                    include: {
                        client: {
                            include: {
                                user: true
                            }
                        },
                        vendor: {
                            include: {
                                user: true
                            }
                        }
                    }
                }
            }
        });

        if (!dispute) {
            return res.status(404).json({ message: 'Disputa no encontrada' });
        }

        if (dispute.status === 'RESOLVED') {
            return res.status(400).json({ message: 'Disputa ya está resuelta' });
        }

        // Get the milestone to update its status
        const milestone = await prisma.milestone.findUnique({
            where: { id: dispute.milestoneId }
        });

        if (!milestone) {
            return res.status(404).json({ message: 'Milestone no encontrado' });
        }

        // Determine milestone status based on resolution
        let newMilestoneStatus: any = milestone.status;
        if (resolution === 'REFUND_CLIENT') {
            newMilestoneStatus = 'REJECTED'; // Client gets refund, milestone rejected
        } else if (resolution === 'RELEASE_VENDOR') {
            newMilestoneStatus = 'COMPLETED'; // Vendor gets payment, milestone completed
        }
        // For SPLIT_CUSTOM, keep current status or set to IN_PROGRESS (manual handling needed)

        // Resolve dispute
        const resolvedDispute = await prisma.dispute.update({
            where: { id },
            data: {
                status: 'RESOLVED',
                resolution,
                resolutionNotes: notes,
                splitClient: resolution === 'SPLIT_CUSTOM' ? splitClient : null,
                splitVendor: resolution === 'SPLIT_CUSTOM' ? splitVendor : null,
                resolvedBy: adminId,
                resolvedAt: new Date()
            }
        });

        // Update milestone status
        await prisma.milestone.update({
            where: { id: dispute.milestoneId },
            data: { status: newMilestoneStatus }
        });

        // ========== FUND TRANSFER LOGIC ==========
        // Note: Actual fund transfer would be implemented here with payment processor
        // For now, we log the intent and update escrow records

        const escrow = await prisma.projectEscrow.findUnique({
            where: { projectId: dispute.projectId }
        });

        if (escrow) {
            if (resolution === 'REFUND_CLIENT') {
                // Create refund transaction
                await prisma.escrowTransaction.create({
                    data: {
                        escrowId: escrow.id,
                        type: 'REFUND',
                        amount: Number(dispute.amount),
                        milestoneId: milestone.id,
                        description: `Refund to client due to dispute resolution. Dispute ID: ${id}`
                    }
                });
                console.log(`[DISPUTE] Would refund $${dispute.amount} to client`);
            } else if (resolution === 'RELEASE_VENDOR') {
                // Create release transaction
                await prisma.escrowTransaction.create({
                    data: {
                        escrowId: escrow.id,
                        type: 'RELEASE',
                        amount: Number(dispute.amount),
                        milestoneId: milestone.id,
                        description: `Release to vendor due to dispute resolution. Dispute ID: ${id}`
                    }
                });
                console.log(`[DISPUTE] Would release $${dispute.amount} to vendor`);
            } else if (resolution === 'SPLIT_CUSTOM') {
                // Create both refund and release transactions
                await prisma.escrowTransaction.createMany({
                    data: [
                        {
                            escrowId: escrow.id,
                            type: 'REFUND',
                            amount: splitClient,
                            milestoneId: milestone.id,
                            description: `Partial refund to client (split resolution). Dispute ID: ${id}`
                        },
                        {
                            escrowId: escrow.id,
                            type: 'RELEASE',
                            amount: splitVendor,
                            milestoneId: milestone.id,
                            description: `Partial release to vendor (split resolution). Dispute ID: ${id}`
                        }
                    ]
                });
                console.log(`[DISPUTE] Would split: $${splitClient} to client, $${splitVendor} to vendor`);
            }
        }

        // Find and update related incidents
        const relatedIncidents = await prisma.incident.findMany({
            where: {
                resolution: {
                    contains: id
                },
                type: 'DISPUTE'
            }
        });

        // Create resolution message for incidents
        let resolutionMessage = '';
        if (resolution === 'REFUND_CLIENT') {
            resolutionMessage = `Disputa resuelta: Reembolso completo al cliente.`;
        } else if (resolution === 'RELEASE_VENDOR') {
            resolutionMessage = `Disputa resuelta: Fondos liberados al vendor.`;
        } else if (resolution === 'SPLIT_CUSTOM') {
            resolutionMessage = `Disputa resuelta: División de fondos (Cliente: $${splitClient}, Vendor: $${splitVendor}).`;
        }

        if (notes) {
            resolutionMessage += ` Notas: ${notes}`;
        }

        // Update incidents to RESOLVED
        let incidentsUpdated = 0;
        if (relatedIncidents.length > 0) {
            const updateResult = await prisma.incident.updateMany({
                where: {
                    id: {
                        in: relatedIncidents.map(inc => inc.id)
                    }
                },
                data: {
                    status: 'RESOLVED',
                    resolution: resolutionMessage
                }
            });
            incidentsUpdated = updateResult.count;
        }

        // ========== SEND NOTIFICATIONS TO BOTH PARTIES ==========
        const notifications = [];

        // CLIENT notification
        if (dispute.project.client?.user?.id) {
            let clientTitle = '';
            let clientMessage = '';

            if (resolution === 'REFUND_CLIENT') {
                clientTitle = '✅ Disputa resuelta a tu favor';
                clientMessage = `La disputa para "${milestone.title}" ha sido resuelta. Se ha autorizado el reembolso completo de $${dispute.amount.toFixed(2)}.`;
            } else if (resolution === 'RELEASE_VENDOR') {
                clientTitle = '⚠️ Disputa resuelta';
                clientMessage = `La disputa para "${milestone.title}" ha sido resuelta. Los fondos ($${dispute.amount.toFixed(2)}) han sido liberados al vendor.`;
            } else if (resolution === 'SPLIT_CUSTOM') {
                clientTitle = '⚖️ Disputa resuelta con división de fondos';
                clientMessage = `La disputa para "${milestone.title}" ha sido resuelta con división de fondos. Recibirás: $${splitClient.toFixed(2)}.`;
            }

            if (notes) {
                clientMessage += ` Notas del administrador: "${notes}"`;
            }

            notifications.push(
                prisma.notification.create({
                    data: {
                        userId: dispute.project.client.user.id,
                        type: 'DISPUTE_RESOLVED',
                        title: clientTitle,
                        message: clientMessage,
                        actionUrl: `/client/projects/${dispute.projectId}`,
                        entityId: id,
                        entityType: 'dispute',
                        actorId: adminId
                    }
                })
            );
        }

        // VENDOR notification
        if (dispute.project.vendor?.user?.id) {
            let vendorTitle = '';
            let vendorMessage = '';

            if (resolution === 'REFUND_CLIENT') {
                vendorTitle = '⚠️ Disputa resuelta';
                vendorMessage = `La disputa para "${milestone.title}" ha sido resuelta. Se ha autorizado el reembolso al cliente de $${dispute.amount.toFixed(2)}.`;
            } else if (resolution === 'RELEASE_VENDOR') {
                vendorTitle = '✅ Disputa resuelta a tu favor';
                vendorMessage = `La disputa para "${milestone.title}" ha sido resuelta. Los fondos ($${dispute.amount.toFixed(2)}) han sido liberados.`;
            } else if (resolution === 'SPLIT_CUSTOM') {
                vendorTitle = '⚖️ Disputa resuelta con división de fondos';
                vendorMessage = `La disputa para "${milestone.title}" ha sido resuelta con división de fondos. Recibirás: $${splitVendor.toFixed(2)}.`;
            }

            if (notes) {
                vendorMessage += ` Notas del administrador: "${notes}"`;
            }

            notifications.push(
                prisma.notification.create({
                    data: {
                        userId: dispute.project.vendor.user.id,
                        type: 'DISPUTE_RESOLVED',
                        title: vendorTitle,
                        message: vendorMessage,
                        actionUrl: `/vendor/projects/${dispute.projectId}`,
                        entityId: id,
                        entityType: 'dispute',
                        actorId: adminId
                    }
                })
            );
        }

        // Execute all notifications
        await Promise.all(notifications);

        // Log action
        await logAdminAction(
            adminId,
            'DISPUTE_RESOLVED',
            'dispute',
            id,
            `Resolved dispute with ${resolution}. ${incidentsUpdated} incidents updated. Notifications sent to both parties.`,
            { resolution, splitClient, splitVendor, incidentsUpdated, notificationsSent: notifications.length }
        );

        res.json({
            success: true,
            dispute: resolvedDispute,
            incidentsUpdated,
            notificationsSent: notifications.length,
            milestoneStatus: newMilestoneStatus
        });
    } catch (error) {
        console.error('Error resolving dispute:', error);
        res.status(500).json({ message: 'Error resolviendo disputa' });
    }
};

// PUT /admin/disputes/:id/review
export const reviewDispute = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { adminNotes } = req.body;
        const adminId = (req as any).user?.userId;

        const dispute = await prisma.dispute.findUnique({
            where: { id },
            include: { project: true }
        });

        if (!dispute) {
            return res.status(404).json({ message: 'Disputa no encontrada' });
        }

        // Validate that dispute is in OPEN state
        if (dispute.status !== 'OPEN') {
            return res.status(400).json({
                message: `No se puede iniciar revisión de una disputa en estado ${dispute.status}`
            });
        }

        // Update dispute to IN_PROGRESS
        const updatedDispute = await prisma.dispute.update({
            where: { id },
            data: {
                status: 'IN_PROGRESS'
            }
        });

        // Find related incidents (vendor and client)
        // The resolution field contains "Disputa creada: {disputeId}"
        const relatedIncidents = await prisma.incident.findMany({
            where: {
                resolution: {
                    contains: id
                },
                type: 'DISPUTE'
            }
        });

        // Update incidents to "EN TRÁMITE" status
        let incidentsUpdated = 0;
        if (relatedIncidents.length > 0) {
            const updateResult = await prisma.incident.updateMany({
                where: {
                    id: {
                        in: relatedIncidents.map(inc => inc.id)
                    }
                },
                data: {
                    status: 'IN_PROGRESS',
                    resolution: `Disputa creada: ${id}. Estado: En revisión por administrador.`,
                    disputeId: id
                }
            });
            incidentsUpdated = updateResult.count;
        }

        // Log action
        await logAdminAction(
            adminId,
            'DISPUTE_REVIEW_STARTED',
            'dispute',
            id,
            `Started review of dispute. ${incidentsUpdated} incidents updated to EN TRÁMITE`,
            { adminNotes, incidentsUpdated }
        );

        res.json({
            success: true,
            dispute: updatedDispute,
            incidentsUpdated
        });
    } catch (error) {
        console.error('Error starting dispute review:', error);
        res.status(500).json({ message: 'Error iniciando revisión de disputa' });
    }
};


// PATCH /admin/disputes/:id/status
export const updateDisputeStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const adminId = (req as any).user?.userId;

        if (!status) {
            return res.status(400).json({ message: 'Status es requerido' });
        }

        // Validate status value
        const validStatuses = ['OPEN', 'IN_PROGRESS', 'INVESTIGATING', 'RESOLVED', 'CANCELLED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Status inválido' });
        }

        const dispute = await prisma.dispute.findUnique({
            where: { id }
        });

        if (!dispute) {
            return res.status(404).json({ message: 'Disputa no encontrada' });
        }

        // Validate status transitions (can't go from RESOLVED back to active states)
        if (dispute.status === 'RESOLVED' && status !== 'RESOLVED') {
            return res.status(400).json({
                message: 'No se puede cambiar el estado de una disputa ya resuelta'
            });
        }

        // Update status
        const updatedDispute = await prisma.dispute.update({
            where: { id },
            data: { status }
        });

        // Log action
        await logAdminAction(
            adminId,
            'DISPUTE_STATUS_CHANGED',
            'dispute',
            id,
            `Changed dispute status from ${dispute.status} to ${status}`
        );

        res.json(updatedDispute);
    } catch (error) {
        console.error('Error updating dispute status:', error);
        res.status(500).json({ message: 'Error actualizando estado de disputa' });
    }
};

// GET /admin/disputes/stats
export const getDisputeStats = async (req: Request, res: Response) => {
    try {
        const [
            totalActive,
            totalResolved,
            allResolvedDisputes,
            totalAmountDisputed,
            resolutionCounts
        ] = await Promise.all([
            // Total active disputes (not RESOLVED or CANCELLED)
            prisma.dispute.count({
                where: {
                    status: {
                        notIn: ['RESOLVED', 'CANCELLED']
                    }
                }
            }),
            // Total resolved disputes
            prisma.dispute.count({
                where: {
                    status: 'RESOLVED'
                }
            }),
            // All resolved disputes for average calculation
            prisma.dispute.findMany({
                where: {
                    status: 'RESOLVED',
                    resolvedAt: { not: null }
                },
                select: {
                    createdAt: true,
                    resolvedAt: true
                }
            }),
            // Total amount in active disputes
            prisma.dispute.aggregate({
                where: {
                    status: {
                        notIn: ['RESOLVED', 'CANCELLED']
                    }
                },
                _sum: {
                    amount: true
                }
            }),
            // Count by resolution type
            prisma.dispute.groupBy({
                by: ['resolution'],
                where: {
                    status: 'RESOLVED',
                    resolution: { not: null }
                },
                _count: true
            })
        ]);

        // Calculate average resolution time in days
        let avgResolutionTime = 0;
        if (allResolvedDisputes.length > 0) {
            const totalDays = allResolvedDisputes.reduce((sum, dispute) => {
                if (dispute.resolvedAt) {
                    const days = Math.floor(
                        (dispute.resolvedAt.getTime() - dispute.createdAt.getTime()) / (1000 * 60 * 60 * 24)
                    );
                    return sum + days;
                }
                return sum;
            }, 0);
            avgResolutionTime = Math.round(totalDays / allResolvedDisputes.length);
        }

        // Calculate resolution distribution
        const resolutionDistribution = {
            refund: 0,
            release: 0,
            split: 0
        };

        resolutionCounts.forEach(item => {
            if (item.resolution === 'REFUND_CLIENT') {
                resolutionDistribution.refund = item._count;
            } else if (item.resolution === 'RELEASE_VENDOR') {
                resolutionDistribution.release = item._count;
            } else if (item.resolution === 'SPLIT_CUSTOM') {
                resolutionDistribution.split = item._count;
            }
        });

        res.json({
            totalActive,
            totalResolved,
            avgResolutionTime,
            totalAmountDisputed: totalAmountDisputed._sum.amount || 0,
            resolutionDistribution
        });
    } catch (error) {
        console.error('Error getting dispute stats:', error);
        res.status(500).json({ message: 'Error obteniendo estadísticas de disputas' });
    }
};
