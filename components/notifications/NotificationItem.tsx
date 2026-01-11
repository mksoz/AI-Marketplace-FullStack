import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Notification } from '../../types/notification';
import { NOTIFICATION_CONFIG } from '../../constants/notifications';
import { formatTimeAgo } from '../../utils/notificationUtils';

interface NotificationItemProps {
    notification: Notification;
    onRead: (id: string) => void;
    onDelete: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
    notification,
    onRead,
    onDelete,
}) => {
    const navigate = useNavigate();

    const config = NOTIFICATION_CONFIG[notification.type as keyof typeof NOTIFICATION_CONFIG] || {
        icon: 'notifications',
        color: '#6b7280',
        bg: '#f3f4f6',
        category: 'Sistema',
    };

    const timeAgo = formatTimeAgo(notification.createdAt);

    const handleClick = () => {
        if (!notification.isRead) {
            onRead(notification.id);
        }
        if (notification.actionUrl) {
            navigate(notification.actionUrl);
        }
    };

    return (
        <div
            onClick={handleClick}
            className={`group p-4 rounded-xl border transition-all duration-200 ${notification.actionUrl ? 'cursor-pointer' : ''
                } ${notification.isRead
                    ? 'bg-white border-gray-200 hover:border-gray-300'
                    : 'bg-blue-50/50 border-blue-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
        >
            <div className="flex items-start gap-3">
                {/* Icon */}
                <div
                    className="p-2.5 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: config.bg }}
                >
                    <span
                        className="material-symbols-outlined text-xl"
                        style={{ color: config.color }}
                    >
                        {config.icon}
                    </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className={`text-sm font-bold text-gray-900 ${!notification.isRead ? 'font-extrabold' : ''}`}>
                            {notification.title}
                        </h4>
                        <span className="text-xs text-gray-500 flex-shrink-0 whitespace-nowrap">
                            {timeAgo}
                        </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {notification.message}
                    </p>

                    <div className="flex items-center justify-between">
                        <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {config.category}
                        </span>

                        {/* Actions - visible on hover */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notification.isRead && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRead(notification.id);
                                    }}
                                    className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors"
                                    title="Marcar como leída"
                                >
                                    <span className="material-symbols-outlined text-sm text-blue-600">
                                        check
                                    </span>
                                </button>
                            )}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(notification.id);
                                }}
                                className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                                title="Eliminar"
                            >
                                <span className="material-symbols-outlined text-sm text-red-600">
                                    delete
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Unread indicator */}
                {!notification.isRead && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                )}
            </div>
        </div>
    );
};

export default NotificationItem;
