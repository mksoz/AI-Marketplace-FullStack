import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { logAdminAction } from '../middlewares/admin-auth.middleware';

const prisma = new PrismaClient();

// GET /admin/metrics/general
export const getGeneralMetrics = async (req: Request, res: Response) => {
    try {
        const { timeRange = '30d' } = req.query;

        // Calculate date range
        const endDate = new Date();
        let startDate = new Date();

        switch (timeRange) {
            case '7d':
                startDate.setDate(endDate.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(endDate.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(endDate.getDate() - 90);
                break;
            case '1y':
                startDate.setFullYear(endDate.getFullYear() - 1);
                break;
        }

        // GMV (Gross Merchandise Value)
        const gmv = await prisma.project.aggregate({
            where: {
                createdAt: { gte: startDate, lte: endDate },
                status: { in: ['IN_PROGRESS', 'COMPLETED'] }
            },
            _sum: { budget: true }
        });

        // Net Revenue (simplified - assuming 15% platform fee)
        const netRevenue = (gmv._sum.budget || 0) * 0.15;

        // Liquidity - Average days from project creation to start
        const projectsWithStart = await prisma.project.findMany({
            where: {
                createdAt: { gte: startDate, lte: endDate },
                startDate: { not: null }
            },
            select: {
                createdAt: true,
                startDate: true
            }
        });

        const avgLiquidity = projectsWithStart.length > 0
            ? projectsWithStart.reduce((sum, p) => {
                const days = Math.floor((new Date(p.startDate!).getTime() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                return sum + days;
            }, 0) / projectsWithStart.length
            : 0;

        // Vendor Retention (vendors who completed at least 2 projects)
        const vendorsWithMultipleProjects = await prisma.vendorProfile.findMany({
            where: {
                projects: {
                    some: {
                        status: 'COMPLETED'
                    }
                }
            },
            select: {
                _count: {
                    select: {
                        projects: {
                            where: {
                                status: 'COMPLETED'
                            }
                        }
                    }
                }
            }
        });

        const retainedVendors = vendorsWithMultipleProjects.filter(v => v._count.projects >= 2).length;
        const totalVendors = vendorsWithMultipleProjects.length || 1;
        const vendorRetention = (retainedVendors / totalVendors) * 100;

        res.json({
            gmv: gmv._sum.budget || 0,
            netRevenue,
            liquidity: avgLiquidity,
            vendorRetention,
            timeRange
        });
    } catch (error) {
        console.error('Error getting general metrics:', error);
        res.status(500).json({ message: 'Error obteniendo métricas' });
    }
};

// GET /admin/metrics/tech-trends
export const getTechTrends = async (req: Request, res: Response) => {
    try {
        // Analyze skills/tags from projects (simplified version)
        // In production, you'd track skill demand over time

        const trends = [
            { name: 'RAG Frameworks', growth: '+240%', volume: 'High', status: 'Exploding' },
            { name: 'AutoGPT / Agents', growth: '+180%', volume: 'Med', status: 'Rising' },
            { name: 'Computer Vision', growth: '+45%', volume: 'High', status: 'Stable' },
            { name: 'Basic Chatbots', growth: '-15%', volume: 'Med', status: 'Declining' }
        ];

        res.json(trends);
    } catch (error) {
        console.error('Error getting tech trends:', error);
        res.status(500).json({ message: 'Error obteniendo tendencias tecnológicas' });
    }
};

// GET /admin/metrics/pricing-heatmap
export const getPricingHeatmap = async (req: Request, res: Response) => {
    try {
        // Analyze pricing by region and role (simplified)
        // In production, you'd aggregate actual contract data

        const heatmap = [
            { role: 'ML Engineer', latam: '$45-70', na: '$120-180', eu: '$90-140' },
            { role: 'AI Product Mgr', latam: '$40-60', na: '$110-160', eu: '$80-120' },
            { role: 'Data Scientist', latam: '$35-55', na: '$100-150', eu: '$70-110' }
        ];

        res.json(heatmap);
    } catch (error) {
        console.error('Error getting pricing heatmap:', error);
        res.status(500).json({ message: 'Error obteniendo mapa de precios' });
    }
};

// POST /admin/reports/vendor/generate
export const generateVendorReport = async (req: Request, res: Response) => {
    try {
        const { vendorId, config } = req.body;
        const adminId = (req as any).user?.userId;

        if (!vendorId) {
            return res.status(400).json({ message: 'Vendor ID es requerido' });
        }

        const vendor = await prisma.vendorProfile.findUnique({
            where: { id: vendorId },
            include: {
                projects: {
                    where: { status: 'COMPLETED' }
                }
            }
        });

        if (!vendor) {
            return res.status(404).json({ message: 'Vendor no encontrado' });
        }

        // Calculate metrics
        const completedProjects = vendor.projects.length;
        const totalProposals = await prisma.proposal.count({
            where: { vendorId }
        });

        const winRate = totalProposals > 0 ? (completedProjects / totalProposals) * 100 : 0;

        const avgTicket = completedProjects > 0
            ? vendor.projects.reduce((sum, p) => sum + p.budget, 0) / completedProjects
            : 0;

        // Create report
        const report = await prisma.vendorReport.create({
            data: {
                vendorId,
                generatedBy: adminId,
                config: config || {},
                rank: 'Top 15%', // Simplified
                winRate,
                avgTicket,
                qualityScore: 4.5, // Simplified
                benchmarkData: {
                    funnel: [],
                    opportunities: []
                }
            }
        });

        // Log action
        await logAdminAction(
            adminId,
            'REPORT_GENERATED',
            'report',
            report.id,
            `Generated report for vendor ${vendorId}`
        );

        res.status(201).json(report);
    } catch (error) {
        console.error('Error generating vendor report:', error);
        res.status(500).json({ message: 'Error generando reporte' });
    }
};

// GET /admin/reports/vendor/:reportId
export const getVendorReport = async (req: Request, res: Response) => {
    try {
        const { reportId } = req.params;

        const report = await prisma.vendorReport.findUnique({
            where: { id: reportId },
            include: {
                vendor: {
                    select: {
                        companyName: true,
                        hourlyRate: true
                    }
                }
            }
        });

        if (!report) {
            return res.status(404).json({ message: 'Reporte no encontrado' });
        }

        res.json(report);
    } catch (error) {
        console.error('Error getting vendor report:', error);
        res.status(500).json({ message: 'Error obteniendo reporte' });
    }
};

// GET /admin/reports/revenue
export const getReportRevenue = async (req: Request, res: Response) => {
    try {
        const paidReports = await prisma.vendorReport.aggregate({
            where: {
                paidAt: { not: null }
            },
            _sum: { price: true },
            _count: true
        });

        res.json({
            totalRevenue: paidReports._sum.price || 0,
            reportsSold: paidReports._count
        });
    } catch (error) {
        console.error('Error getting report revenue:', error);
        res.status(500).json({ message: 'Error obteniendo ingresos de reportes' });
    }
};
