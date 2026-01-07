import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import api from '../../services/api';

interface CreateEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    initialEvent?: {
        start: Date;
        end: Date;
        title?: string;
    };
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({ isOpen, onClose, onSave, initialEvent }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'CUSTOM',
        startDate: new Date().toISOString().slice(0, 16),
        endDate: new Date().toISOString().slice(0, 16),
        isAllDay: false,
        projectId: '',
        meetingLink: '',
        location: '',
        color: '#8b5cf6',
        reminderMinutes: [] as number[],
        vendorId: '',
        clientId: '',
    });

    const [projects, setProjects] = useState<any[]>([]);
    const [vendors, setVendors] = useState<any[]>([]);
    const [clients, setClients] = useState<any[]>([]);
    const [userRole, setUserRole] = useState<string>('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchUserRole();
            fetchProjects();
            if (initialEvent) {
                setFormData({
                    ...formData,
                    title: initialEvent.title || '',
                    startDate: initialEvent.start.toISOString().slice(0, 16),
                    endDate: initialEvent.end.toISOString().slice(0, 16),
                });
            }
        }
    }, [isOpen, initialEvent]);

    const fetchUserRole = async () => {
        try {
            const res = await api.get('/profile');
            setUserRole(res.data.role);

            // Fetch vendors or clients depending on role
            if (res.data.role === 'CLIENT') {
                fetchVendors();
            } else if (res.data.role === 'VENDOR') {
                fetchClients();
            }
        } catch (error) {
            console.error('Failed to fetch user role', error);
        }
    };

    const fetchProjects = async () => {
        try {
            const res = await api.get('/projects/my-projects');
            setProjects(res.data);
        } catch (error) {
            console.error('Failed to fetch projects', error);
        }
    };

    const fetchVendors = async () => {
        try {
            // For clients, fetch vendors from their projects
            const res = await api.get('/projects/my-projects');
            const uniqueVendors = Array.from(
                new Map(
                    res.data
                        .filter((p: any) => p.vendor)
                        .map((p: any) => [p.vendor.id, p.vendor])
                ).values()
            );
            setVendors(uniqueVendors as any[]);
        } catch (error) {
            console.error('Failed to fetch vendors', error);
        }
    };

    const fetchClients = async () => {
        try {
            // For vendors, fetch clients from their projects
            const res = await api.get('/projects/my-projects');
            const uniqueClients = Array.from(
                new Map(
                    res.data
                        .filter((p: any) => p.client)
                        .map((p: any) => [p.client.id, p.client])
                ).values()
            );
            setClients(uniqueClients as any[]);
        } catch (error) {
            console.error('Failed to fetch clients', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title) {
            alert('El título es obligatorio');
            return;
        }

        // Validate vendor/client based on role
        if (userRole === 'CLIENT' && !formData.vendorId) {
            alert('Debes seleccionar un vendor');
            return;
        }

        if (userRole === 'VENDOR' && !formData.clientId) {
            alert('Debes seleccionar un cliente');
            return;
        }

        try {
            setLoading(true);
            await api.post('/calendar/events', formData);
            onSave();
            onClose();
            resetForm();
        } catch (error: any) {
            console.error('Failed to create event', error);
            alert(error.response?.data?.message || 'Error al crear evento');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            type: 'CUSTOM',
            startDate: new Date().toISOString().slice(0, 16),
            endDate: new Date().toISOString().slice(0, 16),
            isAllDay: false,
            projectId: '',
            meetingLink: '',
            location: '',
            color: '#8b5cf6',
            reminderMinutes: [],
            vendorId: '',
            clientId: '',
        });
    };

    const eventTypeColors: Record<string, string> = {
        MILESTONE: '#10b981',
        MEETING: '#3b82f6',
        DEADLINE: '#ef4444',
        CUSTOM: '#8b5cf6',
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Crear Nuevo Evento">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">
                        Título <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
                        placeholder="Ej: Reunión de seguimiento"
                        required
                    />
                </div>

                {/* Type & Project */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Tipo</label>
                        <select
                            value={formData.type}
                            onChange={(e) => {
                                const type = e.target.value;
                                setFormData({
                                    ...formData,
                                    type,
                                    color: eventTypeColors[type] || formData.color,
                                });
                            }}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
                        >
                            <option value="CUSTOM">Personalizado</option>
                            <option value="MEETING">Reunión</option>
                            <option value="MILESTONE">Hito</option>
                            <option value="DEADLINE">Vencimiento</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Proyecto (opcional)</label>
                        <select
                            value={formData.projectId}
                            onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
                        >
                            <option value="">Sin proyecto</option>
                            {projects.map((project) => (
                                <option key={project.id} value={project.id}>
                                    {project.title}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Vendor/Client Selection */}
                {userRole === 'CLIENT' && (
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">
                            Vendor <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.vendorId}
                            onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
                            required
                        >
                            <option value="">Selecciona un vendor</option>
                            {vendors.map((vendor) => (
                                <option key={vendor.id} value={vendor.id}>
                                    {vendor.companyName || vendor.user?.email}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {userRole === 'VENDOR' && (
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">
                            Cliente <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.clientId}
                            onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
                            required
                        >
                            <option value="">Selecciona un cliente</option>
                            {clients.map((client) => (
                                <option key={client.id} value={client.id}>
                                    {client.companyName || client.user?.email}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Dates */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <input
                            type="checkbox"
                            checked={formData.isAllDay}
                            onChange={(e) => setFormData({ ...formData, isAllDay: e.target.checked })}
                            className="w-4 h-4 text-primary rounded"
                        />
                        <label className="text-sm font-medium text-gray-700">Evento de todo el día</label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">calendar_today</span>
                                Inicio
                            </label>
                            <input
                                type={formData.isAllDay ? 'date' : 'datetime-local'}
                                value={formData.isAllDay ? formData.startDate.slice(0, 10) : formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
                                style={{ colorScheme: 'light' }}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5">Fin</label>
                            <input
                                type={formData.isAllDay ? 'date' : 'datetime-local'}
                                value={formData.isAllDay ? formData.endDate.slice(0, 10) : formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
                                style={{ colorScheme: 'light' }}
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Descripción</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary outline-none resize-none"
                        rows={3}
                        placeholder="Detalles del evento..."
                    />
                </div>

                {/* Meeting Link & Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">
                            <span className="material-symbols-outlined text-sm align-middle mr-1">videocam</span>
                            Link de Reunión
                        </label>
                        <input
                            type="url"
                            value={formData.meetingLink}
                            onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
                            placeholder="https://meet.google.com/..."
                        />
                        <p className="text-xs text-gray-500 mt-1">Google Meet, Teams, Zoom, etc.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">
                            <span className="material-symbols-outlined text-sm align-middle mr-1">location_on</span>
                            Ubicación
                        </label>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
                            placeholder="Oficina, dirección, etc."
                        />
                    </div>
                </div>

                {/* Color Picker */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Color</label>
                    <div className="flex items-center gap-3">
                        <input
                            type="color"
                            value={formData.color}
                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                            className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                        />
                        <span className="text-sm text-gray-600">{formData.color}</span>
                    </div>
                </div>

                {/* Reminders */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1.5">Recordatorios</label>
                    <div className="flex flex-wrap gap-2">
                        {[15, 30, 60, 1440].map((minutes) => {
                            const isSelected = formData.reminderMinutes.includes(minutes);
                            const label = minutes < 60 ? `${minutes} min` : minutes === 60 ? '1 hora' : '1 día';

                            return (
                                <button
                                    key={minutes}
                                    type="button"
                                    onClick={() => {
                                        setFormData({
                                            ...formData,
                                            reminderMinutes: isSelected
                                                ? formData.reminderMinutes.filter((m) => m !== minutes)
                                                : [...formData.reminderMinutes, minutes],
                                        });
                                    }}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${isSelected
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creando...' : 'Crear Evento'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default CreateEventModal;
