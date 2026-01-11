import { useState, useEffect } from 'react';
import { notificationService } from '../services/notificationService';

export const useUnreadCount = (refreshInterval = 30000) => {
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchCount = async () => {
        try {
            setLoading(true);
            const data = await notificationService.getUnreadCount();
            setCount(data);
        } catch (error) {
            console.error('Failed to fetch unread count', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCount();

        const interval = setInterval(fetchCount, refreshInterval);
        return () => clearInterval(interval);
    }, [refreshInterval]);

    return {
        count,
        loading,
        refresh: fetchCount,
    };
};
