import { Request, Response } from 'express';
import notificationService from '../services/notification.service';
import { NotificationType } from '@prisma/client';

export const getNotifications = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        const { limit, offset, isRead, types } = req.query;

        const options: any = {};
        if (limit) options.limit = parseInt(limit as string);
        if (offset) options.offset = parseInt(offset as string);
        if (isRead === 'true') options.isRead = true;
        else if (isRead === 'false') options.isRead = false;
        if (types) options.types = (types as string).split(',') as NotificationType[];

        const notifications = await notificationService.getUserNotifications(user.userId, options);

        res.json(notifications);
    } catch (error: any) {
        console.error('Get notifications error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const getUnreadCount = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        const count = await notificationService.getUnreadCount(user.userId);
        res.json({ count });
    } catch (error: any) {
        console.error('Get unread count error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const markAsRead = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        const { id } = req.params;
        const notification = await notificationService.markAsRead(id, user.userId);

        res.json(notification);
    } catch (error: any) {
        console.error('Mark as read error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const markAllAsRead = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        const count = await notificationService.markAllAsRead(user.userId);
        res.json({ count, message: 'All notifications marked as read' });
    } catch (error: any) {
        console.error('Mark all as read error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const deleteNotification = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        const { id } = req.params;
        await notificationService.deleteNotification(id, user.userId);

        res.json({ message: 'Notification deleted' });
    } catch (error: any) {
        console.error('Delete notification error:', error);
        res.status(500).json({ message: error.message });
    }
};

export const deleteAllRead = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        const count = await notificationService.deleteAllRead(user.userId);
        res.json({ count, message: 'All read notifications deleted' });
    } catch (error: any) {
        console.error('Delete all read error:', error);
        res.status(500).json({ message: error.message });
    }
};
