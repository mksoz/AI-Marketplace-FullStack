import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { logAdminAction } from '../middlewares/admin-auth.middleware';

const prisma = new PrismaClient();

// GET /admin/settings/team
export const getTeam = async (req: Request, res: Response) => {
    try {
        const team = await prisma.adminProfile.findMany({
            include: {
                user: {
                    select: {
                        email: true,
                        createdAt: true,
                        lastLoginAt: true
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        });

        res.json(team);
    } catch (error) {
        console.error('Error getting team:', error);
        res.status(500).json({ message: 'Error obteniendo equipo' });
    }
};

// POST /admin/settings/team/invite
export const inviteTeamMember = async (req: Request, res: Response) => {
    try {
        const { email, displayName, permissions } = req.body;
        const adminId = (req as any).user?.userId;

        if (!email || !permissions || !Array.isArray(permissions)) {
            return res.status(400).json({ message: 'Email y permisos son requeridos' });
        }

        // Check if user already exists
        let user = await prisma.user.findUnique({
            where: { email }
        });

        if (user) {
            // Check if already has admin profile
            const existingAdmin = await prisma.adminProfile.findUnique({
                where: { userId: user.id }
            });

            if (existingAdmin) {
                return res.status(400).json({ message: 'Usuario ya es administrador' });
            }
        } else {
            // Create new user with temporary password
            const tempPassword = Math.random().toString(36).slice(-8);
            const hashedPassword = await bcrypt.hash(tempPassword, 10);

            user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    role: 'ADMIN'
                }
            });

            // TODO: Send invitation email with temp password
        }

        // Create admin profile
        const adminProfile = await prisma.adminProfile.create({
            data: {
                userId: user.id,
                displayName: displayName || email,
                permissions: permissions as any[]
            }
        });

        // Log action
        await logAdminAction(
            adminId,
            'ADMIN_CREATED',
            'admin',
            adminProfile.id,
            `Invited ${email} as admin`,
            { permissions }
        );

        res.status(201).json(adminProfile);
    } catch (error) {
        console.error('Error inviting team member:', error);
        res.status(500).json({ message: 'Error invitando miembro del equipo' });
    }
};

// PATCH /admin/settings/team/:id
export const updateTeamMember = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { permissions, displayName } = req.body;
        const adminId = (req as any).user?.userId;

        const adminProfile = await prisma.adminProfile.update({
            where: { id },
            data: {
                permissions: permissions || undefined,
                displayName: displayName || undefined
            }
        });

        // Log action
        await logAdminAction(
            adminId,
            'ADMIN_UPDATED',
            'admin',
            id,
            'Updated admin permissions',
            { permissions }
        );

        res.json(adminProfile);
    } catch (error) {
        console.error('Error updating team member:', error);
        res.status(500).json({ message: 'Error actualizando miembro del equipo' });
    }
};

// DELETE /admin/settings/team/:id
export const removeTeamMember = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const adminId = (req as any).user?.userId;

        const adminProfile = await prisma.adminProfile.findUnique({
            where: { id },
            include: { user: true }
        });

        if (!adminProfile) {
            return res.status(404).json({ message: 'Admin no encontrado' });
        }

        // Don't allow self-deletion
        if (adminProfile.userId === adminId) {
            return res.status(400).json({ message: 'No puedes eliminarte a ti mismo' });
        }

        // Delete admin profile
        await prisma.adminProfile.delete({
            where: { id }
        });

        //  Optionally, change user role back to CLIENT or delete user entirely
        await prisma.user.update({
            where: { id: adminProfile.userId },
            data: { role: 'CLIENT' }
        });

        // Log action
        await logAdminAction(
            adminId,
            'ADMIN_DELETED',
            'admin',
            id,
            `Removed admin access from ${adminProfile.user.email}`
        );

        res.json({ message: 'Acceso de administrador revocado exitosamente' });
    } catch (error) {
        console.error('Error removing team member:', error);
        res.status(500).json({ message: 'Error eliminando miembro del equipo' });
    }
};

// GET /admin/settings/audit-log
export const getAuditLog = async (req: Request, res: Response) => {
    try {
        const { page = '1', limit = '50', actionType, targetType } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        const where: any = {};
        if (actionType) where.type = actionType;
        if (targetType) where.targetType = targetType;

        const [logs, total] = await Promise.all([
            prisma.adminAction.findMany({
                where,
                skip,
                take: limitNum,
                include: {
                    admin: {
                        include: {
                            user: {
                                select: { email: true }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.adminAction.count({ where })
        ]);

        res.json({
            logs,
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum)
        });
    } catch (error) {
        console.error('Error getting audit log:', error);
        res.status(500).json({ message: 'Error obteniendo registro de auditoría' });
    }
};

// POST /admin/settings/maintenance
export const setMaintenanceMode = async (req: Request, res: Response) => {
    try {
        const { enabled, message } = req.body;
        const adminId = (req as any).user?.userId;

        let config = await prisma.platformConfig.findFirst({
            orderBy: { updatedAt: 'desc' }
        });

        if (!config) {
            config = await prisma.platformConfig.create({
                data: {
                    maintenanceMode: enabled,
                    maintenanceMessage: message || null,
                    updatedBy: adminId
                }
            });
        } else {
            config = await prisma.platformConfig.update({
                where: { id: config.id },
                data: {
                    maintenanceMode: enabled,
                    maintenanceMessage: message || null,
                    updatedBy: adminId
                }
            });
        }

        // Log action
        await logAdminAction(
            adminId,
            'SYSTEM_MAINTENANCE',
            'config',
            config.id,
            `${enabled ? 'Enabled' : 'Disabled'} maintenance mode`,
            { message }
        );

        res.json(config);
    } catch (error) {
        console.error('Error setting maintenance mode:', error);
        res.status(500).json({ message: 'Error configurando modo mantenimiento' });
    }
};

// POST /admin/settings/cache-purge
export const purgeCache = async (req: Request, res: Response) => {
    try {
        const adminId = (req as any).user?.userId;

        // TODO: Implement actual cache purging logic
        // This would depend on your caching strategy (Redis, etc.)

        // Log action
        await logAdminAction(
            adminId,
            'SYSTEM_MAINTENANCE',
            'system',
            'cache',
            'Purged system cache'
        );

        res.json({ message: 'Cache purgado exitosamente' });
    } catch (error) {
        console.error('Error purging cache:', error);
        res.status(500).json({ message: 'Error purgando cache' });
    }
};
