import React, { useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import CountdownTimer from '../../components/CountdownTimer';

interface Milestone {
    id: string;
    title: string;
    description: string;
    amount: number;
    status: 'PENDING' | 'IN_PROGRESS' | 'READY_FOR_REVIEW' | 'CHANGES_REQUESTED' | 'IN_DISPUTE' | 'COMPLETED' | 'PAID';
    dueDate?: string;
    isPaid?: boolean;
    completionNote?: string;
    completedAt?: string;
    submittedAt?: string;
    reviewDeadline?: string;
    reviews?: Array<{
        id: string;
        status: 'APPROVED' | 'REJECTED' | 'DISPUTED';
        comment?: string;
        reviewNumber: number;
        createdAt: string;
    }>;
    paymentRequest?: {
        id: string;
        status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
        vendorNote?: string;
        amount: number;
        rejectionReason?: string;
    };
}

interface ClientProjectMilestonesProps {
    project: any;
    onUpdate?: () => void;
    userRole?: 'CLIENT' | 'VENDOR';
}

const ClientProjectMilestones: React.FC<ClientProjectMilestonesProps> = ({ project, onUpdate, userRole = 'CLIENT' }) => {
    const milestones: Milestone[] = project?.milestones || [];
    const { showToast } = useToast();

    // Modal states
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<{ milestone: Milestone, requestId: string } | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [loading, setLoading] = useState(false);

    const handleApprovePayment = async () => {
        if (!selectedRequest) return;

        setLoading(true);
        try {
            await api.post(`/milestones/payment-requests/${selectedRequest.requestId}/approve`);
            showToast('Pago aprobado y procesado correctamente', 'success');
            setShowApproveModal(false);
            setSelectedRequest(null);
            if (onUpdate) onUpdate();
        } catch (error: any) {
            console.error('Error approving payment:', error);
            showToast(error.response?.data?.message || 'Error al aprobar el pago', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRejectPayment = async () => {
        if (!selectedRequest || !rejectionReason.trim()) {
            showToast('Debes especificar el motivo del rechazo', 'warning');
            return;
        }

        setLoading(true);
        try {
            await api.post(`/milestones/payment-requests/${selectedRequest.requestId}/reject`, {
                rejectionReason: rejectionReason.trim()
            });
            showToast('Solicitud rechazada correctamente', 'success');
            setShowRejectModal(false);
            setSelectedRequest(null);
            setRejectionReason('');
            if (onUpdate) onUpdate();
        } catch (error: any) {
            console.error('Error rejecting payment:', error);
            showToast(error.response?.data?.message || 'Error al rechazar la solicitud', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Vendor Operational State
    const [showPaymentRequestModal, setShowPaymentRequestModal] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [selectedActionMilestone, setSelectedActionMilestone] = useState<Milestone | null>(null);
    const [actionNote, setActionNote] = useState('');

    // Vendor Handlers
    const handleStartMilestone = async (id: string) => {
        setLoading(true);
        try {
            await api.post(`/milestones/${id}/start`);
            showToast('Hito iniciado correctamente', 'success');
            if (onUpdate) onUpdate();
        } catch (error: any) {
            console.error('Error starting milestone:', error);
            showToast(error.response?.data?.message || 'Error al iniciar hito', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRequestPayment = async () => {
        if (!selectedActionMilestone) return;

        setLoading(true);
        try {
            await api.post(`/milestones/${selectedActionMilestone.id}/request-payment`, {
                vendorNote: actionNote.trim() || undefined
            });
            showToast('Solicitud de pago enviada correctamente', 'success');
            setShowPaymentRequestModal(false);
            setSelectedActionMilestone(null);
            setActionNote('');
            if (onUpdate) onUpdate();
        } catch (error: any) {
            console.error('Error requesting payment:', error);
            showToast(error.response?.data?.message || 'Error al solicitar pago', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteMilestone = async () => {
        if (!selectedActionMilestone || !actionNote.trim()) {
            showToast('La justificación es obligatoria', 'warning');
            return;
        }

        setLoading(true);
        try {
            await api.post(`/milestones/${selectedActionMilestone.id}/complete`, {
                completionNote: actionNote.trim()
            });
            showToast('Hito marcado como completado', 'success');
            setShowCompleteModal(false);
            setSelectedActionMilestone(null);
            setActionNote('');
            if (onUpdate) onUpdate();
        } catch (error: any) {
            console.error('Error completing milestone:', error);
            showToast(error.response?.data?.message || 'Error al completar el hito', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Review Deliverables State
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedMilestoneForReview, setSelectedMilestoneForReview] = useState<Milestone | null>(null);
    const [reviewAction, setReviewAction] = useState<'INITIAL' | 'APPROVE' | 'REJECT'>('INITIAL');
    const [reviewComment, setReviewComment] = useState('');

    const handleReviewSubmit = async (status: 'APPROVED' | 'REJECTED') => {
        if (!selectedMilestoneForReview) return;

        setLoading(true);
        try {
            const endpoint = status === 'APPROVED'
                ? `/milestones/${selectedMilestoneForReview.id}/approve`
                : `/milestones/${selectedMilestoneForReview.id}/reject`;

            const payload = status === 'REJECTED' ? { comment: reviewComment } : {};

            await api.post(endpoint, payload);

            showToast(
                status === 'APPROVED'
                    ? 'Hito aprobado y fondos liberados'
                    : 'Cambios solicitados correctamente',
                'success'
            );

            setShowReviewModal(false);
            setSelectedMilestoneForReview(null);
            setReviewComment('');
            setReviewAction('INITIAL');
            if (onUpdate) onUpdate();
        } catch (error: any) {
            console.error('Review error:', error);
            showToast(error.response?.data?.message || 'Error al procesar la revisión', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (milestones.length === 0) {
        return (
            <div className="text-center py-10 border border-dashed border-gray-200 rounded-2xl bg-gray-50">
                <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">flag</span>
                <p className="text-gray-500">No se han definido hitos para este proyecto.</p>
            </div>
        );
    }

    return (
        <>
            <div className="max-w-3xl mx-auto space-y-8">
                <div className="relative pl-8 space-y-12 before:content-[''] before:absolute before:top-0 before:left-[23px] before:h-full before:w-0.5 before:bg-gray-200">

                    {milestones.map((milestone, index) => {
                        const isCompleted = milestone.status === 'COMPLETED' || milestone.status === 'PAID';

                        // Dynamic Logic: Find the first non-completed milestone to mark as In Progress
                        const previousMilestone = milestones[index - 1];
                        const isFirstNonCompleted = !isCompleted && (!previousMilestone || previousMilestone.status === 'COMPLETED' || previousMilestone.status === 'PAID');

                        // Review State: Explicit status OR Pending Payment Request
                        const isReviewing = milestone.status === 'READY_FOR_REVIEW' || milestone.status === 'CHANGES_REQUESTED' || milestone.status === 'IN_DISPUTE' || milestone.paymentRequest?.status === 'PENDING';

                        // In Progress State: Strict check on status
                        const isInProgress = milestone.status === 'IN_PROGRESS';

                        // Calculated Pending State: Not completed, not reviewing, not in progress.
                        // Ideally, we respect the backend status, but for legacy visual continuity we can keep:
                        // const isPending = !isCompleted && !isInProgress && !isReviewing;
                        // But since we now rely on strict status, PENDING is simply status === 'PENDING'.
                        const isPending = milestone.status === 'PENDING';
                        const hasPendingRequest = milestone.paymentRequest?.status === 'PENDING';

                        return (
                            <div key={milestone.id} className="relative">
                                <div className={`absolute -left-[29px] top-0 h-12 w-12 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10
                              ${isCompleted ? 'bg-green-100 text-green-600' :
                                        isReviewing ? 'bg-yellow-100 text-yellow-600' :
                                            isInProgress ? 'bg-primary text-white shadow-lg' :
                                                'bg-white border-2 border-gray-300 text-gray-300'}
                           `}>
                                    {isCompleted ? <span className="material-symbols-outlined">check</span> :
                                        isReviewing ? <span className="material-symbols-outlined">rate_review</span> :
                                            isInProgress ? <span className="material-symbols-outlined animate-pulse">sync</span> :
                                                <span className="font-bold">{index + 1}</span>}
                                </div>

                                <div className={`p-6 rounded-2xl border relative overflow-hidden transition-all
                              ${isCompleted ? 'bg-white border-green-200 shadow-sm' :
                                        isReviewing ? 'bg-yellow-50 border-yellow-200 shadow-sm' :
                                            isInProgress ? 'bg-white border-2 border-primary shadow-md' :
                                                'bg-gray-50 border-gray-200 border-dashed opacity-70'}
                           `}>
                                    {isCompleted && <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">COMPLETADO</div>}
                                    {isReviewing && <div className="absolute top-0 right-0 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">EN REVISIÓN</div>}
                                    {isInProgress && <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-xl">EN PROGRESO</div>}

                                    <h3 className={`text-xl font-bold mb-2 ${isPending ? 'text-gray-500' : 'text-gray-900'}`}>{milestone.title}</h3>
                                    <p className={`mb-4 ${isPending ? 'text-gray-400' : 'text-gray-600'}`}>{milestone.description}</p>

                                    {/* Progress bar for IN_PROGRESS milestone */}
                                    {isInProgress && milestone.dueDate && (() => {
                                        const now = Date.now();
                                        const dueDate = new Date(milestone.dueDate).getTime();
                                        const startDate = milestone.completedAt
                                            ? new Date(milestone.completedAt).getTime()
                                            : dueDate - (30 * 24 * 60 * 60 * 1000); // Assume 30 days if no start date

                                        const totalDuration = dueDate - startDate;
                                        const elapsed = now - startDate;
                                        const progress = Math.min(95, Math.max(5, Math.round((elapsed / totalDuration) * 100)));

                                        return (
                                            <div className="mb-4">
                                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                    <span>Progreso estimado</span>
                                                    <span>{progress}%</span>
                                                </div>
                                                <div className="bg-gray-100 rounded-full h-2.5">
                                                    <div
                                                        className="bg-gradient-to-r from-pink-500 to-primary h-2.5 rounded-full transition-all"
                                                        style={{ width: `${progress}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    <div className="flex justify-between items-center text-sm border-t border-gray-100 pt-4 mt-4">
                                        <div>
                                            {/* Show action button if pending request, otherwise show amount */}
                                            {
                                                hasPendingRequest ? (
                                                    // Pending Request State
                                                    userRole === 'CLIENT' ? (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedRequest({
                                                                    milestone,
                                                                    requestId: milestone.paymentRequest!.id
                                                                });
                                                                setShowApproveModal(true);
                                                            }}
                                                            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-bold rounded-lg hover:from-purple-600 hover:to-purple-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                                                        >
                                                            <span className="material-symbols-outlined text-base">notification_important</span>
                                                            Revisar Solicitud Pago
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <span className="block font-bold text-gray-900">${milestone.amount.toLocaleString()} USD</span>
                                                            <span className="text-xs text-yellow-600 font-bold">Pendiente de liberación</span>
                                                        </>
                                                    )
                                                ) : milestone.status === 'READY_FOR_REVIEW' ? (
                                                    // Review State
                                                    userRole === 'CLIENT' ? (
                                                        <>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedMilestoneForReview(milestone);
                                                                    setReviewAction('INITIAL');
                                                                    setShowReviewModal(true);
                                                                }}
                                                                className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 shadow-md flex items-center gap-2 animate-pulse"
                                                            >
                                                                <span className="material-symbols-outlined text-base">rate_review</span>
                                                                Revisar Entregables
                                                            </button>
                                                            {milestone.reviewDeadline && (
                                                                <div className="mt-2 flex justify-center">
                                                                    <CountdownTimer targetDate={milestone.reviewDeadline} size="sm" />
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="block font-bold text-gray-900">${milestone.amount.toLocaleString()} USD</span>
                                                            <div className="flex flex-col">
                                                                <span className="text-xs text-blue-600 font-bold">En revisión por cliente</span>
                                                                {milestone.reviewDeadline && (
                                                                    <div className="mt-1">
                                                                        <CountdownTimer targetDate={milestone.reviewDeadline} size="sm" showIcon={true} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </>
                                                    )
                                                ) : (
                                                    // Default State (Pending, Progress, Completed)
                                                    userRole === 'VENDOR' ? (
                                                        // VENDOR ACTIONS LOGIC
                                                        (() => {
                                                            const hasPayment = milestone.amount > 0;
                                                            const isAlreadyCompleted = milestone.status === 'COMPLETED' || milestone.status === 'PAID';
                                                            const hasApprovedRequest = milestone.paymentRequest?.status === 'APPROVED' || milestone.paymentRequest?.status === 'COMPLETED';

                                                            // 1. Start Button (Pending & Previous Completed)
                                                            if (isPending && (index === 0 || milestones[index - 1]?.status === 'COMPLETED' || milestones[index - 1]?.status === 'PAID')) {
                                                                return (
                                                                    <button
                                                                        onClick={() => handleStartMilestone(milestone.id)}
                                                                        disabled={loading}
                                                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold shadow-sm hover:bg-blue-700 hover:shadow-md transition-all flex items-center gap-2"
                                                                    >
                                                                        {loading ? <span className="material-symbols-outlined animate-spin">sync</span> : <span className="material-symbols-outlined">play_arrow</span>}
                                                                        Iniciar Hito
                                                                    </button>
                                                                );
                                                            }

                                                            // 1.5. Re-Submit Logic (Changes Requested)
                                                            if (milestone.status === 'CHANGES_REQUESTED') {
                                                                return (
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelectedActionMilestone(milestone);
                                                                            setShowPaymentRequestModal(true);
                                                                        }}
                                                                        className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-bold rounded-lg hover:from-orange-600 hover:to-orange-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                                                                    >
                                                                        <span className="material-symbols-outlined text-base">rate_review</span>
                                                                        Solicitar Revisión
                                                                    </button>
                                                                );
                                                            }

                                                            // 2. Actions for In Progress
                                                            if (isInProgress) {
                                                                // If has payment -> Request Payment
                                                                if (hasPayment && !milestone.paymentRequest) {
                                                                    return (
                                                                        <button
                                                                            onClick={() => {
                                                                                setSelectedActionMilestone(milestone);
                                                                                setShowPaymentRequestModal(true);
                                                                            }}
                                                                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-bold rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                                                                        >
                                                                            <span className="material-symbols-outlined text-base">lock_open</span>
                                                                            Solicitar Liberación
                                                                        </button>
                                                                    );
                                                                }

                                                                // If no payment OR payment approved -> Complete
                                                                if (!hasPayment || (hasPayment && hasApprovedRequest && milestone.isPaid)) {
                                                                    return (
                                                                        <button
                                                                            onClick={() => {
                                                                                setSelectedActionMilestone(milestone);
                                                                                setShowCompleteModal(true);
                                                                            }}
                                                                            className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-bold rounded-lg hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                                                                        >
                                                                            <span className="material-symbols-outlined text-base">check_circle</span>
                                                                            Completar
                                                                        </button>
                                                                    );
                                                                }
                                                            }

                                                            // Fallback info
                                                            return (
                                                                <>
                                                                    <span className={`block font-bold ${isPending ? 'text-gray-400' : 'text-gray-900'}`}>${milestone.amount.toLocaleString()} USD</span>
                                                                    <span className="text-xs text-gray-500">{milestone.isPaid ? 'Pagado' : (isCompleted ? 'En Garantía (Escrow)' : (milestone.status === 'IN_DISPUTE' ? '⚖️ En Mediación' : milestone.status === 'CHANGES_REQUESTED' ? 'Cambios Solicitados' : ''))}</span>
                                                                </>
                                                            );
                                                        })()
                                                    ) : (
                                                        // CLIENT DEFAULT VIEW
                                                        <>
                                                            <span className={`block font-bold ${isPending ? 'text-gray-400' : 'text-gray-900'}`}>${milestone.amount.toLocaleString()} USD</span>
                                                            <span className="text-xs text-gray-500">{milestone.isPaid ? 'Pagado' : (isCompleted ? 'En Garantía (Escrow)' : (milestone.status === 'IN_DISPUTE' ? '⚖️ En Mediación' : milestone.status === 'CHANGES_REQUESTED' ? 'Cambios Solicitados' : ''))}</span>
                                                        </>
                                                    )
                                                )
                                            }
                                        </div>
                                        <div className="text-right">
                                            {milestone.dueDate && (
                                                <>
                                                    <span className={`block font-bold ${isPending ? 'text-gray-400' : 'text-primary'}`}>Entrega estimada</span>
                                                    <span className="text-xs text-gray-500">{new Date(milestone.dueDate).toLocaleDateString()}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Payment request status badge: Hide if Completed (Request 1) */}
                                    {milestone.paymentRequest && milestone.paymentRequest.status !== 'PENDING' && !isCompleted && (
                                        <div className="mt-3">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${milestone.paymentRequest.status === 'APPROVED' ? 'bg-purple-50 border-purple-200 text-purple-700' :
                                                milestone.paymentRequest.status === 'COMPLETED' ? 'bg-green-50 border-green-200 text-green-700' :
                                                    'bg-red-50 border-red-200 text-red-700'
                                                }`}>
                                                <span className="material-symbols-outlined text-sm">
                                                    {milestone.paymentRequest.status === 'COMPLETED' ? 'check_circle' :
                                                        milestone.paymentRequest.status === 'APPROVED' ? 'thumb_up' : 'cancel'}
                                                </span>
                                                <span>
                                                    {milestone.paymentRequest.status === 'APPROVED' && 'Aprobado - Procesando'}
                                                    {milestone.paymentRequest.status === 'COMPLETED' && 'Pago Completado'}
                                                    {milestone.paymentRequest.status === 'REJECTED' && 'Rechazado'}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Completion note */}
                                    {milestone.completionNote && (
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <details className="group">
                                                <summary className="cursor-pointer flex items-center gap-2 text-sm font-bold text-green-700 hover:text-green-800 select-none">
                                                    <span className="material-symbols-outlined text-base">description</span>
                                                    Ver justificación del vendor
                                                    <span className="material-symbols-outlined text-base ml-auto group-open:rotate-180 transition-transform">expand_more</span>
                                                </summary>
                                                <p className="mt-3 text-sm text-gray-700 italic bg-green-50 p-3 rounded-lg border border-green-100">
                                                    "{milestone.completionNote}"
                                                </p>
                                            </details>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                </div>
            </div>

            {/* Approve Payment Modal */}
            {showApproveModal && selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95">
                        <div className="p-6 relative">
                            <button
                                onClick={() => setShowApproveModal(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="material-symbols-outlined text-3xl text-purple-600">payments</span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Solicitud de Pago</h3>
                                <p className="text-gray-600 text-sm mb-4">
                                    Hito: <span className="font-bold">{selectedRequest.milestone.title}</span>
                                </p>
                                <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
                                    <p className="text-xs text-purple-600 font-bold uppercase mb-1">Monto Solicitado</p>
                                    <p className="text-3xl font-black text-gray-900">${selectedRequest.milestone.amount.toLocaleString()}</p>
                                </div>
                            </div>

                            {selectedRequest.milestone.paymentRequest?.vendorNote && (
                                <div className="mb-6 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                    <p className="text-xs font-bold text-gray-700 mb-1">Nota del Vendor:</p>
                                    <p className="text-sm text-gray-600 italic">"{selectedRequest.milestone.paymentRequest.vendorNote}"</p>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowApproveModal(false);
                                        setShowRejectModal(true);
                                    }}
                                    className="flex-1 py-2.5 text-red-600 font-bold hover:bg-red-50 rounded-xl border border-red-200"
                                    disabled={loading}
                                >
                                    Rechazar
                                </button>
                                <button
                                    onClick={handleApprovePayment}
                                    className="flex-1 py-2.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                                            Procesando...
                                        </span>
                                    ) : (
                                        'Aprobar y Pagar'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Payment Modal */}
            {showRejectModal && selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95">
                        <div className="p-6">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="material-symbols-outlined text-3xl text-red-600">cancel</span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Rechazar Solicitud</h3>
                                <p className="text-gray-600 text-sm">
                                    Hito: <span className="font-bold">{selectedRequest.milestone.title}</span>
                                </p>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Motivo del Rechazo <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none resize-none h-32"
                                    placeholder="Explica por qué rechazas esta solicitud de pago..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    disabled={loading}
                                />
                                <p className="text-xs text-gray-500 mt-1">El vendor recibirá este mensaje</p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowRejectModal(false);
                                        setShowApproveModal(true);
                                        setRejectionReason('');
                                    }}
                                    className="flex-1 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl"
                                    disabled={loading}
                                >
                                    Volver
                                </button>
                                <button
                                    onClick={handleRejectPayment}
                                    className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={loading || !rejectionReason.trim()}
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                                            Rechazando...
                                        </span>
                                    ) : (
                                        'Confirmar Rechazo'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Deliverable Review Modal */}
            {showReviewModal && selectedMilestoneForReview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in zoom-in-95">
                        <div className="p-6">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="material-symbols-outlined text-3xl text-blue-600">rate_review</span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Revisión de Entregables</h3>
                                <p className="text-gray-600 text-sm">
                                    Hito: <span className="font-bold">{selectedMilestoneForReview.title}</span>
                                </p>
                            </div>

                            {reviewAction === 'INITIAL' && (
                                <div className="space-y-4">
                                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
                                        <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-base">folder_open</span>
                                            Archivos Entregados
                                        </h4>
                                        {selectedMilestoneForReview.paymentRequest?.vendorNote && (
                                            <div className="mb-3 text-sm italic text-gray-600 bg-white p-2 rounded border">{selectedMilestoneForReview.paymentRequest.vendorNote}</div>
                                        )}

                                        <p className="text-sm text-gray-500 italic">Archivos disponibles en la pestaña de Archivos.</p>
                                    </div>

                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4">
                                        <p className="text-sm text-blue-800">
                                            <span className="font-bold">Nota:</span> Al aprobar los entregables, se liberarán automáticamente los fondos del hito (${selectedMilestoneForReview.amount.toLocaleString()}) al vendor.
                                        </p>
                                        {selectedMilestoneForReview.reviewDeadline && (
                                            <div className="mt-2 flex items-center gap-2">
                                                <span className="text-xs font-bold text-gray-500">Aprobación automática en:</span>
                                                <CountdownTimer targetDate={selectedMilestoneForReview.reviewDeadline} size="sm" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setReviewAction('REJECT')}
                                            className="p-4 border-2 border-red-100 rounded-xl hover:bg-red-50 hover:border-red-200 transition-all text-center group"
                                        >
                                            <span className="material-symbols-outlined text-3xl text-red-500 mb-2 group-hover:scale-110 transition-transform">thumb_down</span>
                                            <h4 className="font-bold text-red-700">Solicitar Cambios</h4>
                                            <p className="text-xs text-red-600 mt-1">El trabajo requiere correcciones</p>
                                        </button>

                                        <button
                                            onClick={() => setReviewAction('APPROVE')}
                                            className="p-4 border-2 border-green-100 bg-green-50/50 rounded-xl hover:bg-green-100 hover:border-green-300 transition-all text-center group"
                                        >
                                            <span className="material-symbols-outlined text-3xl text-green-500 mb-2 group-hover:scale-110 transition-transform">verified</span>
                                            <h4 className="font-bold text-green-700">Aprobar y Pagar</h4>
                                            <p className="text-xs text-green-600 mt-1">Trabajo correcto, liberar fondos</p>
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => { setShowReviewModal(false); setReviewAction('INITIAL'); }}
                                        className="w-full py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl mt-2"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            )}

                            {reviewAction === 'REJECT' && (
                                <div className="space-y-4">
                                    <h4 className="font-bold text-gray-900">¿Qué cambios son necesarios?</h4>
                                    <textarea
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none resize-none h-32"
                                        placeholder="Describe los cambios requeridos..."
                                        value={reviewComment}
                                        onChange={(e) => setReviewComment(e.target.value)}
                                    />
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={() => setReviewAction('INITIAL')}
                                            className="flex-1 py-2 text-gray-600 font-bold hover:bg-gray-50 rounded-lg"
                                        >
                                            Atrás
                                        </button>
                                        <button
                                            onClick={() => handleReviewSubmit('REJECTED')}
                                            disabled={!reviewComment.trim() || loading}
                                            className="flex-1 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 disabled:opacity-50"
                                        >
                                            {loading ? 'Enviando...' : 'Solicitar Cambios'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {reviewAction === 'APPROVE' && (
                                <div className="space-y-4">
                                    <div className="text-center py-4">
                                        <span className="material-symbols-outlined text-5xl text-green-500 mb-2">payments</span>
                                        <h4 className="text-xl font-bold text-gray-900">Confirmar Liberación de Fondos</h4>
                                        <p className="text-gray-600 mt-2">
                                            Vas a liberar <span className="font-bold text-gray-900">${selectedMilestoneForReview.amount.toLocaleString()} USD</span> al vendor.
                                            <br />Esta acción es irreversible.
                                        </p>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={() => setReviewAction('INITIAL')}
                                            className="flex-1 py-2 text-gray-600 font-bold hover:bg-gray-50 rounded-lg"
                                        >
                                            Atrás
                                        </button>
                                        <button
                                            onClick={() => handleReviewSubmit('APPROVED')}
                                            disabled={loading}
                                            className="flex-1 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 shadow-lg shadow-green-200"
                                        >
                                            {loading ? 'Procesando...' : 'Confirmar y Pagar'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div >
            )}

            {/* Vendor Request Payment Modal */}
            {
                showPaymentRequestModal && selectedActionMilestone && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95">
                            <div className="p-6">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="material-symbols-outlined text-3xl text-blue-600">payments</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Solicitar Pago</h3>
                                    <p className="text-gray-600 text-sm mb-4">
                                        Hito: <span className="font-bold">{selectedActionMilestone.title}</span>
                                    </p>
                                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                                        <p className="text-xs text-blue-600 font-bold uppercase mb-1">Monto a Solicitar</p>
                                        <p className="text-3xl font-black text-gray-900">${selectedActionMilestone.amount.toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Nota Opcional
                                    </label>
                                    <textarea
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24"
                                        placeholder="Añade información adicional para el cliente (opcional)..."
                                        value={actionNote}
                                        onChange={(e) => setActionNote(e.target.value)}
                                        disabled={loading}
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setShowPaymentRequestModal(false);
                                            setSelectedActionMilestone(null);
                                            setActionNote('');
                                        }}
                                        className="flex-1 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl"
                                        disabled={loading}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleRequestPayment}
                                        className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                                                Enviando...
                                            </span>
                                        ) : (
                                            'Enviar Solicitud'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Vendor Complete Milestone Modal */}
            {
                showCompleteModal && selectedActionMilestone && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95">
                            <div className="p-6">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="material-symbols-outlined text-3xl text-green-600">check_circle</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Marcar Hito Completado</h3>
                                    <p className="text-gray-600 text-sm">
                                        Hito: <span className="font-bold">{selectedActionMilestone.title}</span>
                                    </p>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Justificación <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none resize-none h-32"
                                        placeholder="Describe por qué este hito está completado..."
                                        value={actionNote}
                                        onChange={(e) => setActionNote(e.target.value)}
                                        disabled={loading}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Esta justificación será visible para el cliente</p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setShowCompleteModal(false);
                                            setSelectedActionMilestone(null);
                                            setActionNote('');
                                        }}
                                        className="flex-1 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl"
                                        disabled={loading}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleCompleteMilestone}
                                        className="flex-1 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={loading || !actionNote.trim()}
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                                                Procesando...
                                            </span>
                                        ) : (
                                            'Confirmar Completado'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
};

export default ClientProjectMilestones;
