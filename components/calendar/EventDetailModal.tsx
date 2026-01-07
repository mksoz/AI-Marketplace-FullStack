import React, { useState } from 'react';
import Modal from '../Modal';
import api from '../../services/api';
import moment from 'moment';

interface EventDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRefresh: () => void;
    event: any;
    isCreator: boolean;
}

const EventDetailModal: React.FC<EventDetailModalProps> = ({
    isOpen,
    onClose,
    onRefresh,
    event,
    isCreator,
}) => {
    const [rsvpStatus, setRsvpStatus] = useState(event?.myAttendeeStatus || 'NO_RESPONSE');
    const [rsvpComment, setRsvpComment] = useState('');
    const [reminderMinutes, setReminderMinutes] = useState<number[]>(
        event?.reminders?.map((r: any) => r.minutesBefore) || []
    );
    const [loading, setLoading] = useState(false);
    const [showPropose, setShowPropose] = useState(false);
    const [proposedStartDate, setProposedStartDate] = useState(
        event?.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : ''
    );
    const [proposedEndDate, setProposedEndDate] = useState(
        event?.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : ''
    );
    const [proposalComment, setProposalComment] = useState('');

    const getEventIcon = (type: string) => {
        const icons: Record<string, string> = {
            MILESTONE: 'flag',
            MEETING: 'videocam',
            DEADLINE: 'warning',
            CUSTOM: 'event',
        };
        return icons[type] || 'event';
    };

    const getEventColor = (type: string) => {
        const colors: Record<string, string> = {
            MILESTONE: '#10b981',
            MEETING: '#3b82f6',
            DEADLINE: '#ef4444',
            CUSTOM: '#8b5cf6',
        };
        return event?.color || colors[type] || colors.CUSTOM;
    };

    const handleAccept = async () => {
        try {
            setLoading(true);
            await api.patch(`/calendar/events/${event.id}/rsvp`, {
                status: 'ACCEPTED',
                comment: '',
            });

            // Update reminders
            await api.patch(`/calendar/events/${event.id}/reminders`, {
                minutesBefore: reminderMinutes,
            });

            onRefresh();
            onClose();
        } catch (error: any) {
            console.error('Accept failed', error);
            alert(error.response?.data?.message || 'Error al aceptar');
        } finally {
            setLoading(false);
        }
    };

    const handleDecline = async () => {
        if (!rsvpComment) {
            alert('Por favor indica el motivo del rechazo');
            return;
        }

        try {
            setLoading(true);
            await api.patch(`/calendar/events/${event.id}/rsvp`, {
                status: 'DECLINED',
                comment: rsvpComment,
            });

            onRefresh();
            onClose();
        } catch (error: any) {
            console.error('Decline failed', error);
            alert(error.response?.data?.message || 'Error al rechazar');
        } finally {
            setLoading(false);
        }
    };

    const handleProposeDate = async () => {
        if (!proposedStartDate || !proposedEndDate) {
            alert('Por favor selecciona una fecha y hora alternativa');
            return;
        }

        if (!proposalComment) {
            alert('Por favor explica por qué propones esta fecha');
            return;
        }

        try {
            setLoading(true);
            await api.post(`/calendar/events/${event.id}/propose`, {
                proposedStartDate,
                proposedEndDate,
                comment: proposalComment,
            });

            onRefresh();
            onClose();
            alert('Propuesta de fecha enviada correctamente');
        } catch (error: any) {
            console.error('Propose failed', error);
            alert(error.response?.data?.message || 'Error al proponer fecha');
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptProposal = async () => {
        try {
            setLoading(true);
            await api.post(`/calendar/events/${event.id}/accept-proposal`);
            onRefresh();
            onClose();
            alert('Propuesta aceptada. El evento se ha actualizado');
        } catch (error: any) {
            console.error('Accept proposal failed', error);
            alert(error.response?.data?.message || 'Error al aceptar propuesta');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('¿Seguro que deseas eliminar este evento?')) return;

        try {
            setLoading(true);
            await api.delete(`/calendar/events/${event.id}`);
            onRefresh();
            onClose();
        } catch (error: any) {
            console.error('Delete failed', error);
            alert(error.response?.data?.message || 'Error al eliminar');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: event?.isAllDay ? undefined : '2-digit',
            minute: event?.isAllDay ? undefined : '2-digit',
        });
    };

    if (!event) return null;

    const hasProposedDate = event.proposedStartDate && event.proposedEndDate;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Detalle del Evento">
            <div className="space-y-6">
                {/* Event Header */}
                <div
                    className="p-4 rounded-xl border flex items-start gap-4"
                    style={{
                        backgroundColor: `${getEventColor(event.type)}15`,
                        borderColor: `${getEventColor(event.type)}40`,
                    }}
                >
                    <div
                        className="p-2 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: getEventColor(event.type) }}
                    >
                        <span className="material-symbols-outlined text-white text-2xl">
                            {getEventIcon(event.type)}
                        </span>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                            {formatDate(event.startDate)}
                            {!event.isAllDay && event.endDate && ` - ${formatDate(event.endDate)}`}
                        </p>
                    </div>
                </div>

                {/* Proposed Date Alert */}
                {hasProposedDate && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <div className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-amber-600">info</span>
                            <div className="flex-1">
                                <p className="font-bold text-amber-900 text-sm">Fecha alternativa propuesta</p>
                                <p className="text-sm text-amber-700 mt-1">
                                    {formatDate(event.proposedStartDate)} - {formatDate(event.proposedEndDate)}
                                </p>
                                {event.proposalComment && (
                                    <p className="text-xs text-amber-600 mt-2 italic">
                                        "{event.proposalComment}"
                                    </p>
                                )}
                                {isCreator && (
                                    <button
                                        onClick={handleAcceptProposal}
                                        disabled={loading}
                                        className="mt-3 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-bold hover:bg-amber-700 transition-colors disabled:opacity-50"
                                    >
                                        Aceptar propuesta
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Description */}
                {event.description && (
                    <div>
                        <h4 className="text-sm font-bold text-gray-700 mb-2">Descripción</h4>
                        <p className="text-gray-600 text-sm">{event.description}</p>
                    </div>
                )}

                {/* Project, Vendor, Client */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                    {event.project && (
                        <div>
                            <p className="text-gray-500 text-xs uppercase font-bold mb-1">Proyecto</p>
                            <p className="font-medium text-gray-900 truncate">{event.project.title}</p>
                        </div>
                    )}
                    {event.vendor && (
                        <div>
                            <p className="text-gray-500 text-xs uppercase font-bold mb-1">Vendor</p>
                            <p className="font-medium text-gray-900 truncate">{event.vendor.companyName}</p>
                        </div>
                    )}
                    {event.client && (
                        <div>
                            <p className="text-gray-500 text-xs uppercase font-bold mb-1">Cliente</p>
                            <p className="font-medium text-gray-900 truncate">{event.client.companyName}</p>
                        </div>
                    )}
                    <div>
                        <p className="text-gray-500 text-xs uppercase font-bold mb-1">Creado por</p>
                        <p className="font-medium text-gray-900 truncate">{event.createdBy?.email}</p>
                    </div>
                </div>

                {/* Meeting Link */}
                {event.meetingLink && (
                    <div>
                        <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">videocam</span>
                            Link de Reunión
                        </h4>
                        <a
                            href={event.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-sm break-all"
                        >
                            {event.meetingLink}
                        </a>
                    </div>
                )}

                {/* Location */}
                {event.location && (
                    <div>
                        <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">location_on</span>
                            Ubicación
                        </h4>
                        <p className="text-gray-600 text-sm">{event.location}</p>
                    </div>
                )}

                <div className="border-t border-gray-100"></div>

                {/* Reminders */}
                <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-3">Recordatorios</h4>
                    <div className="flex flex-wrap gap-2">
                        {[15, 30, 60, 1440].map((minutes) => {
                            const isSelected = reminderMinutes.includes(minutes);
                            const label = minutes < 60 ? `${minutes} min` : minutes === 60 ? '1 hora' : '1 día';

                            return (
                                <button
                                    key={minutes}
                                    onClick={() => {
                                        setReminderMinutes(
                                            isSelected
                                                ? reminderMinutes.filter((m) => m !== minutes)
                                                : [...reminderMinutes, minutes]
                                        );
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

                {/* RSVP - Attendees only */}
                {!isCreator && (
                    <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-3">Tu Respuesta</h4>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={handleAccept}
                                disabled={loading}
                                className="py-3 px-4 rounded-xl border border-green-200 bg-green-50 font-bold text-sm text-green-700 hover:bg-green-100 transition-all flex flex-col items-center justify-center gap-1 disabled:opacity-50"
                            >
                                <span className="material-symbols-outlined text-lg">check_circle</span>
                                Aceptar
                            </button>
                            <button
                                onClick={() => setShowPropose(!showPropose)}
                                className="py-3 px-4 rounded-xl border border-blue-200 bg-blue-50 font-bold text-sm text-blue-700 hover:bg-blue-100 transition-all flex flex-col items-center justify-center gap-1"
                            >
                                <span className="material-symbols-outlined text-lg">event_note</span>
                                Proponer
                            </button>
                            <button
                                onClick={() => setRsvpStatus('DECLINED')}
                                className="py-3 px-4 rounded-xl border border-red-200 bg-red-50 font-bold text-sm text-red-700 hover:bg-red-100 transition-all flex flex-col items-center justify-center gap-1"
                            >
                                <span className="material-symbols-outlined text-lg">cancel</span>
                                Rechazar
                            </button>
                        </div>

                        {/* Propose Date Form */}
                        {showPropose && (
                            <div className="mt-4 p-4 bg-blue-50 rounded-xl animate-in fade-in slide-in-from-top-2 duration-200">
                                <h5 className="font-bold text-sm text-blue-900 mb-3">Proponer fecha alternativa</h5>
                                <div className="space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-bold text-blue-900 mb-1">Inicio</label>
                                            <input
                                                type="datetime-local"
                                                value={proposedStartDate}
                                                onChange={(e) => setProposedStartDate(e.target.value)}
                                                className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-blue-900 mb-1">Fin</label>
                                            <input
                                                type="datetime-local"
                                                value={proposedEndDate}
                                                onChange={(e) => setProposedEndDate(e.target.value)}
                                                className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-blue-900 mb-1">
                                            Motivo de la propuesta
                                        </label>
                                        <textarea
                                            value={proposalComment}
                                            onChange={(e) => setProposalComment(e.target.value)}
                                            placeholder="Ej: La fecha original coincide con..."
                                            className="w-full p-3 border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-300 outline-none resize-none h-20"
                                        />
                                    </div>
                                    <button
                                        onClick={handleProposeDate}
                                        disabled={loading}
                                        className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    >
                                        Enviar propuesta
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Decline Reason */}
                        {rsvpStatus === 'DECLINED' && (
                            <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    Motivo del rechazo *
                                </label>
                                <textarea
                                    value={rsvpComment}
                                    onChange={(e) => setRsvpComment(e.target.value)}
                                    placeholder="Ej: Tengo un conflicto de horario..."
                                    className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 resize-none h-20"
                                />
                                <button
                                    onClick={handleDecline}
                                    disabled={loading}
                                    className="mt-3 w-full py-2 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
                                >
                                    Confirmar rechazo
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    {isCreator ? (
                        <>
                            <button
                                onClick={handleDelete}
                                disabled={loading}
                                className="text-red-600 font-bold text-sm hover:underline disabled:opacity-50"
                            >
                                Eliminar Evento
                            </button>
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-gray-900 text-white font-bold rounded-lg hover:bg-black transition-colors"
                            >
                                Cerrar
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={onClose}
                                className="text-gray-500 font-bold text-sm hover:underline"
                            >
                                Cancel ar
                            </button>
                            <button
                                onClick={() => api.patch(`/calendar/events/${event.id}/reminders`, { minutesBefore: reminderMinutes }).then(() => { onRefresh(); onClose(); })}
                                disabled={loading}
                                className="px-6 py-2 bg-gray-900 text-white font-bold rounded-lg hover:bg-black transition-colors disabled:opacity-50"
                            >
                                Guardar
                            </button>
                        </>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default EventDetailModal;
