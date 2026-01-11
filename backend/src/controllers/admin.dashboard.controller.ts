import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /admin/dashboard/stats
export const getStats = async (req: Request, res: Response) => {
    try {
        // Calculate GMV (Gross Merchandise Value)
        const gmv = await prisma.project.aggregate({
            where: {
                status: { in: ['IN_PROGRESS', 'COMPLETED'] }
            },
            _sum: { budget: true }
        });

        // Calculate Net Revenue (platform fees from completed projects)
        // This is a simplified version - you'd calculate actual fees collected
        const completedProjects = await prisma.project.findMany({
            where: { status: 'COMPLETED' },
            select: { budget: true }
        });

        // Assuming 15% average take rate
        const netRevenue = completedProjects.reduce((sum, p) => sum + (p.budget * 0.15), 0);

        // Calculate liquidity (average time to hire)
        const projectsWithDates = await prisma.project.findMany({
            where: {
                status: { not: 'OPEN' },
                startDate: { not: null }
            },
            select: {
                createdAt: true,
                startDate: true
            }
        });

        const avgDaysToHire = projectsWithDates.length > 0
            ? projectsWithDates.reduce((sum, p) => {
                const days = Math.floor((new Date(p.startDate!).getTime() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                return sum + days;
            }, 0) / projectsWithDates.length
            : 0;

        // Count open disputes
        const openDisputes = await prisma.dispute.count({
            where: { status: { in: ['OPEN', 'INVESTIGATING'] } }
        });

        // Active users (logged in last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const activeUsers = await prisma.user.count({
            where: {
                lastLoginAt: { gte: thirtyDaysAgo }
            }
        });

        res.json({
            gmv: gmv._sum.budget || 0,
            netRevenue,
            liquidity: avgDaysToHire,
            openDisputes,
            activeUsers
        });
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        res.status(500).json({ message: 'Error obteniendo estadísticas' });
    }
};

// GET /admin/dashboard/activity
export const getActivity = async (req: Request, res: Response) => {
    try {
        // Get recent admin actions
        const recentActions = await prisma.adminAction.findMany({
            take: 20,
            orderBy: { createdAt: 'desc' },
            include: {
                admin: {
                    include: {
                        user: {
                            select: { email: true }
                        }
                    }
                }
            }
        });

        res.json(recentActions);
    } catch (error) {
        console.error('Error getting activity:', error);
        res.status(500).json({ message: 'Error obteniendo actividad' });
    }
};

// GET /admin/dashboard/health
export const getHealth = async (req: Request, res: Response) => {
    try {
        // Simple health check
        // In production, you'd check actual metrics from monitoring services

        const health = {
            apiLatency: Math.random() * 100, // Mock
            errorRate: Math.random() * 1, // Mock
            activeConnections: Math.floor(Math.random() * 200), // Mock
            databaseStatus: 'healthy'
        };

        res.json(health);
    } catch (error) {
        console.error('Error getting health:', error);
        res.status(500).json({ message: 'Error obteniendo salud del sistema' });
    }
};

// GET /admin/dashboard/moderation-queue
export const getModerationQueue = async (req: Request, res: Response) => {
    try {
        // Items pending moderation
        const items = [];

        // Vendors waiting for verification (example)
        const pendingVendors = await prisma.vendorProfile.count({
            // Add your verification status field if you have one
        });

        // Open disputes
        const openDisputes = await prisma.dispute.findMany({
            where: { status: 'OPEN' },
            take: 5,
            include: {
                project: {
                    select: { title: true }
                }
            }
        });

        res.json({
            pendingVendors,
            openDisputes: openDisputes.map(d => ({
                id: d.id,
                type: 'dispute',
                title: d.project.title,
                createdAt: d.createdAt
            }))
        });
    } catch (error) {
        console.error('Error getting moderation queue:', error);
        res.status(500).json({ message: 'Error obteniendo cola de moderación' });
    }
};
