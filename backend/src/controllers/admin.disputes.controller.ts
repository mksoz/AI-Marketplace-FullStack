import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logAdminAction } from '../middlewares/admin-auth.middleware';

const prisma = new PrismaClient();

// GET /admin/disputes
export const getDisputes = async (req: Request, res: Response) => {
    try {
        const { status, search, page = '1', limit = '20' } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};

        if (status && status !== 'all') {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { project: { title: { contains: search as string, mode: 'insensitive' } } },
                { reason: { contains: search as string, mode: 'insensitive' } }
            ];
        }

        const [disputes, total] = await Promise.all([
            prisma.dispute.findMany({
                where,
                skip,
                take: limitNum,
                include: {
                    project: {
                        select: {
                            title: true,
                            budget: true,
                            client: {
                                select: {
                                    companyName: true
                                }
                            },
                            vendor: {
                                select: {
                                    companyName: true
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.dispute.count({ where })
        ]);

        res.json({
            disputes,
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
                        client: true,
                        vendor: true,
                        milestones: true
                    }
                }
            }
        });

        if (!dispute) {
            return res.status(404).json({ message: 'Disputa no encontrada' });
        }

        res.json(dispute);
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
            include: { project: true }
        });

        if (!dispute) {
            return res.status(404).json({ message: 'Disputa no encontrada' });
        }

        if (dispute.status === 'RESOLVED') {
            return res.status(400).json({ message: 'Disputa ya está resuelta' });
        }

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

        // TODO: Implement fund transfer logic based on resolution
        // - REFUND_CLIENT: return all funds to client
        // - RELEASE_VENDOR: release all funds to vendor
        // - SPLIT_CUSTOM: split based on splitClient/splitVendor amounts

        // TODO: Send notifications to both parties

        // Log action
        await logAdminAction(
            adminId,
            'DISPUTE_RESOLVED',
            'dispute',
            id,
            `Resolved dispute with ${resolution}`,
            { resolution, splitClient, splitVendor }
        );

        res.json(resolvedDispute);
    } catch (error) {
        console.error('Error resolving dispute:', error);
        res.status(500).json({ message: 'Error resolviendo disputa' });
    }
};
