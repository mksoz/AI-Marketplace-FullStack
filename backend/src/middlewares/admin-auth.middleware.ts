import { Request, Response, NextFunction } from 'express';
import { PrismaClient, AdminPermission } from '@prisma/client';
import { authenticateJWT } from './auth.middleware';

const prisma = new PrismaClient();

// Middleware to check if user is admin
export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
    // First authenticate the JWT
    authenticateJWT(req, res, async () => {
        try {
            const userId = (req as any).user?.userId;

            if (!userId) {
                return res.status(401).json({ message: 'No autenticado' });
            }

            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { role: true }
            });

            if (user?.role !== 'ADMIN') {
                return res.status(403).json({ message: 'Acceso denegado. Se requieren permisos de administrador.' });
            }

            next();
        } catch (error) {
            console.error('Admin auth middleware error:', error);
            res.status(500).json({ message: 'Error de autenticación' });
        }
    });
};

// Middleware to check specific admin permission
export const requirePermission = (permission: AdminPermission) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user?.userId;

            const adminProfile = await prisma.adminProfile.findUnique({
                where: { userId }
            });

            if (!adminProfile) {
                return res.status(403).json({ message: 'Perfil de administrador no encontrado' });
            }

            // SUPER_ADMIN has all permissions
            if (adminProfile.permissions.includes('SUPER_ADMIN') ||
                adminProfile.permissions.includes(permission)) {
                return next();
            }

            return res.status(403).json({
                message: `Se requiere el permiso: ${permission}`
            });
        } catch (error) {
            console.error('Permission middleware error:', error);
            res.status(500).json({ message: 'Error verificando permisos' });
        }
    };
};

// Helper to log admin actions
export const logAdminAction = async (
    adminId: string,
    type: string,
    targetType: string,
    targetId: string,
    details: string,
    metadata?: any
) => {
    try {
        await prisma.adminAction.create({
            data: {
                adminId,
                type: type as any,
                targetType,
                targetId,
                details,
                metadata: metadata || undefined
            }
        });
    } catch (error) {
        console.error('Error logging admin action:', error);
    }
};
