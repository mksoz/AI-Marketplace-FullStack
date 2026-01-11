export interface Notification {
    id: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    actionUrl?: string;
    entityId?: string;
    entityType?: string;
    actorId?: string;
    actor?: {
        id: string;
        email: string;
        role: string;
    };
    isRead: boolean;
    readAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface NotificationFilters {
    limit?: number;
    offset?: number;
    isRead?: boolean;
    types?: string; // comma-separated string
}
