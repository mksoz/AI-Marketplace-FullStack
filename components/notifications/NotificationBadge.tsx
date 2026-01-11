import React from 'react';

interface NotificationBadgeProps {
    count: number;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ count }) => {
    // Don't render anything, the pulsing effect is handled by the parent
    // This component now just triggers the parent to add the pulse class
    return null;
};

export default NotificationBadge;
