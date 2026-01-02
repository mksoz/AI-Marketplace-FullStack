import React, { useState } from 'react';

interface Incident {
    id: string;
    title: string;
    description: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
    createdAt: string;
    type: 'BUG' | 'CHANGE_REQUEST' | 'SUPPORT';
    reportedBy: string;
    resolution?: string;
    attachment?: string; // Attachment name
}

interface IncidentManagerProps {
    incidents: Incident[];
    userRole: 'client' | 'vendor'; // 'client' can report, 'vendor' can resolve
    onReport?: (incident: Omit<Incident, 'id' | 'createdAt' | 'status' | 'reportedBy'> & { file?: File }) => void;
    onStatusChange?: (id: string, newStatus: Incident['status'], resolution?: string) => void;
    onDelete?: (id: string) => void;
}

const IncidentManager: React.FC<IncidentManagerProps> = ({ incidents, userRole, onReport, onStatusChange, onDelete }) => {

    // Modal States
    const [showReportModal, setShowReportModal] = useState(false);
    const [detailModal, setDetailModal] = useState<{ open: boolean, incident: Incident | null }>({ open: false, incident: null });
    const [confirmDeleteModal, setConfirmDeleteModal] = useState<{ open: boolean, incident: Incident | null }>({ open: false, incident: null });
    const [resolveModal, setResolveModal] = useState<{ open: boolean, incident: Incident | null }>({ open: false, incident: null });

    // Forms
    const [newIncident, setNewIncident] = useState({
        title: '',
        description: '',
        priority: 'MEDIUM' as Incident['priority'],
        type: 'BUG' as Incident['type'],
        file: null as File | null
    });
    const [resolutionText, setResolutionText] = useState('');

    const columns = [
        { id: 'OPEN', label: 'Abiertas', color: 'bg-red-50 border-red-200', text: 'text-red-700' },
        { id: 'IN_PROGRESS', label: 'En Revisión', color: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
        { id: 'RESOLVED', label: 'Resueltas', color: 'bg-green-50 border-green-200', text: 'text-green-700' },
    ];

    const handleSubmitReport = (e: React.FormEvent) => {
        e.preventDefault();
        if (onReport) {
            onReport({ ...newIncident, file: newIncident.file || undefined });
            setShowReportModal(false);
            setNewIncident({ title: '', description: '', priority: 'MEDIUM', type: 'BUG', file: null });
        }
    };

    const handleResolve = () => {
        if (resolveModal.incident && onStatusChange) {
            onStatusChange(resolveModal.incident.id, 'RESOLVED', resolutionText);
            setResolveModal({ open: false, incident: null });
            setResolutionText('');
        }
    };

    const handleDelete = () => {
        if (confirmDeleteModal.incident && onDelete) {
            onDelete(confirmDeleteModal.incident.id);
            setConfirmDeleteModal({ open: false, incident: null });
            setDetailModal({ open: false, incident: null }); // Close detail if open
        }
    };

    return (
        <div className="space-y-6 h-[600px] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-200 shadow-sm shrink-0">
                <div>
                    <h3 className="font-bold text-gray-900">Gestor de Incidencias</h3>
                    <p className="text-xs text-gray-500">Reporta y monitorea problemas del proyecto.</p>
                </div>
                {(userRole === 'client' || userRole === 'vendor') && onReport && (
                    <button
                        onClick={() => setShowReportModal(true)}
                        className="px-4 py-2 bg-red-600 text-white font-bold text-sm rounded-lg hover:bg-red-700 shadow-lg shadow-red-200 flex items-center gap-2 transition-transform hover:-translate-y-0.5"
                    >
                        <span className="material-symbols-outlined text-lg">add_alert</span> Reportar
                    </button>
                )}
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto pb-4 min-h-0">
                <div className="flex gap-4 h-full min-w-[800px]">
                    {columns.map(col => {
                        const colIncidents = incidents.filter(i => i.status === col.id);
                        return (
                            <div key={col.id} className="flex-1 flex flex-col bg-gray-50 rounded-xl border border-gray-200">
                                {/* Column Header */}
                                <div className={`p-3 border-b border-gray-200 rounded-t-xl flex justify-between items-center ${col.color.replace('border', 'bg').replace('50', '100/50')}`}>
                                    <h4 className={`font-bold text-sm ${col.text}`}>{col.label}</h4>
                                    <span className="bg-white text-gray-700 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                                        {colIncidents.length}
                                    </span>
                                </div>

                                {/* Cards */}
                                <div className="p-3 space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                                    {colIncidents.map(inc => (
                                        <div
                                            key={inc.id}
                                            onClick={() => setDetailModal({ open: true, incident: inc })}
                                            className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group relative hover:border-red-200"
                                        >
                                            <div className="flex justify-between items-center mb-2">
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase
                                                    ${inc.priority === 'CRITICAL' ? 'bg-red-100 text-red-800 border-red-200' :
                                                        inc.priority === 'HIGH' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                                            'bg-blue-50 text-blue-700 border-blue-100'}
                                                `}>
                                                    {inc.priority}
                                                </span>
                                                <span className="text-[10px] text-gray-400">{new Date(inc.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <h5 className="font-bold text-gray-900 text-sm mb-1 truncate">{inc.title}</h5>
                                            <p className="text-xs text-gray-500 line-clamp-2 mb-2">{inc.description}</p>

                                            {inc.attachment && (
                                                <div className="flex items-center gap-1 text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded w-fit">
                                                    <span className="material-symbols-outlined text-xs">attachment</span> {inc.attachment}
                                                </div>
                                            )}

                                            {/* Stop Propagation to prevent opening detail when clicking action buttons */}
                                            {userRole === 'vendor' && inc.status !== 'RESOLVED' && (
                                                <div className="pt-3 mt-2 border-t border-gray-50 flex justify-end" onClick={e => e.stopPropagation()}>
                                                    {inc.status === 'OPEN' ? (
                                                        <button
                                                            onClick={() => onStatusChange?.(inc.id, 'IN_PROGRESS')}
                                                            className="text-xs font-bold text-amber-600 hover:bg-amber-50 px-2 py-1 rounded transition-colors"
                                                        >
                                                            Iniciar Revisión
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => setResolveModal({ open: true, incident: inc })}
                                                            className="text-xs font-bold text-green-600 hover:bg-green-50 px-2 py-1 rounded transition-colors"
                                                        >
                                                            Marcar Resuelto
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {colIncidents.length === 0 && (
                                        <div className="text-center py-8 opacity-50">
                                            <p className="text-xs text-gray-400">Sin incidencias</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Report Modal */}
            {showReportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-6 w-[500px] shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <span className="material-symbols-outlined text-red-600">report</span> Reportar Incidencia
                            </h3>
                            <button onClick={() => setShowReportModal(false)} className="text-gray-400 hover:text-gray-600"><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <form onSubmit={handleSubmitReport} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Título del Problema</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                                    placeholder="Ej: Error en el login..."
                                    value={newIncident.title}
                                    onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Tipo</label>
                                    <select
                                        className="w-full p-2 border border-gray-200 rounded-lg outline-none bg-white"
                                        value={newIncident.type}
                                        onChange={(e) => setNewIncident({ ...newIncident, type: e.target.value as any })}
                                    >
                                        <option value="BUG">Error / Bug</option>
                                        <option value="CHANGE_REQUEST">Cambio Solicitado</option>
                                        <option value="SUPPORT">Soporte</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Prioridad</label>
                                    <select
                                        className="w-full p-2 border border-gray-200 rounded-lg outline-none bg-white"
                                        value={newIncident.priority}
                                        onChange={(e) => setNewIncident({ ...newIncident, priority: e.target.value as any })}
                                    >
                                        <option value="LOW">Baja</option>
                                        <option value="MEDIUM">Media</option>
                                        <option value="HIGH">Alta</option>
                                        <option value="CRITICAL">Crítica</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Descripción Detallada</label>
                                <textarea
                                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500/20 outline-none h-24 resize-none transition-all"
                                    placeholder="Explica qué sucedió..."
                                    value={newIncident.description}
                                    onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Adjuntar Archivo (Opcional)</label>
                                <input
                                    type="file"
                                    className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setNewIncident({ ...newIncident, file: e.target.files[0] });
                                        }
                                    }}
                                />
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowReportModal(false)} className="px-4 py-2 text-gray-600 font-bold text-sm hover:bg-gray-50 rounded-lg">Cancelar</button>
                                <button type="submit" className="px-6 py-2 bg-red-600 text-white font-bold text-sm rounded-lg hover:bg-red-700 shadow-lg shadow-red-200">
                                    Enviar Reporte
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Incident Detail View Modal */}
            {detailModal.open && detailModal.incident && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">{detailModal.incident.title}</h3>
                                <div className="flex gap-2">
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase
                                        ${detailModal.incident.priority === 'CRITICAL' ? 'bg-red-100 text-red-800 border-red-200' :
                                            detailModal.incident.priority === 'HIGH' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                                'bg-blue-50 text-blue-700 border-blue-100'}
                                    `}>
                                        {detailModal.incident.priority}
                                    </span>
                                    <span className="text-[10px] bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded border border-gray-300">
                                        ID: {detailModal.incident.id}
                                    </span>
                                </div>
                            </div>
                            <button onClick={() => setDetailModal({ open: false, incident: null })} className="text-gray-400 hover:text-gray-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6">
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Descripción</h4>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                                    {detailModal.incident.description}
                                </div>
                            </div>

                            {detailModal.incident.attachment && (
                                <div>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Adjuntos</h4>
                                    <div className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer w-fit">
                                        <span className="material-symbols-outlined text-red-600">attach_file</span>
                                        <span className="text-sm font-bold text-gray-700 underline decoration-gray-300">{detailModal.incident.attachment}</span>
                                    </div>
                                </div>
                            )}

                            {detailModal.incident.status === 'RESOLVED' && (
                                <div>
                                    <h4 className="text-xs font-bold text-green-600 uppercase mb-2 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-sm">check_circle</span> Solución Aplicada
                                    </h4>
                                    <div className="bg-green-50 p-4 rounded-xl border border-green-200 text-sm text-green-900">
                                        {detailModal.incident.resolution || 'El problema ha sido resuelto.'}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-gray-100 flex justify-between bg-gray-50/50">
                            {userRole === 'client' && detailModal.incident.status !== 'RESOLVED' ? (
                                <button
                                    onClick={() => setConfirmDeleteModal({ open: true, incident: detailModal.incident })}
                                    className="px-4 py-2 border border-red-200 text-red-600 font-bold text-sm rounded-lg hover:bg-red-50 flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-lg">delete</span> Eliminar Reporte
                                </button>
                            ) : (
                                <div></div>
                            )}

                            {userRole === 'vendor' && detailModal.incident.status !== 'RESOLVED' && (
                                <button
                                    onClick={() => { setDetailModal({ open: false, incident: null }); setResolveModal({ open: true, incident: detailModal.incident }); }}
                                    className="px-6 py-2 bg-green-600 text-white font-bold text-sm rounded-lg hover:bg-green-700 shadow-lg shadow-green-200"
                                >
                                    Resolver Incidencia
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Resolve Modal (Vendor) */}
            {resolveModal.open && resolveModal.incident && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl p-6 w-[500px] shadow-2xl animate-in zoom-in-95">
                        <h3 className="font-bold text-lg mb-4 text-green-700">Resolver Incidencia</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Describe la solución aplicada para <span className="font-bold">{resolveModal.incident.title}</span>.
                        </p>
                        <textarea
                            className="w-full p-3 border border-green-200 rounded-lg text-sm mb-4 outline-none focus:ring-2 focus:ring-green-500/20 bg-green-50"
                            placeholder="Solución técnica o explicación..."
                            rows={4}
                            value={resolutionText}
                            onChange={(e) => setResolutionText(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => { setResolveModal({ open: false, incident: null }); setResolutionText(''); }} className="px-3 py-1.5 text-gray-600 font-bold text-sm hover:bg-gray-100 rounded">Cancelar</button>
                            <button
                                onClick={handleResolve}
                                className="px-4 py-2 bg-green-600 text-white font-bold text-sm rounded hover:bg-green-700"
                            >
                                Marcar como Resuelto
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {confirmDeleteModal.open && confirmDeleteModal.incident && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl p-6 w-96 shadow-2xl animate-in zoom-in-95 text-center">
                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-2xl">delete</span>
                        </div>
                        <h3 className="font-bold text-lg mb-2 text-gray-900">¿Eliminar Reporte?</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            Estás a punto de eliminar <span className="font-bold">"{confirmDeleteModal.incident.title}"</span>. Esta acción no se puede deshacer.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmDeleteModal({ open: false, incident: null })}
                                className="flex-1 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 shadow-lg shadow-red-200"
                            >
                                Sí, Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IncidentManager;
