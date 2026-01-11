import { useState, useEffect } from 'react';
import api from '../services/api';

export const useUnreadMessagesCount = (refreshInterval = 30000) => {
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchCount = async () => {
        try {
            setLoading(true);
            const response = await api.get('/chats/unread-count');
            setCount(response.data.count || 0);
        } catch (error) {
            console.error('Failed to fetch unread messages count', error);
            setCount(0);
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
