import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

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
    };
}

export interface VendorRoadmapEditorRef {
    openNotifyModal: () => void;
}

interface VendorRoadmapEditorProps {
    project: any;
    isEditing: boolean;
    onSave: (newMilestones: Milestone[], notificationText?: string) => Promise<void>;
    onCancel: () => void;
}

const VendorRoadmapEditor = forwardRef(({ project, isEditing, onSave, onCancel }: VendorRoadmapEditorProps, ref: React.ForwardedRef<VendorRoadmapEditorRef>) => {
    const [milestones, setMilestones] = useState<Milestone[]>([]);

    // Edit/Add Modal State
    const [showModal, setShowModal] = useState(false);
    const [currentNode, setCurrentNode] = useState<Partial<Milestone>>({});
    const [insertIndex, setInsertIndex] = useState<number | null>(null);
    const [error, setError] = useState('');

    // Notify Client Modal State
    const [showNotifyModal, setShowNotifyModal] = useState(false);
    const [notificationText, setNotificationText] = useState('');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');

    // Financial Modals State
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [showPaymentRequestModal, setShowPaymentRequestModal] = useState(false);
    const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
    const [completionNote, setCompletionNote] = useState('');
    const [paymentNote, setPaymentNote] = useState('');
    const [financialLoading, setFinancialLoading] = useState(false);

    // Toast notifications
    const { showToast } = useToast();

    useEffect(() => {
        if (project?.milestones) {
            setMilestones(JSON.parse(JSON.stringify(project.milestones)));
        }
    }, [project]);

    // On Cancel from Parent
    useEffect(() => {
        if (!isEditing) {
            if (project?.milestones) {
                setMilestones(JSON.parse(JSON.stringify(project.milestones)));
            }
        }
    }, [isEditing, project]);

    useImperativeHandle(ref, () => ({
        openNotifyModal: () => {
            setShowNotifyModal(true);
            setSaveStatus('idle');
        }
    }));

    const handleConfirmSave = async () => {
        setSaveStatus('saving');
        await onSave(milestones, notificationText);
        setSaveStatus('success');

        // Auto close after success
        setTimeout(() => {
            setShowNotifyModal(false);
            setNotificationText('');
            setSaveStatus('idle');
        }, 1500);
    };

    const handleStartMilestone = async (id: string) => {
        setFinancialLoading(true);
        try {
            await api.post(`/milestones/${id}/start`);
            setMilestones(prev => prev.map(m =>
                m.id === id ? { ...m, status: 'IN_PROGRESS' } : m
            ));
            showToast('Hito iniciado', 'success');
        } catch (error: any) {
            console.error('Error starting milestone:', error);
            showToast(error.response?.data?.message || 'Error al iniciar hito', 'error');
        } finally {
            setFinancialLoading(false);
        }
    };

    const handleCompleteMilestone = async () => {
        if (!selectedMilestone || !completionNote.trim()) {
            showToast('La justificación es obligatoria', 'warning');
            return;
        }

        setFinancialLoading(true);
        try {
            await api.post(`/milestones/${selectedMilestone.id}/complete`, {
                completionNote: completionNote.trim()
            });

            // Update local state
            setMilestones(prev => prev.map(m =>
                m.id === selectedMilestone.id
                    ? { ...m, status: 'COMPLETED', completionNote: completionNote.trim(), completedAt: new Date().toISOString() }
                    : m
            ));

            // Close modal and reset
            setShowCompleteModal(false);
            setSelectedMilestone(null);
            setCompletionNote('');
            showToast('Hito marcado como completado', 'success');
        } catch (error) {
            console.error('Error completing milestone:', error);
            showToast('Error al completar el hito', 'error');
        } finally {
            setFinancialLoading(false);
        }
    };

    // Handle request payment for milestone
    const handleRequestPayment = async () => {
        if (!selectedMilestone) return;

        setFinancialLoading(true);
        try {
            const response = await api.post(`/milestones/${selectedMilestone.id}/request-payment`);

            // Update local state with new milestone data
            setMilestones(prev => prev.map(m =>
                m.id === selectedMilestone.id
                    ? { ...m, ...response.data.milestone }
                    : m
            ));

            // Close modal and reset
            setShowPaymentRequestModal(false);
            setSelectedMilestone(null);
            setPaymentNote('');
            showToast('Solicitud de revisión enviada correctamente', 'success');
        } catch (error: any) {
            console.error('Error requesting payment:', error);
            showToast(error.response?.data?.message || 'Error al solicitar revisión', 'error');
        } finally {
            setFinancialLoading(false);
        }
    };

    // Handle open dispute (for vendor after 3+ rejections)
    const handleOpenDispute = async (milestoneId: string) => {
        if (!window.confirm('¿Estás seguro de que deseas abrir una disputa? Esto notificará al equipo de soporte.')) {
            return;
        }

        setFinancialLoading(true);
        try {
            const response = await api.post(`/milestones/${milestoneId}/open-dispute`, {
                reason: 'Vendor opened dispute after multiple rejections'
            });

            // Update local state
            setMilestones(prev => prev.map(m =>
                m.id === milestoneId
                    ? { ...m, ...response.data.milestone }
                    : m
            ));

            showToast('Disputa abierta. El equipo de soporte revisará el caso.', 'info');
        } catch (error: any) {
            console.error('Error opening dispute:', error);
            showToast(error.response?.data?.message || 'Error al abrir disputa', 'error');
        } finally {
            setFinancialLoading(false);
        }
    };

    const openAddModal = (index: number) => {
        setInsertIndex(index);
        setCurrentNode({
            title: '',
            description: '',
            amount: 0,
            status: 'PENDING',
            dueDate: ''
        });
        setError('');
        setShowModal(true);
    };

    const openEditModal = (milestone: Milestone) => {
        setInsertIndex(null);
        setCurrentNode({ ...milestone });
        setError('');
        setShowModal(true);
    };

    const handleDeleteNode = (id: string) => {
        if (window.confirm('¿Eliminar este hito?')) {
            setMilestones(prev => prev.filter(m => m.id !== id));
        }
    };

    const validateDates = (dateStr: string, index: number, isNew: boolean) => {
        if (!dateStr) return null;
        const date = new Date(dateStr).getTime();

        let prevNode = null;
        let nextNode = null;

        if (isNew && insertIndex !== null) {
            prevNode = insertIndex > 0 ? milestones[insertIndex - 1] : null;
            nextNode = insertIndex < milestones.length ? milestones[insertIndex] : null;
        } else {
            const currentIndex = milestones.findIndex(m => m.id === currentNode.id);
            prevNode = currentIndex > 0 ? milestones[currentIndex - 1] : null;
            nextNode = currentIndex < milestones.length - 1 ? milestones[currentIndex + 1] : null;
        }

        if (prevNode?.dueDate && new Date(prevNode.dueDate).getTime() > date) {
            return `La fecha debe ser posterior al hito anterior (${new Date(prevNode.dueDate).toLocaleDateString()})`;
        }
        if (nextNode?.dueDate && new Date(nextNode.dueDate).getTime() < date) {
            return `La fecha debe ser anterior al hito siguiente (${new Date(nextNode.dueDate).toLocaleDateString()})`;
        }

        return null;
    };

    const handleSaveNode = () => {
        if (!currentNode.title || !currentNode.dueDate || currentNode.amount === undefined) {
            setError('Todos los campos son obligatorios');
            return;
        }

        const dateError = validateDates(currentNode.dueDate, insertIndex ?? 0, insertIndex !== null);
        if (dateError) {
            setError(dateError);
            return;
        }

        if (insertIndex !== null) {
            const newNode: Milestone = {
                ...(currentNode as Milestone),
                id: `m-new-${Date.now()}`,
                status: 'PENDING',
                isPaid: false
            };
            const newMilestones = [...milestones];
            newMilestones.splice(insertIndex, 0, newNode);
            setMilestones(newMilestones);
        } else {
            setMilestones(prev => prev.map(m => m.id === currentNode.id ? { ...m, ...currentNode } as Milestone : m));
        }

        setShowModal(false);
    };

    return (
        <div className="space-y-6">
            <div className={`relative pl-8 space-y-12 before:content-[''] before:absolute before:top-0 before:left-[23px] before:h-full before:w-0.5 before:bg-gray-200 transition-opacity ${isEditing ? 'opacity-100' : ''}`}>

                {isEditing && milestones.length > 0 && milestones[0].status === 'PENDING' && (
                    <div className="absolute -left-[5px] -top-8 w-14 flex justify-center z-20">
                        <button
                            onClick={() => openAddModal(0)}
                            className="bg-primary text-white p-1 rounded-full shadow-lg hover:scale-110 transition-transform"
                            title="Insertar Hito al Inicio"
                        >
                            <span className="material-symbols-outlined text-sm">add</span>
                        </button>
                    </div>
                )}

                {milestones.map((milestone, index) => {
                    const isCompleted = milestone.status === 'COMPLETED' || milestone.status === 'PAID';
                    const isInProgress = milestone.status === 'IN_PROGRESS' || milestone.status === 'CHANGES_REQUESTED';
                    const isReviewing = milestone.status === 'READY_FOR_REVIEW';
                    const isDisputed = milestone.status === 'IN_DISPUTE';
                    const isPending = milestone.status === 'PENDING';
                    const isLocked = isCompleted || isReviewing; // Lock editing if reviewing

                    return (
                        <div key={milestone.id} className="relative group/node">
                            <div className={`absolute -left-[29px] top-0 h-12 w-12 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 transition-all
                                    ${isCompleted ? 'bg-green-100 text-green-600' :
                                    isReviewing ? 'bg-amber-100 text-amber-600' :
                                        isDisputed ? 'bg-red-100 text-red-600' :
                                            isInProgress ? 'bg-primary text-white shadow-lg' :
                                                'bg-white border-2 border-gray-300 text-gray-300'}
                                `}>
                                {isCompleted ? <span className="material-symbols-outlined">check</span> :
                                    isReviewing ? <span className="material-symbols-outlined">rate_review</span> :
                                        isDisputed ? <span className="material-symbols-outlined">gavel</span> :
                                            isInProgress ? <span className="material-symbols-outlined animate-pulse">sync</span> :
                                                <span className="font-bold">{index + 1}</span>}
                            </div>

                            <div className={`p-6 rounded-2xl border relative overflow-hidden transition-all group-hover/node:shadow-md
                                    ${isCompleted ? 'bg-white border-green-200 shadow-sm' :
                                    isReviewing ? 'bg-amber-50 border-amber-200' :
                                        isDisputed ? 'bg-red-50 border-red-200' :
                                            isInProgress ? 'bg-white border-2 border-primary shadow-md' :
                                                'bg-gray-50 border-gray-200 border-dashed'}
                                `}>
                                {isCompleted && <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">COMPLETADO</div>}
                                {isReviewing && <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">EN REVISIÓN</div>}
                                {isDisputed && <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">EN DISPUTA</div>}
                                {isInProgress && <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-xl">EN PROGRESO</div>}

                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className={`text-xl font-bold mb-2 ${isPending ? 'text-gray-500' : 'text-gray-900'}`}>{milestone.title}</h3>
                                        <p className={`mb-4 text-sm ${isPending ? 'text-gray-400' : 'text-gray-600'}`}>{milestone.description}</p>
                                    </div>

                                    {isEditing && !isLocked && (
                                        <div className="flex gap-2 ml-4">
                                            <button
                                                onClick={() => openEditModal(milestone)}
                                                className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                title="Editar Hito"
                                            >
                                                <span className="material-symbols-outlined">edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteNode(milestone.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Eliminar Hito"
                                            >
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-between items-center text-sm border-t border-gray-100 pt-4 mt-2">
                                    {/* Left side: Amount or Action Button */}
                                    <div>
                                        {/* Show amount only if no action button will replace it */}
                                        {(milestone.amount === 0 || milestone.paymentRequest || isCompleted) && (
                                            <div>
                                                <span className={`block font-bold ${isPending ? 'text-gray-400' : 'text-gray-900'}`}>${milestone.amount.toLocaleString()} USD</span>
                                                {(milestone.isPaid || isCompleted) && (
                                                    <div className="mt-1">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${milestone.isPaid ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                            {milestone.isPaid ? 'Pagado' : 'En Garantía'}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
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

                                {/* Financial Actions - Only in view mode */}
                                {!isEditing && (() => {
                                    const isPreviousCompleted = index === 0 || milestones[index - 1]?.status === 'COMPLETED' || milestones[index - 1]?.status === 'PAID';
                                    const hasPayment = milestone.amount > 0;
                                    const isAlreadyCompleted = milestone.status === 'COMPLETED' || milestone.status === 'PAID';
                                    const hasApprovedRequest = milestone.paymentRequest?.status === 'APPROVED' || milestone.paymentRequest?.status === 'COMPLETED';
                                    const isInProgress = milestone.status === 'IN_PROGRESS' || milestone.status === 'CHANGES_REQUESTED';
                                    const isReviewing = milestone.status === 'READY_FOR_REVIEW';
                                    const isDisputed = milestone.status === 'IN_DISPUTE';

                                    if (isPending && isPreviousCompleted && !isAlreadyCompleted) {
                                        return (
                                            <div className="mt-4 flex justify-end">
                                                <button
                                                    onClick={() => handleStartMilestone(milestone.id)}
                                                    disabled={financialLoading}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold shadow-sm hover:bg-blue-700 hover:shadow-md transition-all flex items-center gap-2"
                                                >
                                                    {financialLoading ? <span className="material-symbols-outlined animate-spin">sync</span> : <span className="material-symbols-outlined">play_arrow</span>}
                                                    Iniciar Hito
                                                </button>
                                            </div>
                                        );
                                    }

                                    // Action button in top-right corner
                                    if (!isAlreadyCompleted && !isReviewing && !isDisputed) {
                                        // Hito CON pago y en progreso/changes requested → Mostrar botón "Solicitar Revisión"
                                        if (hasPayment && isInProgress) {
                                            // Check if previous milestone is completed
                                            if (!isPreviousCompleted) {
                                                const previousMilestone = milestones[index - 1];
                                                return (
                                                    <button
                                                        disabled
                                                        className="mt-4 px-4 py-2 bg-gray-400 text-white text-sm font-bold rounded-lg cursor-not-allowed opacity-75 flex items-center gap-2"
                                                        title={`Bloqueado. Completa primero: "${previousMilestone?.title}"`}
                                                    >
                                                        <span className="material-symbols-outlined text-base">lock</span>
                                                        Bloqueado ${milestone.amount.toLocaleString()}
                                                    </button>
                                                );
                                            }

                                            return (
                                                <button
                                                    onClick={() => {
                                                        setSelectedMilestone(milestone);
                                                        setShowPaymentRequestModal(true);
                                                    }}
                                                    className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-bold rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                                                    title="Solicitar liberación de fondos al cliente"
                                                >
                                                    <span className="material-symbols-outlined text-base">payments</span>
                                                    Solicitar Liberación de Pago (${milestone.amount.toLocaleString()})
                                                </button>
                                            );
                                        }

                                        // Hito SIN pago O con pago aprobado → Marcar completado
                                        if (!hasPayment || (hasPayment && hasApprovedRequest && milestone.isPaid)) {
                                            if (!isPreviousCompleted) {
                                                const previousMilestone = milestones[index - 1];
                                                return (
                                                    <div
                                                        className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 cursor-help"
                                                        title={`Completa primero: "${previousMilestone?.title}"`}
                                                    >
                                                        <span className="material-symbols-outlined text-sm">lock</span>
                                                        <span>Bloqueado</span>
                                                    </div>
                                                );
                                            }

                                            return (
                                                <button
                                                    onClick={() => {
                                                        setSelectedMilestone(milestone);
                                                        setShowCompleteModal(true);
                                                    }}
                                                    className="absolute top-4 right-4 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-bold rounded-lg hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                                                    title="Marcar este hito como completado"
                                                >
                                                    <span className="material-symbols-outlined text-base">check_circle</span>
                                                    Completar
                                                </button>
                                            );
                                        }
                                    }

                                    return null;
                                })()}

                                {/* Payment request status badge - Subtle, bottom-right - Hidden if COMPLETED (Paid) or PENDING (Redundant) */}
                                {!isEditing && milestone.paymentRequest && milestone.paymentRequest.status !== 'COMPLETED' && milestone.paymentRequest.status !== 'PENDING' && (
                                    <div className="absolute top-4 right-4">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${milestone.paymentRequest.status === 'PENDING' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                                            milestone.paymentRequest.status === 'APPROVED' ? 'bg-purple-50 border-purple-200 text-purple-700' :
                                                milestone.paymentRequest.status === 'COMPLETED' ? 'bg-green-50 border-green-200 text-green-700' :
                                                    'bg-red-50 border-red-200 text-red-700'
                                            }`}>
                                            <span className="material-symbols-outlined text-sm">
                                                {milestone.paymentRequest.status === 'COMPLETED' ? 'check_circle' :
                                                    milestone.paymentRequest.status === 'APPROVED' ? 'thumb_up' :
                                                        milestone.paymentRequest.status === 'REJECTED' ? 'cancel' : 'schedule'}
                                            </span>
                                            <span>
                                                {milestone.paymentRequest.status === 'PENDING' && 'Pendiente'}
                                                {milestone.paymentRequest.status === 'APPROVED' && 'Aprobado'}
                                                {milestone.paymentRequest.status === 'COMPLETED' && 'Pagado'}
                                                {milestone.paymentRequest.status === 'REJECTED' && 'Rechazado'}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Completion note - Expandable section */}
                                {milestone.completionNote && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <details className="group">
                                            <summary className="cursor-pointer flex items-center gap-2 text-sm font-bold text-green-700 hover:text-green-800 select-none">
                                                <span className="material-symbols-outlined text-base">description</span>
                                                Ver justificación de completado
                                                <span className="material-symbols-outlined text-base ml-auto group-open:rotate-180 transition-transform">expand_more</span>
                                            </summary>
                                            <p className="mt-3 text-sm text-gray-700 italic bg-green-50 p-3 rounded-lg border border-green-100">
                                                "{milestone.completionNote}"
                                            </p>
                                        </details>
                                    </div>
                                )}

                                {/* Client Feedback - Show when CHANGES_REQUESTED */}
                                {milestone.status === 'CHANGES_REQUESTED' && milestone.reviews && milestone.reviews.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-amber-100">
                                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="material-symbols-outlined text-amber-600">feedback</span>
                                                <h4 className="font-bold text-amber-900">Cambios Solicitados por el Cliente</h4>
                                                <span className="ml-auto text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                                                    Intento {milestone.reviews.length}
                                                </span>
                                            </div>
                                            <p className="text-sm text-amber-900 italic">
                                                "{milestone.reviews[milestone.reviews.length - 1].comment || 'El cliente solicitó cambios'}"
                                            </p>

                                            {/* Show "Open Dispute" button if 3+ rejections */}
                                            {!isEditing && milestone.reviews.length >= 3 && (
                                                <div className="mt-3 pt-3 border-t border-amber-200">
                                                    <p className="text-xs text-amber-700 mb-2">
                                                        Has recibido {milestone.reviews.length} rechazos. Puedes abrir una disputa o continuar trabajando.
                                                    </p>
                                                    <button
                                                        onClick={() => handleOpenDispute(milestone.id)}
                                                        disabled={financialLoading}
                                                        className="px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-all flex items-center gap-2"
                                                    >
                                                        <span className="material-symbols-outlined text-base">gavel</span>
                                                        Abrir Disputa
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {
                                isEditing && (
                                    (() => {
                                        // Logic: Cannot insert before a milestone that is already Reviewing or Completed
                                        const nextMilestone = milestones[index + 1];
                                        const isNextLocked = nextMilestone?.status === 'READY_FOR_REVIEW' ||
                                            nextMilestone?.status === 'COMPLETED' ||
                                            nextMilestone?.status === 'PAID';

                                        const canAddAfter = !isNextLocked;

                                        if (!canAddAfter) return null;

                                        return (
                                            <div className="absolute left-[24px] -bottom-8 w-0.5 h-8 z-20 flex items-center justify-center">
                                                <button
                                                    onClick={() => openAddModal(index + 1)}
                                                    className="bg-white border-2 border-primary text-primary w-6 h-6 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors shadow-sm transform translate-x-[-1px]"
                                                    title="Insertar Hito Aquí"
                                                >
                                                    <span className="material-symbols-outlined text-sm font-bold">add</span>
                                                </button>
                                            </div>
                                        );
                                    })()
                                )
                            }
                        </div>
                    );
                })}
            </div>

            {
                showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 animate-in zoom-in-95">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">{insertIndex !== null ? 'Añadir Nuevo Hito' : 'Editar Hito'}</h3>

                            {error && (
                                <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium flex items-center gap-2">
                                    <span className="material-symbols-outlined">error</span> {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Título del Hito</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                                        value={currentNode.title}
                                        onChange={e => setCurrentNode({ ...currentNode, title: e.target.value })}
                                        placeholder="Ej. Diseño UI/UX"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Costo (USD)</label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                                            value={currentNode.amount || ''}
                                            onChange={e => {
                                                const value = e.target.value.replace(/[^0-9]/g, '');
                                                setCurrentNode({ ...currentNode, amount: value ? parseInt(value, 10) : 0 });
                                            }}
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Fecha de Entrega</label>
                                        <input
                                            type="date"
                                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                                            value={currentNode.dueDate ? new Date(currentNode.dueDate).toISOString().split('T')[0] : ''}
                                            onChange={e => setCurrentNode({ ...currentNode, dueDate: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Descripción / Entregables</label>
                                    <textarea
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none h-24"
                                        value={currentNode.description}
                                        onChange={e => setCurrentNode({ ...currentNode, description: e.target.value })}
                                        placeholder="Resumen de lo que se entregará..."
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 mt-2">
                                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-50 rounded-lg">Cancelar</button>
                                <button onClick={handleSaveNode} className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90">Guardar Hito</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                showNotifyModal && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95">
                            {saveStatus === 'success' ? (
                                <div className="text-center py-6">
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in spin-in-180">
                                        <span className="material-symbols-outlined text-4xl">check</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">¡Roadmap Actualizado!</h3>
                                    <p className="text-gray-500 text-sm mt-2">Los cambios se han guardado y el cliente ha sido notificado.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="text-center mb-6">
                                        <div className="w-12 h-12 bg-blue-100 text-primary rounded-full flex items-center justify-center mx-auto mb-3">
                                            <span className="material-symbols-outlined text-2xl">send</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">Actualizar Roadmap</h3>
                                        <p className="text-gray-500 text-sm mt-1">Se notificará al cliente sobre los cambios realizados.</p>
                                    </div>

                                    <div className="mb-6">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Mensaje opcional para el cliente</label>
                                        <textarea
                                            className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none h-24 bg-gray-50 text-sm"
                                            placeholder="Hola, he ajustado las fechas de los próximos hitos debido a..."
                                            value={notificationText}
                                            onChange={e => setNotificationText(e.target.value)}
                                            disabled={saveStatus === 'saving'}
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowNotifyModal(false)}
                                            className="flex-1 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl text-sm"
                                            disabled={saveStatus === 'saving'}
                                        >
                                            Volver a editar
                                        </button>
                                        <button
                                            onClick={handleConfirmSave}
                                            className="flex-1 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/20 text-sm flex items-center justify-center gap-2"
                                            disabled={saveStatus === 'saving'}
                                        >
                                            {saveStatus === 'saving' ? (
                                                <>
                                                    <span className="material-symbols-outlined animate-spin text-lg">sync</span> Guardando...
                                                </>
                                            ) : (
                                                'Confirmar y Enviar'
                                            )}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )
            }

            {/* Complete Milestone Modal */}
            {
                showCompleteModal && selectedMilestone && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95">
                            <div className="p-6">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="material-symbols-outlined text-3xl text-green-600">check_circle</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Marcar Hito Completado</h3>
                                    <p className="text-gray-600 text-sm">
                                        Hito: <span className="font-bold">{selectedMilestone.title}</span>
                                    </p>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Justificación <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none resize-none h-32"
                                        placeholder="Describe por qué este hito está completado..."
                                        value={completionNote}
                                        onChange={(e) => setCompletionNote(e.target.value)}
                                        disabled={financialLoading}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Esta justificación será visible para el cliente</p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setShowCompleteModal(false);
                                            setSelectedMilestone(null);
                                            setCompletionNote('');
                                        }}
                                        className="flex-1 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl"
                                        disabled={financialLoading}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleCompleteMilestone}
                                        className="flex-1 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={financialLoading || !completionNote.trim()}
                                    >
                                        {financialLoading ? (
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

            {/* Request Payment Modal */}
            {
                showPaymentRequestModal && selectedMilestone && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95">
                            <div className="p-6">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="material-symbols-outlined text-3xl text-blue-600">payments</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Solicitar Pago</h3>
                                    <p className="text-gray-600 text-sm mb-4">
                                        Hito: <span className="font-bold">{selectedMilestone.title}</span>
                                    </p>
                                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                                        <p className="text-xs text-blue-600 font-bold uppercase mb-1">Monto a Solicitar</p>
                                        <p className="text-3xl font-black text-gray-900">${selectedMilestone.amount.toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        Nota Opcional
                                    </label>
                                    <textarea
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24"
                                        placeholder="Añade información adicional para el cliente (opcional)..."
                                        value={paymentNote}
                                        onChange={(e) => setPaymentNote(e.target.value)}
                                        disabled={financialLoading}
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setShowPaymentRequestModal(false);
                                            setSelectedMilestone(null);
                                            setPaymentNote('');
                                        }}
                                        className="flex-1 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl"
                                        disabled={financialLoading}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleRequestPayment}
                                        className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={financialLoading}
                                    >
                                        {financialLoading ? (
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
        </div >
    );
});

export default VendorRoadmapEditor;
