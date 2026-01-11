import { useState, useEffect } from 'react';
import api from '../services/api';

interface UsePendingProposalsReturn {
    count: number;
    loading: boolean;
    refresh: () => void;
}

export const usePendingProposals = (): UsePendingProposalsReturn => {
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchCount = async () => {
        try {
            const response = await api.get('/projects/vendor/requests');
            const proposals = response.data || [];

            // Count proposals in PROPOSED or CONTACTED status (new/pending)
            const pendingCount = proposals.filter((p: any) =>
                p.status === 'PROPOSED' || p.status === 'CONTACTED'
            ).length;

            setCount(pendingCount);
        } catch (error) {
            console.error('Error fetching pending proposals:', error);
            setCount(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCount();

        // Refresh every 30 seconds
        const interval = setInterval(fetchCount, 30000);

        return () => clearInterval(interval);
    }, []);

    return { count, loading, refresh: fetchCount };
};
