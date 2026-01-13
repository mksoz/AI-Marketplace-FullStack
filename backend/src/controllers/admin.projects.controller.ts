import { Request, Response } from 'express';
import { PrismaClient, ProjectStatus } from '@prisma/client';
import { logAdminAction } from '../middlewares/admin-auth.middleware';

const prisma = new PrismaClient();

// GET /admin/projects - List all projects with filters
export const getProjects = async (req: Request, res: Response) => {
    try {
        const {
            status,
            clientId,
            vendorId,
            search,
            minBudget,
            maxBudget,
            startDate,
            endDate,
            page = '1',
            limit = '20'
        } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        // Build where clause
        const where: any = {};

        if (status) where.status = status;
        if (clientId) where.clientId = clientId;
        if (vendorId) where.vendorId = vendorId;
        if (search) {
            where.OR = [
                { title: { contains: search as string, mode: 'insensitive' } },
                { description: { contains: search as string, mode: 'insensitive' } }
            ];
        }
        if (minBudget || maxBudget) {
            where.budget = {};
            if (minBudget) where.budget.gte = parseFloat(minBudget as string);
            if (maxBudget) where.budget.lte = parseFloat(maxBudget as string);
        }
        if (startDate) where.createdAt = { gte: new Date(startDate as string) };
        if (endDate) where.createdAt = { ...where.createdAt, lte: new Date(endDate as string) };

        const [projects, total] = await Promise.all([
            prisma.project.findMany({
                where,
                skip,
                take: limitNum,
                include: {
                    client: {
                        include: {
                            user: { select: { email: true } }
                        }
                    },
                    vendor: {
                        include: {
                            user: { select: { email: true } }
                        }
                    },
                    milestones: {
                        select: {
                            id: true,
                            status: true,
                            isPaid: true
                        }
                    },
                    proposals: {
                        select: {
                            id: true,
                            status: true
                        }
                    },
                    contract: {
                        select: {
                            status: true,
                            clientSigned: true,
                            vendorSigned: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.project.count({ where })
        ]);

        res.json({
            projects,
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum)
        });
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ message: 'Error fetching projects' });
    }
};

// GET /admin/projects/:id - Get project details
export const getProject = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const project = await prisma.project.findUnique({
            where: { id },
            include: {
                client: {
                    include: {
                        user: { select: { email: true, id: true } }
                    }
                },
                vendor: {
                    include: {
                        user: { select: { email: true, id: true } }
                    }
                },
                milestones: {
                    include: {
                        paymentRequest: true,
                        deliverableFolders: true
                    },
                    orderBy: { order: 'asc' }
                },
                proposals: {
                    include: {
                        vendor: {
                            include: {
                                user: { select: { email: true } }
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                },
                contract: {
                    include: {
                        versions: {
                            orderBy: { versionNumber: 'desc' }
                        }
                    }
                },
                incidents: {
                    orderBy: { createdAt: 'desc' }
                },
                disputes: true,
                conversation: {
                    include: {
                        messages: {
                            take: 50,
                            orderBy: { createdAt: 'desc' }
                        }
                    }
                }
            }
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.json(project);
    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({ message: 'Error fetching project details' });
    }
};

// PUT /admin/projects/:id/status - Change project status
export const updateProjectStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, reason } = req.body;
        const adminId = (req as any).user?.userId;

        if (!status || !reason) {
            return res.status(400).json({ message: 'Status and reason are required' });
        }

        // Validate status
        const validStatuses = Object.values(ProjectStatus);
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const project = await prisma.project.findUnique({
            where: { id },
            select: { status: true, title: true }
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const updatedProject = await prisma.project.update({
            where: { id },
            data: { status }
        });

        // Log admin action
        await logAdminAction(
            adminId,
            'PROJECT_STATUS_CHANGED',
            'project',
            id,
            `Changed project status from ${project.status} to ${status}. Reason: ${reason}`
        );

        res.json({
            message: 'Project status updated',
            project: updatedProject
        });
    } catch (error) {
        console.error('Error updating project status:', error);
        res.status(500).json({ message: 'Error updating project status' });
    }
};

// PUT /admin/projects/:id/assign-vendor - Reassign vendor
export const assignVendor = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { vendorId, reason } = req.body;
        const adminId = (req as any).user?.userId;

        if (!vendorId || !reason) {
            return res.status(400).json({ message: 'Vendor ID and reason are required' });
        }

        // Verify vendor exists
        const vendor = await prisma.vendorProfile.findUnique({
            where: { id: vendorId }
        });

        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }

        const project = await prisma.project.update({
            where: { id },
            data: { vendorId }
        });

        await logAdminAction(
            adminId,
            'PROJECT_VENDOR_REASSIGNED',
            'project',
            id,
            `Reassigned project to vendor ${vendorId}. Reason: ${reason}`
        );

        res.json({
            message: 'Vendor assigned successfully',
            project
        });
    } catch (error) {
        console.error('Error assigning vendor:', error);
        res.status(500).json({ message: 'Error assigning vendor' });
    }
};

// POST /admin/projects/:id/cancel - Cancel project with optional refund
export const cancelProject = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { reason, refundPercentage = 100 } = req.body;
        const adminId = (req as any).user?.userId;

        if (!reason) {
            return res.status(400).json({ message: 'Cancellation reason is required' });
        }

        const project = await prisma.project.findUnique({
            where: { id },
            include: {
                milestones: {
                    include: {
                        paymentRequest: {
                            include: {
                                transaction: true
                            }
                        }
                    }
                }
            }
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Calculate refund amount based on paid milestones
        const paidMilestones = project.milestones.filter(m => m.isPaid);
        const totalPaid = paidMilestones.reduce((sum, m) => sum + m.amount, 0);
        const refundAmount = (totalPaid * refundPercentage) / 100;

        // Update project status
        await prisma.project.update({
            where: { id },
            data: {
                status: ProjectStatus.CANCELLED,
                rejectionReason: reason
            }
        });

        // TODO: Process refund if refundAmount > 0
        // This would involve creating a REFUND transaction

        await logAdminAction(
            adminId,
            'PROJECT_CANCELLED',
            'project',
            id,
            `Cancelled project. Reason: ${reason}. Refund: ${refundPercentage}% (${refundAmount})`
        );

        res.json({
            message: 'Project cancelled successfully',
            refundAmount
        });
    } catch (error) {
        console.error('Error cancelling project:', error);
        res.status(500).json({ message: 'Error cancelling project' });
    }
};

// DELETE /admin/projects/:id - Delete project (SUPER_ADMIN only)
export const deleteProject = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const adminId = (req as any).user?.userId;

        if (!reason) {
            return res.status(400).json({ message: 'Deletion reason is required' });
        }

        const project = await prisma.project.findUnique({
            where: { id },
            select: { title: true, status: true }
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Prevent deletion of active projects
        if (project.status === ProjectStatus.IN_PROGRESS) {
            return res.status(400).json({
                message: 'Cannot delete active project. Cancel it first.'
            });
        }

        await logAdminAction(
            adminId,
            'PROJECT_DELETED',
            'project',
            id,
            `Deleted project "${project.title}". Reason: ${reason}`
        );

        await prisma.project.delete({ where: { id } });

        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ message: 'Error deleting project' });
    }
};

