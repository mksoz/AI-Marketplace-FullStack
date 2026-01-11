// Helper function to format time ago
export const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Ahora';

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Hace ${minutes} min`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${hours}h`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `Hace ${days}d`;

    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `Hace ${weeks}sem`;

    const months = Math.floor(days / 30);
    if (months < 12) return `Hace ${months}m`;

    const years = Math.floor(days / 365);
    return `Hace ${years}a`;
};

// Helper function to group notifications by date
export const groupNotificationsByDate = (notifications: any[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const groups: { [key: string]: any[] } = {
        Hoy: [],
        Ayer: [],
        'Esta semana': [],
        'Más antiguas': [],
    };

    notifications.forEach(notification => {
        const notifDate = new Date(notification.createdAt);
        notifDate.setHours(0, 0, 0, 0);

        if (notifDate.getTime() === today.getTime()) {
            groups.Hoy.push(notification);
        } else if (notifDate.getTime() === yesterday.getTime()) {
            groups.Ayer.push(notification);
        } else if (notifDate >= weekAgo) {
            groups['Esta semana'].push(notification);
        } else {
            groups['Más antiguas'].push(notification);
        }
    });

    return groups;
};
