import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getNotifications = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(403).json({ message: "Unauthorized" });

        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        res.json(notifications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching notifications" });
    }
};

export const markAsRead = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;

        await prisma.notification.updateMany({
            where: { id, userId },
            data: { isRead: true }
        });

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating notification" });
    }
};

export const markAllAsRead = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(403).json({ message: "Unauthorized" });

        await prisma.notification.updateMany({
            where: { userId },
            data: { isRead: true }
        });

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating notifications" });
    }
};
