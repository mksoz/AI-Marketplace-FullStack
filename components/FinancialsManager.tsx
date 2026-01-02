import React, { useState } from 'react';

interface Milestone {
    id: string;
    title: string;
    amount: number;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
    isPaid: boolean;
    releaseStatus?: 'NONE' | 'REQUESTED' | 'APPROVED' | 'REJECTED';
    vendorNote?: string;
}

interface FinancialsManagerProps {
    milestones: Milestone[];
    userRole: 'client' | 'vendor';
    onRequestRelease?: (milestoneId: string, note?: string) => void;
    onApproveRelease?: (milestoneId: string) => void;
    onRejectRelease?: (milestoneId: string, reason: string) => void;
}

const FinancialsManager: React.FC<FinancialsManagerProps> = ({ milestones, userRole, onRequestRelease, onApproveRelease, onRejectRelease }) => {

    // Helper to get totals
    const totalWithStatus = (status: string) => milestones.filter(m => {
        if (status === 'REQUESTED') return m.releaseStatus === 'REQUESTED' && !m.isPaid;
        return false;
    }).reduce((acc, m) => acc + m.amount, 0);

    // Modal States
    const [requestModal, setRequestModal] = useState<{ open: boolean, milestone: Milestone | null }>({ open: false, milestone: null });
    const [detailModal, setDetailModal] = useState<{ open: boolean, milestone: Milestone | null }>({ open: false, milestone: null });
    const [confirmModal, setConfirmModal] = useState<{ open: boolean, type: 'APPROVE' | 'REJECT' | null, milestone: Milestone | null }>({ open: false, type: null, milestone: null });

    // Form States
    const [note, setNote] = useState('');
    const [rejectReason, setRejectReason] = useState('');

    const columns = [
        { id: 'REQUESTED', label: 'Solicitudes Enviadas', color: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
        { id: 'APPROVED', label: 'En Trámite / Aprobadas', color: 'bg-purple-50 border-purple-200', text: 'text-purple-700' },
        { id: 'PAID', label: 'Cerradas / Pagadas', color: 'bg-green-50 border-green-200', text: 'text-green-700' },
        { id: 'REJECTED', label: 'Rechazadas', color: 'bg-red-50 border-red-200', text: 'text-red-700' },
    ];

    const getColumnItems = (status: string) => {
        return milestones.filter(m => {
            if (status === 'PAID') return m.isPaid;
            if (status === 'REQUESTED') return m.releaseStatus === 'REQUESTED' && !m.isPaid;
            if (status === 'APPROVED') return m.releaseStatus === 'APPROVED' && !m.isPaid;
            if (status === 'REJECTED') return m.releaseStatus === 'REJECTED' && !m.isPaid;
            return false;
        });
    };

    const handleOpenDetail = (m: Milestone) => {
        // Only open detail for Requested items if client, or view generic details
        setDetailModal({ open: true, milestone: m });
    };

    const handleConfirmAction = () => {
        if (!confirmModal.milestone) return;

        if (confirmModal.type === 'APPROVE') {
            if (onApproveRelease) onApproveRelease(confirmModal.milestone.id);
        } else if (confirmModal.type === 'REJECT') {
            if (!rejectReason.trim()) {
                alert("Debes indicar una razón para el rechazo.");
                return;
            }
            if (onRejectRelease) onRejectRelease(confirmModal.milestone.id, rejectReason);
        }

        // Close all
        setConfirmModal({ open: false, type: null, milestone: null });
        setDetailModal({ open: false, milestone: null });
        setRejectReason('');
    };

    return (
        <div className="space-y-6 h-[600px] flex flex-col">
            {/* Header / Stats */}


            {/* Vendor Action Area */}
            {userRole === 'vendor' && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 shrink-0">
                    <h4 className="font-bold text-sm text-gray-700 mb-3 flex items-center gap-2">
                        <span className="material-symbols-outlined text-green-600">savings</span> Hitos Disponibles para Cobro
                    </h4>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        {milestones.filter(m => m.status === 'COMPLETED' && !m.isPaid && m.releaseStatus !== 'REQUESTED').length === 0 ? (
                            <p className="text-xs text-gray-400 italic">No hay hitos completados pendientes de cobro.</p>
                        ) : (
                            milestones.filter(m => m.status === 'COMPLETED' && !m.isPaid && m.releaseStatus !== 'REQUESTED').map(m => (
                                <div key={m.id} className="min-w-[250px] bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex flex-col gap-2">
                                    <div className="flex justify-between items-start">
                                        <span className="font-bold text-gray-800 text-sm truncate">{m.title}</span>
                                        <span className="font-bold text-green-600 text-sm">${m.amount}</span>
                                    </div>
                                    <button
                                        onClick={() => setRequestModal({ open: true, milestone: m })}
                                        className="mt-auto w-full py-1.5 bg-blue-600 text-white font-bold text-xs rounded hover:bg-blue-700 transition-colors"
                                    >
                                        Solicitar Liberación
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto pb-4 min-h-0">
                <div className="flex gap-4 h-full min-w-[1000px]">
                    {columns.map(col => {
                        const items = getColumnItems(col.id);
                        return (
                            <div key={col.id} className="flex-1 flex flex-col bg-gray-50 rounded-xl border border-gray-200">
                                <div className={`p-3 border-b border-gray-200 rounded-t-xl flex justify-between items-center ${col.color.replace('border', 'bg').replace('50', '100/50')}`}>
                                    <h4 className={`font-bold text-sm ${col.text}`}>{col.label}</h4>
                                    <span className="bg-white text-gray-700 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                                        {items.length}
                                    </span>
                                </div>
                                <div className="p-3 space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                                    {items.map(m => (
                                        <div
                                            key={m.id}
                                            onClick={() => (userRole === 'client' && m.releaseStatus === 'REQUESTED') ? handleOpenDetail(m) : null}
                                            className={`bg-white p-4 rounded-xl border border-gray-200 shadow-sm group ${userRole === 'client' && m.releaseStatus === 'REQUESTED' ? 'cursor-pointer hover:border-blue-400 hover:shadow-md transition-all' : ''}`}
                                        >
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-bold text-gray-900 text-sm">{m.title}</span>
                                                <span className="font-black text-gray-700">${m.amount.toLocaleString()}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mb-3">ID: {m.id.slice(0, 8)}</p>

                                            {m.releaseStatus === 'REQUESTED' && (
                                                <div className="bg-blue-50 text-blue-800 text-[10px] p-2 rounded mb-2">
                                                    <span className="block font-bold mb-0.5">Nota Vendor:</span>
                                                    {m.vendorNote || 'Sin nota adjunta.'}
                                                </div>
                                            )}

                                            {/* Client Quick Actions (only if not clicking card to open modal) */}
                                            {/* We want user to use Modal for details, so maybe hide buttons here or keep them as shortcuts? 
                                                User requirement: "las fichas se deben poder abrir con un pop up". 
                                                I'll keep quick actions but clicking card opens detail. */}
                                        </div>
                                    ))}
                                    {items.length === 0 && (
                                        <div className="text-center py-8 opacity-50">
                                            <p className="text-xs text-gray-400">Vacío</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Request Modal (Vendor) */}
            {requestModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl p-6 w-96 shadow-2xl animate-in zoom-in-95">
                        <h3 className="font-bold text-lg mb-4">Solicitar Liberación</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Solicitando pago de <span className="font-bold">${requestModal.milestone?.amount}</span> por <span className="font-bold">{requestModal.milestone?.title}</span>.
                        </p>
                        <textarea
                            className="w-full p-2 border border-gray-200 rounded-lg text-sm mb-4 outline-none focus:ring-2 focus:ring-blue-500/20"
                            placeholder="Nota opcional..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => { setRequestModal({ open: false, milestone: null }); setNote(''); }} className="px-3 py-1.5 text-gray-600 font-bold text-sm hover:bg-gray-100 rounded">Cancelar</button>
                            <button
                                onClick={() => {
                                    if (requestModal.milestone && onRequestRelease) onRequestRelease(requestModal.milestone.id, note);
                                    setRequestModal({ open: false, milestone: null });
                                    setNote('');
                                }}
                                className="px-3 py-1.5 bg-blue-600 text-white font-bold text-sm rounded hover:bg-blue-700"
                            >
                                Enviar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Modal (Client Review) */}
            {detailModal.open && detailModal.milestone && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-xl font-bold text-gray-900">Revisión de Solicitud</h3>
                            <button onClick={() => setDetailModal({ open: false, milestone: null })} className="text-gray-400 hover:text-gray-600">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6">
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-blue-600 uppercase mb-1">Monto a Liberar</p>
                                    <p className="text-3xl font-black text-gray-900">${detailModal.milestone.amount.toLocaleString()}</p>
                                </div>
                                <div className="h-10 w-10 bg-blue-200 rounded-full flex items-center justify-center text-blue-700">
                                    <span className="material-symbols-outlined">payments</span>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-gray-900 mb-2">Detalles del Hito</h4>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Título:</span>
                                        <span className="font-medium text-gray-900">{detailModal.milestone.title}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">ID Referencia:</span>
                                        <span className="font-mono text-gray-600">{detailModal.milestone.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Estado:</span>
                                        <span className="font-medium text-gray-900">{detailModal.milestone.status}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-gray-900 mb-2">Justificación del Vendor</h4>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-sm text-gray-700 italic">
                                    "{detailModal.milestone.vendorNote || 'El vendor no adjuntó ninguna nota adicional.'}"
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 flex gap-4 bg-gray-50/50">
                            <button
                                onClick={() => setConfirmModal({ open: true, type: 'REJECT', milestone: detailModal.milestone })}
                                className="flex-1 py-3 border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">thumb_down</span> Rechazar
                            </button>
                            <button
                                onClick={() => setConfirmModal({ open: true, type: 'APPROVE', milestone: detailModal.milestone })}
                                className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">check_circle</span> Aprobar Pago
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Double Check / Confirmation Modal */}
            {confirmModal.open && confirmModal.milestone && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto ${confirmModal.type === 'APPROVE' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            <span className="material-symbols-outlined text-2xl">
                                {confirmModal.type === 'APPROVE' ? 'verified' : 'warning'}
                            </span>
                        </div>

                        <h3 className="text-center font-bold text-lg text-gray-900 mb-2">
                            {confirmModal.type === 'APPROVE' ? '¿Confirmar Aprobación?' : '¿Confirmar Rechazo?'}
                        </h3>

                        <p className="text-center text-sm text-gray-500 mb-6">
                            {confirmModal.type === 'APPROVE'
                                ? `Estás a punto de liberar $${confirmModal.milestone.amount}. Esta acción es irreversible.`
                                : `Debes justificar por qué rechazas este hito.`
                            }
                        </p>

                        {confirmModal.type === 'REJECT' && (
                            <textarea
                                className="w-full p-3 border border-red-200 rounded-lg text-sm mb-6 outline-none focus:ring-2 focus:ring-red-500/20 bg-red-50"
                                placeholder="Escribe el motivo obligatorio..."
                                rows={3}
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                autoFocus
                            />
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => { setConfirmModal({ open: false, type: null, milestone: null }); setRejectReason(''); }}
                                className="flex-1 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg"
                            >
                                Volver
                            </button>
                            <button
                                onClick={handleConfirmAction}
                                className={`flex-1 py-2 text-white font-bold rounded-lg shadow-lg ${confirmModal.type === 'APPROVE' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                            >
                                Confirmar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinancialsManager;