// POST /admin/projects/:id/notify - Send notification to project parties
export const notifyProjectParties = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, message, recipients } = req.body; // recipients: ['client', 'vendor', 'both']
        const adminId = (req as any).user?.userId;

        if (!title || !message || !recipients) {
            return res.status(400).json({ message: 'Title, message, and recipients are required' });
        }

        const project = await prisma.project.findUnique({
            where: { id },
            include: {
                client: { include: { user: true } },
                vendor: { include: { user: true } }
            }
        });

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const notifications = [];

        if (recipients.includes('client') || recipients.includes('both')) {
            notifications.push(
                prisma.notification.create({
                    data: {
                        userId: project.client.userId,
                        type: 'SYSTEM_WARNING',
                        title,
                        message,
                        entityType: 'project',
                        entityId: id,
                        actionUrl: `/client/projects/${id}`
                    }
                })
            );
        }

        if ((recipients.includes('vendor') || recipients.includes('both')) && project.vendor) {
            notifications.push(
                prisma.notification.create({
                    data: {
                        userId: project.vendor.userId,
                        type: 'INCIDENT_CREATED',
                        title,
                        message,
                        entityType: 'project',
                        entityId: id,
                        actionUrl: `/vendor/projects/${id}`
                    }
                })
            );
        }

        await Promise.all(notifications);

        await logAdminAction(
            adminId,
            'PROJECT_NOTIFICATION_SENT',
            'project',
            id,
            `Sent notification to ${recipients}: ${title}`
        );

        res.json({ message: 'Notifications sent successfully' });
    } catch (error) {
        console.error('Error sending notifications:', error);
        res.status(500).json({ message: 'Error sending notifications' });
    }
};
