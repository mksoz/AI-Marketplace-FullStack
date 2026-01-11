import api from './api';
import { Notification, NotificationFilters } from '../types/notification';

export const notificationService = {
    async getNotifications(filters: NotificationFilters = {}): Promise<Notification[]> {
        const params = new URLSearchParams();
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.offset) params.append('offset', filters.offset.toString());
        if (filters.isRead !== undefined) params.append('isRead', filters.isRead.toString());
        if (filters.types) params.append('types', filters.types); // types is already a string

        const response = await api.get(`/notifications?${params.toString()}`);
        return response.data;
    },

    async getUnreadCount(): Promise<number> {
        const res = await api.get('/notifications/unread-count');
        return res.data.count;
    },

    async markAsRead(id: string): Promise<Notification> {
        const res = await api.patch(`/notifications/${id}/read`);
        return res.data;
    },

    async markAllAsRead(): Promise<number> {
        const res = await api.patch('/notifications/mark-all-read');
        return res.data.count;
    },

    async deleteNotification(id: string): Promise<void> {
        await api.delete(`/notifications/${id}`);
    },

    async deleteAllRead(): Promise<number> {
        const res = await api.delete('/notifications/clear-read');
        return res.data.count;
    },
};
