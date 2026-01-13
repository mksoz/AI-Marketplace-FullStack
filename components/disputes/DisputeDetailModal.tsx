import React, { useState, useEffect } from 'react';
import api from '../../services/api';

interface DisputeDetailModalProps {
    disputeId: string;
    onClose: () => void;
    onDisputeCancelled?: () => void; // Callback to refresh incident list
}

interface DisputeData {
    id: string;
    milestoneId: string; // Added milestoneId
    milestoneTitle: string;
    milestoneAmount: number;
    vendorComment: string;
    status: string;
    createdAt: string;
    reviewHistory: Array<{
        reviewNumber: number;
        status: string;
        comment: string;
        vendorMessage: string | null;
        reviewerEmail: string;
        createdAt: string;
    }>;
    deliverableFolders: Array<{
        id: string;
        name: string;
        totalFiles: number;
        totalSize: string;
    }>;
    proposalData: any;
    contractData: any;
}

const DisputeDetailModal: React.FC<DisputeDetailModalProps> = ({ disputeId, onClose, onDisputeCancelled }) => {
    const [dispute, setDispute] = useState<DisputeData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'evidence'>('overview');
    const [cancelLoading, setCancelLoading] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        // Get user role from localStorage
        const user = localStorage.getItem('user');
        if (user) {
            try {
                const parsedUser = JSON.parse(user);
                setUserRole(parsedUser.role);
            } catch (e) {
                console.error('Error parsing user:', e);
            }
        }
    }, []);

    useEffect(() => {
        const fetchDisputeDetails = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/disputes/${disputeId}`);
                setDispute(response.data);
                setError(null);
            } catch (err: any) {
                console.error('Error fetching dispute details:', err);
                setError(err.response?.data?.message || 'Error al cargar los detalles de la disputa');
            } finally {
                setLoading(false);
            }
        };

        fetchDisputeDetails();
    }, [disputeId]);

    const handleCancelDispute = async () => {
        try {
            setCancelLoading(true);
            // Use the milestoneId from the dispute data
            await api.post(`/milestones/${dispute?.milestoneId}/disputes/${disputeId}/cancel`);

            setShowCancelConfirm(false);
            if (onDisputeCancelled) {
                onDisputeCancelled();
            }
            onClose();
        } catch (err: any) {
            console.error('Error cancelling dispute:', err);
            alert(err.response?.data?.message || 'Error al cancelar la disputa');
        } finally {
            setCancelLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="bg-white rounded-2xl p-8 w-full max-w-4xl shadow-2xl">
                    <div className="flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                        <span className="text-gray-600">Cargando detalles de la disputa...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !dispute) {
        return (
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <div className="bg-white rounded-2xl p-8 w-full max-w-4xl shadow-2xl text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-red-600 text-3xl">error</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Error al Cargar Disputa</h3>
                    <p className="text-sm text-gray-600 mb-6">{error || 'No se pudo cargar la información de la disputa'}</p>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        );
    }

    const rejectedReviews = dispute.reviewHistory.filter(r => r.status === 'REJECTED');

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl animate-in zoom-in-95 overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-purple-600 text-2xl">gavel</span>
                                <h3 className="text-2xl font-bold text-gray-900">Detalles de la Disputa</h3>
                            </div>
                            <p className="text-sm text-gray-600">
                                Hito: <span className="font-bold">{dispute.milestoneTitle}</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Cantidad en disputa: <span className="font-bold text-purple-600">${dispute.milestoneAmount.toFixed(2)}</span>
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <span className="material-symbols-outlined text-2xl">close</span>
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mt-4 border-b border-gray-200">
                        {[
                            { id: 'overview', label: 'Resumen', icon: 'summarize' },
                            { id: 'reviews', label: 'Historial de Revisiones', icon: 'history' },
                            { id: 'evidence', label: 'Evidencia', icon: 'folder' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-4 py-2 font-bold text-sm transition-colors border-b-2 ${activeTab === tab.id
                                    ? 'text-purple-600 border-purple-600'
                                    : 'text-gray-500 border-transparent hover:text-gray-700'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Status Badge */}
                            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center gap-3">
                                <span className="material-symbols-outlined text-purple-600 text-3xl">pending</span>
                                <div>
                                    <h4 className="font-bold text-purple-900">Estado: En Revisión de Administración</h4>
                                    <p className="text-sm text-purple-700">
                                        Este caso está siendo revisado por el equipo administrativo
                                    </p>
                                </div>
                            </div>

                            {/* Vendor Justification */}
                            <div>
                                <h4 className="flex items-center gap-2 text-sm font-bold text-gray-700 uppercase mb-3">
                                    <span className="material-symbols-outlined text-lg">description</span>
                                    Justificación del Vendor
                                </h4>
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                    <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                                        {dispute.vendorComment}
                                    </p>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                                    <div className="text-3xl font-bold text-red-600">{rejectedReviews.length}</div>
                                    <div className="text-xs text-red-700 font-bold mt-1">Rechazos</div>
                                </div>
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                                    <div className="text-3xl font-bold text-blue-600">{dispute.deliverableFolders.length}</div>
                                    <div className="text-xs text-blue-700 font-bold mt-1">Carpetas de Entregables</div>
                                </div>
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                                    <div className="text-3xl font-bold text-green-600">
                                        {dispute.deliverableFolders.reduce((sum, f) => sum + f.totalFiles, 0)}
                                    </div>
                                    <div className="text-xs text-green-700 font-bold mt-1">Archivos Totales</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="material-symbols-outlined text-gray-600">timeline</span>
                                <h4 className="font-bold text-gray-900">Historial Completo de Revisiones</h4>
                            </div>

                            {dispute.reviewHistory.map((review, index) => (
                                <div
                                    key={index}
                                    className={`border rounded-xl p-4 ${review.status === 'REJECTED'
                                        ? 'bg-red-50 border-red-200'
                                        : review.status === 'DISPUTED'
                                            ? 'bg-purple-50 border-purple-200'
                                            : 'bg-green-50 border-green-200'
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${review.status === 'REJECTED'
                                                ? 'bg-red-100 text-red-700'
                                                : review.status === 'DISPUTED'
                                                    ? 'bg-purple-100 text-purple-700'
                                                    : 'bg-green-100 text-green-700'
                                                }`}>
                                                Revisión #{review.reviewNumber}
                                            </span>
                                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${review.status === 'REJECTED'
                                                ? 'bg-red-200 text-red-800'
                                                : review.status === 'DISPUTED'
                                                    ? 'bg-purple-200 text-purple-800'
                                                    : 'bg-green-200 text-green-800'
                                                }`}>
                                                {review.status}
                                            </span>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            {new Date(review.createdAt).toLocaleString('es-ES')}
                                        </span>
                                    </div>

                                    {/* Vendor Message (if available for this submission) */}
                                    {review.vendorMessage && (
                                        <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="material-symbols-outlined text-blue-600 text-sm">person</span>
                                                <span className="text-xs font-bold text-blue-700">Mensaje del Vendor:</span>
                                            </div>
                                            <p className="text-sm text-blue-900 italic">"{review.vendorMessage}"</p>
                                        </div>
                                    )}

                                    {/* Client Comment */}
                                    {review.comment && (
                                        <div className="bg-white/50 rounded-lg p-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="material-symbols-outlined text-gray-600 text-sm">comment</span>
                                                <span className="text-xs font-bold text-gray-700">Comentario del Cliente:</span>
                                            </div>
                                            <p className="text-sm text-gray-800">"{review.comment}"</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'evidence' && (
                        <div className="space-y-6">
                            <div>
                                <h4 className="flex items-center gap-2 font-bold text-gray-900 mb-3">
                                    <span className="material-symbols-outlined">folder_open</span>
                                    Carpetas de Entregables
                                </h4>
                                <div className="space-y-3">
                                    {dispute.deliverableFolders.map(folder => (
                                        <div key={folder.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="material-symbols-outlined text-blue-600 text-2xl">folder</span>
                                                    <div>
                                                        <h5 className="font-bold text-gray-900">{folder.name}</h5>
                                                        <p className="text-xs text-gray-500">
                                                            {folder.totalFiles} archivo(s) • {(parseInt(folder.totalSize) / 1024 / 1024).toFixed(2)} MB
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {dispute.deliverableFolders.length === 0 && (
                                        <div className="text-center py-8 text-gray-400">
                                            <span className="material-symbols-outlined text-4xl">folder_off</span>
                                            <p className="text-sm mt-2">No hay carpetas de entregables</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Contract & Proposal Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="material-symbols-outlined text-blue-600">description</span>
                                        <h5 className="font-bold text-blue-900">Propuesta</h5>
                                    </div>
                                    <p className="text-xs text-blue-700">
                                        {dispute.proposalData?.id ? 'Propuesta adjunta' : 'No disponible'}
                                    </p>
                                </div>
                                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="material-symbols-outlined text-green-600">contract</span>
                                        <h5 className="font-bold text-green-900">Contrato</h5>
                                    </div>
                                    <p className="text-xs text-green-700">
                                        {dispute.contractData?.status || 'No disponible'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>


                {/* Footer */}
                <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                        Disputa creada el {new Date(dispute.createdAt).toLocaleString('es-ES')}
                    </div>
                    <div className="flex gap-3">
                        {/* Only Vendor can cancel dispute if OPEN or IN_PROGRESS. Clients have NO actions. */}
                        {userRole === 'VENDOR' && (dispute.status === 'OPEN' || dispute.status === 'IN_PROGRESS') && (
                            <button
                                onClick={() => setShowCancelConfirm(true)}
                                className="px-6 py-2 border border-red-300 text-red-600 font-bold rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg">cancel</span>
                                Cancelar Disputa
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>

            {/* Cancel Confirmation Modal */}
            {showCancelConfirm && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-6 w-96 shadow-2xl text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-red-600 text-3xl">cancel</span>
                        </div>
                        <h3 className="font-bold text-lg mb-2 text-gray-900">¿Cancelar Disputa?</h3>
                        <p className="text-sm text-gray-600 mb-6">
                            Al cancelar la disputa, el hito regresará al estado "Cambios Solicitados" y podrás continuar trabajando en él.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCancelConfirm(false)}
                                disabled={cancelLoading}
                                className="flex-1 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg disabled:opacity-50"
                            >
                                No, Mantener
                            </button>
                            <button
                                onClick={handleCancelDispute}
                                disabled={cancelLoading}
                                className="flex-1 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 shadow-lg shadow-red-200 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {cancelLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Cancelando...
                                    </>
                                ) : (
                                    'Sí, Cancelar'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DisputeDetailModal;
