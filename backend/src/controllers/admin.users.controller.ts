import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { logAdminAction } from '../middlewares/admin-auth.middleware';

const prisma = new PrismaClient();

// GET /admin/users
export const getUsers = async (req: Request, res: Response) => {
    try {
        const { role, status, search, page = '1', limit = '20' } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        // Build where clause
        const where: any = {};

        if (role && role !== 'all') {
            where.role = role;
        }

        if (search) {
            where.OR = [
                { email: { contains: search as string, mode: 'insensitive' } },
                { clientProfile: { companyName: { contains: search as string, mode: 'insensitive' } } },
                { vendorProfile: { companyName: { contains: search as string, mode: 'insensitive' } } }
            ];
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limitNum,
                include: {
                    clientProfile: {
                        select: {
                            companyName: true,
                            logoUrl: true,
                            country: true,
                            city: true
                        }
                    },
                    vendorProfile: {
                        select: {
                            companyName: true,
                            logoUrl: true,
                            hourlyRate: true,
                            country: true,
                            city: true
                        }
                    },
                    adminProfile: {
                        select: {
                            displayName: true,
                            permissions: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.user.count({ where })
        ]);

        res.json({
            users: users.map(u => ({
                id: u.id,
                email: u.email,
                role: u.role,
                status: 'active', // Add actual status field if needed
                createdAt: u.createdAt,
                lastLoginAt: u.lastLoginAt,
                companyName: u.clientProfile?.companyName || u.vendorProfile?.companyName || null,
                logoUrl: u.clientProfile?.logoUrl || u.vendorProfile?.logoUrl || null,
                location: u.clientProfile?.city || u.vendorProfile?.city || null,
                hourlyRate: u.vendorProfile?.hourlyRate || null,
                permissions: u.adminProfile?.permissions || null
            })),
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum)
        });
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ message: 'Error obteniendo usuarios' });
    }
};

// GET /admin/users/:id
export const getUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                clientProfile: true,
                vendorProfile: true,
                adminProfile: true,
                _count: {
                    select: {
                        messages: true,
                        notifications: true
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error getting user:', error);
        res.status(500).json({ message: 'Error obteniendo usuario' });
    }
};

// PATCH /admin/users/:id
export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const adminId = (req as any).user?.userId;
        const updates = req.body;

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                email: updates.email,
                // Add other fields as needed
            },
            include: {
                clientProfile: true,
                vendorProfile: true
            }
        });

        // Update profile if provided
        if (updates.companyName && updatedUser.role === 'CLIENT' && updatedUser.clientProfile) {
            await prisma.clientProfile.update({
                where: { id: updatedUser.clientProfile.id },
                data: { companyName: updates.companyName }
            });
        } else if (updates.companyName && updatedUser.role === 'VENDOR' && updatedUser.vendorProfile) {
            await prisma.vendorProfile.update({
                where: { id: updatedUser.vendorProfile.id },
                data: { companyName: updates.companyName }
            });
        }

        // Log action
        await logAdminAction(
            adminId,
            'USER_UPDATED',
            'user',
            id,
            `Updated user ${updatedUser.email}`,
            { updates }
        );

        res.json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Error actualizando usuario' });
    }
};

// POST /admin/users/:id/suspend
export const suspendUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const adminId = (req as any).user?.userId;

        // TODO: Add suspended field to User model or use a separate status table
        // For now, we'll just log the action

        const user = await prisma.user.findUnique({
            where: { id },
            select: { email: true }
        });

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Log suspension
        await logAdminAction(
            adminId,
            'USER_SUSPENDED',
            'user',
            id,
            `Suspended user ${user.email}: ${reason}`,
            { reason }
        );

        res.json({ message: 'Usuario suspendido exitosamente' });
    } catch (error) {
        console.error('Error suspending user:', error);
        res.status(500).json({ message: 'Error suspendiendo usuario' });
    }
};

// POST /admin/users/:id/activate
export const activateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const adminId = (req as any).user?.userId;

        const user = await prisma.user.findUnique({
            where: { id },
            select: { email: true }
        });

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Log activation
        await logAdminAction(
            adminId,
            'USER_ACTIVATED',
            'user',
            id,
            `Activated user ${user.email}`
        );

        res.json({ message: 'Usuario activado exitosamente' });
    } catch (error) {
        console.error('Error activating user:', error);
        res.status(500).json({ message: 'Error activando usuario' });
    }
};

// DELETE /admin/users/:id
export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const adminId = (req as any).user?.userId;

        const user = await prisma.user.findUnique({
            where: { id },
            select: { email: true, role: true }
        });

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Protect admin users from deletion
        if (user.role === 'ADMIN') {
            return res.status(403).json({ message: 'No se puede eliminar cuentas de administrador por seguridad' });
        }

        // Soft delete - just log for now
        // In production, you might want to anonymize data instead of hard delete
        await logAdminAction(
            adminId,
            'USER_DELETED',
            'user',
            id,
            `Deleted user ${user.email} (${user.role})`
        );

        // Hard delete (use with caution)
        await prisma.user.delete({ where: { id } });

        res.json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error eliminando usuario' });
    }
};

// POST /admin/users/create
export const createUser = async (req: Request, res: Response) => {
    try {
        const { email, password, role, companyName } = req.body;
        const adminId = (req as any).user?.userId;

        // Validate required fields
        if (!email || !password || !role) {
            return res.status(400).json({ message: 'Email, password y role son requeridos' });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({ message: 'El email ya está registrado' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role
            }
        });

        // Create profile based on role
        if (role === 'CLIENT') {
            await prisma.clientProfile.create({
                data: {
                    userId: user.id,
                    companyName: companyName || null
                }
            });
        } else if (role === 'VENDOR') {
            await prisma.vendorProfile.create({
                data: {
                    userId: user.id,
                    companyName: companyName || null
                }
            });
        }

        // Log action
        await logAdminAction(
            adminId,
            'USER_CREATED',
            'user',
            user.id,
            `Created user ${email} with role ${role}`
        );

        res.status(201).json({
            message: 'Usuario creado exitosamente',
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Error creando usuario' });
    }
};
