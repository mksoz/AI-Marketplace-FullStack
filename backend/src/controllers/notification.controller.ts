import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get notification preferences
export const getNotificationPreferences = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;

        let preferences = await prisma.notificationPreference.findUnique({
            where: { userId }
        });

        // Create default preferences if none exist
        if (!preferences) {
            preferences = await prisma.notificationPreference.create({
                data: { userId }
            });
        }

        res.json(preferences);
    } catch (error: any) {
        console.error('Error fetching notification preferences:', error);
        res.status(500).json({ message: error.message || 'Failed to fetch preferences' });
    }
};

// Update notification preferences
export const updateNotificationPreferences = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;
        const {
            emailEnabled,
            inAppEnabled,
            smsEnabled,
            projectNotifications,
            messageNotifications,
            paymentNotifications,
            systemNotifications,
            dailyDigest,
            weeklyDigest,
            quietHoursStart,
            quietHoursEnd
        } = req.body;

        // Build update data
        const updateData: any = {};
        if (emailEnabled !== undefined) updateData.emailEnabled = emailEnabled;
        if (inAppEnabled !== undefined) updateData.inAppEnabled = inAppEnabled;
        if (smsEnabled !== undefined) updateData.smsEnabled = smsEnabled;
        if (projectNotifications !== undefined) updateData.projectNotifications = projectNotifications;
        if (messageNotifications !== undefined) updateData.messageNotifications = messageNotifications;
        if (paymentNotifications !== undefined) updateData.paymentNotifications = paymentNotifications;
        if (systemNotifications !== undefined) updateData.systemNotifications = systemNotifications;
        if (dailyDigest !== undefined) updateData.dailyDigest = dailyDigest;
        if (weeklyDigest !== undefined) updateData.weeklyDigest = weeklyDigest;
        if (quietHoursStart !== undefined) updateData.quietHoursStart = quietHoursStart;
        if (quietHoursEnd !== undefined) updateData.quietHoursEnd = quietHoursEnd;

        const preferences = await prisma.notificationPreference.upsert({
            where: { userId },
            update: updateData,
            create: {
                userId,
                ...updateData
            }
        });

        res.json(preferences);
    } catch (error: any) {
        console.error('Error updating notification preferences:', error);
        res.status(500).json({ message: error.message || 'Failed to update preferences' });
    }
};
