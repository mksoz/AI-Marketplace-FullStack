import React, { useState, useEffect } from 'react';
import ClientLayout from '../../components/ClientLayout';
import NotificationItem from '../../components/notifications/NotificationItem';
import { useNotifications } from '../../hooks/useNotifications';
import { groupNotificationsByDate } from '../../utils/notificationUtils';

const ITEMS_PER_PAGE = 10;

const notificationTypes = [
  { value: '', label: 'Todos los tipos' },
  { value: 'MILESTONE_COMPLETED,MILESTONE_APPROVED,MILESTONE_REJECTED', label: 'Hitos' },
  { value: 'PAYMENT_REQUESTED,PAYMENT_APPROVED,PAYMENT_REJECTED,PAYMENT_COMPLETED', label: 'Pagos' },
  { value: 'MESSAGE_RECEIVED', label: 'Mensajes' },
  { value: 'FILE_UPLOADED,FOLDER_CREATED,FOLDER_ACCESS', label: 'Archivos' },
  { value: 'CONTRACT_GENERATED,CONTRACT_SIGNED', label: 'Contratos' },
  { value: 'EVENT_INVITATION,EVENT_ACCEPTED,EVENT_REJECTED,EVENT_REMINDER', label: 'Calendario' },
  { value: 'PROJECT_CREATED,PROJECT_COMPLETED,SYSTEM_REMINDER', label: 'Proyectos' }
];

const dateFilters = [
  { value: 'all', label: 'Todas las fechas' },
  { value: 'today', label: 'Hoy' },
  { value: 'week', label: 'Última semana' },
  { value: 'month', label: 'Último mes' }
];

const ClientNotifications: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  const {
    notifications,
    loading,
    error,
    setFilters,
    refresh,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
  } = useNotifications();

  // Update filters when page, typeFilter, or read filter changes
  useEffect(() => {
    const filterOptions: any = {
      limit: ITEMS_PER_PAGE,
      offset: (page - 1) * ITEMS_PER_PAGE,
    };

    if (filter === 'unread') filterOptions.isRead = false;
    else if (filter === 'read') filterOptions.isRead = true;

    if (typeFilter) filterOptions.types = typeFilter;

    setFilters(filterOptions);
  }, [page, typeFilter, filter, setFilters]);

  // Filter by date on client side
  const filterByDate = (notifs: any[]) => {
    if (dateFilter === 'all') return notifs;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    return notifs.filter(n => {
      const notifDate = new Date(n.createdAt);
      switch (dateFilter) {
        case 'today':
          return notifDate >= today;
        case 'week':
          return notifDate >= weekAgo;
        case 'month':
          return notifDate >= monthAgo;
        default:
          return true;
      }
    });
  };

  const filteredNotifications = filterByDate(notifications);
  const groupedNotifications = groupNotificationsByDate(filteredNotifications);
  const hasUnread = notifications.some(n => !n.isRead);
  const totalPages = Math.ceil(filteredNotifications.length / ITEMS_PER_PAGE) || 1;

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [typeFilter, dateFilter, filter]);

  return (
    <ClientLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-black text-gray-900">Notificaciones</h1>

          <div className="flex items-center gap-2">
            {hasUnread && (
              <button
                onClick={markAllAsRead}
                className="text-sm font-medium px-4 py-2 rounded-lg text-primary hover:bg-primary/5 transition-colors"
              >
                Marcar todas como leídas
              </button>
            )}
            <button
              onClick={deleteAllRead}
              className="text-sm font-medium px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Limpiar leídas
            </button>
          </div>
        </div>

        {/* Read Status Filters */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-gray-200 w-fit">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'all'
              ? 'bg-primary text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            Todas
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'unread'
              ? 'bg-primary text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            No leídas
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'read'
              ? 'bg-primary text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            Leídas
          </button>
        </div>

        {/* Type and Date Filters */}
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-gray-500 text-lg">tune</span>
              <span className="text-sm font-semibold text-gray-700">Filtros</span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1">
              {/* Type Filter */}
              <div className="relative min-w-[200px]">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full px-4 py-2 pr-10 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none cursor-pointer"
                >
                  {notificationTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-sm">
                  expand_more
                </span>
              </div>

              {/* Date Filter - Buttons */}
              <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-lg">
                {dateFilters.map(filter => (
                  <button
                    key={filter.value}
                    onClick={() => setDateFilter(filter.value)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${dateFilter === filter.value
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Refresh Button */}
            <button
              onClick={refresh}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2"
              title="Recargar notificaciones"
            >
              <span className="material-symbols-outlined text-lg">refresh</span>
              Recargar
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">error</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Notifications List */}
        {!loading && !error && (
          <>
            {filteredNotifications.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4 block">
                  notifications_off
                </span>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  No hay notificaciones
                </h3>
                <p className="text-gray-500">
                  {filter === 'unread' && 'No tienes notificaciones sin leer.'}
                  {filter === 'read' && 'No tienes notificaciones leídas.'}
                  {filter === 'all' && 'No tienes notificaciones con estos filtros.'}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  {Object.entries(groupedNotifications).map(([group, items]) => {
                    if (items.length === 0) return null;

                    return (
                      <div key={group}>
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">
                          {group}
                        </h2>
                        <div className="space-y-2">
                          {items.map((notification: any) => (
                            <NotificationItem
                              key={notification.id}
                              notification={notification}
                              onRead={markAsRead}
                              onDelete={deleteNotification}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 py-6 bg-white rounded-xl border border-gray-200">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-lg">chevron_left</span>
                      Anterior
                    </button>

                    <span className="text-sm text-gray-600 font-medium">
                      Página <span className="text-primary font-bold">{page}</span> de {totalPages}
                    </span>

                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                      Siguiente
                      <span className="material-symbols-outlined text-lg">chevron_right</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </ClientLayout>
  );
};

export default ClientNotifications;