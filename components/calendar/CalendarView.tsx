import React, { useState, useEffect, useRef } from 'react';
import { Calendar, momentLocalizer, View, Event as BigCalendarEvent } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../../styles/calendar.css';
import api from '../../services/api';
import CreateEventModal from './CreateEventModal';
import EventDetailModal from './EventDetailModal';

moment.locale('es');
const localizer = momentLocalizer(moment);

interface CalendarViewProps {
    userRole: 'CLIENT' | 'VENDOR';
}

interface CalendarEvent extends BigCalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    type: 'MILESTONE' | 'MEETING' | 'DEADLINE' | 'CUSTOM';
    status: string;
    description?: string;
    projectId?: string;
    project?: any;
    meetingLink?: string;
    location?: string;
    color?: string;
    isAllDay: boolean;
    createdById?: string;
}

const CalendarView: React.FC<CalendarViewProps> = ({ userRole }) => {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [view, setView] = useState<View>('month');
    const [date, setDate] = useState(new Date());
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [showEventModal, setShowEventModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [showOptionsMenu, setShowOptionsMenu] = useState(false);
    const optionsMenuRef = useRef<HTMLDivElement>(null);

    // Projects for vendor filters
    const [projects, setProjects] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);

    // Filters
    const [filters, setFilters] = useState({
        projectId: '',
        type: '',
        clientId: '',
    });

    // Upcoming events
    const [upcomingEvents, setUpcomingEvents] = useState<CalendarEvent[]>([]);

    // Import .ics
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchUser();
        if (userRole === 'VENDOR') {
            fetchProjects();
        }
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [date, view, filters]);

    useEffect(() => {
        // Close options menu when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target as Node)) {
                setShowOptionsMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchUser = async () => {
        try {
            const res = await api.get('/profile');
            setUser(res.data);
        } catch (error) {
            console.error('Failed to fetch user', error);
        }
    };

    const fetchProjects = async () => {
        try {
            const res = await api.get('/projects/my-projects');
            const projectsList = res.data;
            setProjects(projectsList);

            // Extract unique clients
            const uniqueClients = Array.from(
                new Map(
                    projectsList
                        .filter((p: any) => p.client)
                        .map((p: any) => [p.client.userId, p.client])
                ).values()
            );
            setClients(uniqueClients as any[]);
        } catch (error) {
            console.error('Failed to fetch projects', error);
        }
    };

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const startDate = moment(date).startOf(view).toISOString();
            const endDate = moment(date).endOf(view).toISOString();

            const params: any = { startDate, endDate };
            if (filters.projectId) params.projectId = filters.projectId;
            if (filters.type) params.type = filters.type;
            if (filters.clientId) params.clientId = filters.clientId;

            const queryString = new URLSearchParams(params).toString();
            const res = await api.get(`/calendar/events?${queryString}`);

            // Transform for react-big-calendar
            const transformed = res.data.map((event: any) => ({
                ...event,
                start: new Date(event.startDate),
                end: new Date(event.endDate),
            }));

            setEvents(transformed);

            // Calculate upcoming events (next 7 days)
            const now = new Date();
            const upcoming = transformed
                .filter((e: CalendarEvent) => e.start >= now)
                .sort((a: CalendarEvent, b: CalendarEvent) => a.start.getTime() - b.start.getTime())
                .slice(0, 5);
            setUpcomingEvents(upcoming);
        } catch (error) {
            console.error('Failed to fetch events', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
        setSelectedEvent({
            id: '',
            title: '',
            start,
            end,
            type: 'CUSTOM',
            status: 'PENDING',
            isAllDay: false,
        } as CalendarEvent);
        setShowCreateModal(true);
    };

    const handleSelectEvent = (event: CalendarEvent) => {
        setSelectedEvent(event);
        setShowEventModal(true);
    };

    const eventStyleGetter = (event: CalendarEvent) => {
        const colors: Record<string, { backgroundColor: string; borderColor: string }> = {
            MILESTONE: { backgroundColor: '#10b981', borderColor: '#059669' },
            MEETING: { backgroundColor: '#3b82f6', borderColor: '#2563eb' },
            DEADLINE: { backgroundColor: '#ef4444', borderColor: '#dc2626' },
            CUSTOM: { backgroundColor: '#8b5cf6', borderColor: '#7c3aed' },
        };

        const style = event.color
            ? { backgroundColor: event.color, borderColor: event.color }
            : colors[event.type] || colors.CUSTOM;

        return {
            style: {
                ...style,
                color: 'white',
                border: `2px solid ${style.borderColor}`,
                borderRadius: '6px',
                padding: '2px 6px',
                fontSize: '0.875rem',
                fontWeight: '600',
            },
        };
    };

    const handleExport = async () => {
        try {
            const res = await api.get('/calendar/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'calendar.ics');
            document.body.appendChild(link);
            link.click();
            link.remove();
            setShowOptionsMenu(false);
        } catch (error) {
            console.error('Export failed', error);
            alert('Error al exportar calendario');
        }
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            await api.post('/calendar/import', { icsData: text });
            fetchEvents();
            alert('Calendario importado correctamente');
            setShowOptionsMenu(false);
        } catch (error: any) {
            console.error('Import failed', error);
            alert(error.response?.data?.message || 'Error al importar calendario');
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        const newDate = moment(date).add(direction === 'next' ? 1 : -1, 'month').toDate();
        setDate(newDate);
    };

    const goToToday = () => {
        setDate(new Date());
    };

    const getEventIcon = (type: string) => {
        const icons: Record<string, string> = {
            MILESTONE: 'flag',
            MEETING: 'videocam',
            DEADLINE: 'warning',
            CUSTOM: 'event',
        };
        return icons[type] || 'event';
    };

    const formatEventTime = (event: CalendarEvent) => {
        if (event.isAllDay) return 'Todo el día';
        return moment(event.start).format('HH:mm');
    };

    return (
        <div className="h-full flex gap-6 p-6">
            {/* Main Calendar Area */}
            <div className="flex-1 flex flex-col space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">
                            {userRole === 'VENDOR' ? 'Calendario' : 'Calendario'}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Gestiona tus eventos y reuniones
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* New Event Button */}
                        <button
                            onClick={() => {
                                setSelectedEvent({
                                    id: '',
                                    title: '',
                                    start: new Date(),
                                    end: new Date(),
                                    type: 'CUSTOM',
                                    status: 'PENDING',
                                    isAllDay: false,
                                } as CalendarEvent);
                                setShowCreateModal(true);
                            }}
                            className="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">add</span>
                            Crear
                        </button>

                        {/* Options Menu */}
                        <div className="relative" ref={optionsMenuRef}>
                            <button
                                onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Más opciones"
                            >
                                <span className="material-symbols-outlined text-gray-600">more_vert</span>
                            </button>

                            {showOptionsMenu && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700"
                                    >
                                        <span className="material-symbols-outlined text-base">upload</span>
                                        Importar calendario (.ics)
                                    </button>
                                    <button
                                        onClick={handleExport}
                                        className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700"
                                    >
                                        <span className="material-symbols-outlined text-base">download</span>
                                        Exportar calendario (.ics)
                                    </button>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".ics"
                                onChange={handleImport}
                                className="hidden"
                            />
                        </div>
                    </div>
                </div>

                {/* Calendar Navigation & Views */}
                <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-3">
                    {/* Month Navigation */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={goToToday}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors"
                        >
                            Hoy
                        </button>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => navigateMonth('prev')}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <span className="material-symbols-outlined text-gray-600">chevron_left</span>
                            </button>
                            <button
                                onClick={() => navigateMonth('next')}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <span className="material-symbols-outlined text-gray-600">chevron_right</span>
                            </button>
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 min-w-[180px]">
                            {moment(date).format('MMMM YYYY')}
                        </h2>
                    </div>

                    {/* View Selector */}
                    <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setView('month')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Mes
                        </button>
                        <button
                            onClick={() => setView('week')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'week' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Semana
                        </button>
                        <button
                            onClick={() => setView('day')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'day' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Día
                        </button>
                    </div>
                </div>

                {/* Vendor Filters */}
                {userRole === 'VENDOR' && (
                    <div className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="material-symbols-outlined text-gray-600">filter_alt</span>
                            <h3 className="font-bold text-gray-900">Filtros</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <select
                                value={filters.clientId}
                                onChange={(e) => setFilters({ ...filters, clientId: e.target.value, projectId: '' })}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                            >
                                <option value="">Todos los clientes</option>
                                {clients.map((client) => (
                                    <option key={client.userId} value={client.userId}>
                                        {client.companyName || client.user?.email}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={filters.projectId}
                                onChange={(e) => setFilters({ ...filters, projectId: e.target.value })}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                            >
                                <option value="">Todos los proyectos</option>
                                {projects
                                    .filter((p) => !filters.clientId || p.client?.userId === filters.clientId)
                                    .map((project) => (
                                        <option key={project.id} value={project.id}>
                                            {project.title}
                                        </option>
                                    ))}
                            </select>
                            <select
                                value={filters.type}
                                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                            >
                                <option value="">Todos los tipos</option>
                                <option value="MILESTONE">Hitos</option>
                                <option value="MEETING">Reuniones</option>
                                <option value="DEADLINE">Vencimientos</option>
                                <option value="CUSTOM">Personalizados</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* Calendar */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 flex-1" style={{ minHeight: '600px' }}>
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <span className="material-symbols-outlined text-gray-300 text-5xl animate-spin">sync</span>
                        </div>
                    ) : (
                        <Calendar
                            localizer={localizer}
                            events={events}
                            view={view}
                            onView={setView}
                            date={date}
                            onNavigate={setDate}
                            onSelectSlot={handleSelectSlot}
                            onSelectEvent={handleSelectEvent}
                            selectable
                            eventPropGetter={eventStyleGetter}
                            style={{ height: '100%' }}
                            messages={{
                                next: 'Siguiente',
                                previous: 'Anterior',
                                today: 'Hoy',
                                month: 'Mes',
                                week: 'Semana',
                                day: 'Día',
                                date: 'Fecha',
                                time: 'Hora',
                                event: 'Evento',
                                noEventsInRange: 'No hay eventos en este rango',
                            }}
                        />
                    )}
                </div>
            </div>

            {/* Sidebar - Upcoming Events */}
            <div className="w-80 flex flex-col gap-4">
                {/* Mini Calendar */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">
                        {moment(date).format('MMMM YYYY')}
                    </h3>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs">
                        {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((day, i) => (
                            <div key={i} className="font-bold text-gray-500 py-1">
                                {day}
                            </div>
                        ))}
                        {Array.from({ length: moment(date).startOf('month').day() }).map((_, i) => (
                            <div key={`empty-${i}`} className="py-1"></div>
                        ))}
                        {Array.from({ length: moment(date).daysInMonth() }).map((_, i) => {
                            const day = i + 1;
                            const isToday = moment().date() === day && moment().month() === moment(date).month();
                            const hasEvents = events.some(
                                (e) => moment(e.start).date() === day && moment(e.start).month() === moment(date).month()
                            );
                            return (
                                <button
                                    key={day}
                                    onClick={() => setDate(moment(date).date(day).toDate())}
                                    className={`py-1 rounded-full text-sm font-medium transition-colors ${isToday
                                            ? 'bg-primary text-white'
                                            : hasEvents
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Upcoming Events */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 flex-1 overflow-hidden flex flex-col">
                    <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">event_upcoming</span>
                        Próximos Eventos
                    </h3>
                    <div className="flex-1 overflow-y-auto space-y-2">
                        {upcomingEvents.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 text-sm">
                                <span className="material-symbols-outlined text-3xl text-gray-300 block mb-2">event_available</span>
                                No hay eventos próximos
                            </div>
                        ) : (
                            upcomingEvents.map((event) => (
                                <button
                                    key={event.id}
                                    onClick={() => handleSelectEvent(event)}
                                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-all group"
                                >
                                    <div className="flex items-start gap-3">
                                        <div
                                            className="p-1.5 rounded-md flex-shrink-0"
                                            style={{
                                                backgroundColor: event.color || '#8b5cf6',
                                            }}
                                        >
                                            <span className="material-symbols-outlined text-white text-sm">
                                                {getEventIcon(event.type)}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 text-sm truncate">
                                                {event.title}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {moment(event.start).format('MMM D, HH:mm')}
                                            </p>
                                            {event.project && (
                                                <p className="text-xs text-gray-400 mt-0.5 truncate">
                                                    {event.project.title}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Legend */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">Leyenda</h3>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-green-500"></span>
                            <span className="text-xs text-gray-600">Hitos</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                            <span className="text-xs text-gray-600">Reuniones</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-red-500"></span>
                            <span className="text-xs text-gray-600">Vencimientos</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                            <span className="text-xs text-gray-600">Personalizados</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <CreateEventModal
                isOpen={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false);
                    setSelectedEvent(null);
                }}
                onSave={fetchEvents}
                initialEvent={selectedEvent as any}
            />

            <EventDetailModal
                isOpen={showEventModal}
                onClose={() => {
                    setShowEventModal(false);
                    setSelectedEvent(null);
                }}
                onRefresh={fetchEvents}
                event={selectedEvent}
                isCreator={selectedEvent?.createdById === user?.id}
            />
        </div>
    );
};

export default CalendarView;
