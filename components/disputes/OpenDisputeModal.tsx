import React, { useState } from 'react';
import api from '../../services/api';

interface OpenDisputeModalProps {
    show: boolean;
    onClose: () => void;
    milestone: {
        id: string;
        title: string;
        amount: number;
        reviews?: Array<{
            status: string;
            comment?: string;
            createdAt: string;
            vendorMessage?: string;
        }>;
    };
    onSuccess?: () => void;
}

const OpenDisputeModal: React.FC<OpenDisputeModalProps> = ({ show, onClose, milestone, onSuccess }) => {
    const [vendorComment, setVendorComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const rejectionCount = milestone.reviews?.filter(r => r.status === 'REJECTED').length || 0;
    const charCount = vendorComment.trim().length;
    const minChars = 10;
    const maxChars = 500;
    const isValid = charCount >= minChars && charCount <= maxChars;

    const handleSubmit = async () => {
        if (!isValid) {
            if (charCount < minChars) {
                setError(`El comentario debe tener al menos ${minChars} caracteres`);
            } else {
                setError(`El comentario no puede exceder ${maxChars} caracteres`);
            }
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await api.post(`/milestones/${milestone.id}/open-dispute`, {
                vendorComment: vendorComment.trim()
            });

            if (response.data.success) {
                // Success
                if (onSuccess) onSuccess();
                onClose();
            }
        } catch (err: any) {
            console.error('[OpenDisputeModal] Error:', err);
            setError(err.response?.data?.message || 'Error al abrir la disputa');
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-red-50 p-2 rounded-lg">
                            <span className="material-symbols-outlined text-red-600 text-2xl">gavel</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Abrir Disputa</h2>
                            <p className="text-sm text-gray-500 mt-1">Hito: {milestone.title}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        disabled={loading}
                    >
                        <span className="material-symbols-outlined text-gray-500">close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Info Alert */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-amber-600 mt-0.5">info</span>
                            <div className="flex-1">
                                <h3 className="font-semibold text-amber-900 mb-1">Información importante</h3>
                                <p className="text-sm text-amber-800">
                                    Este hito ha sido rechazado <strong>{rejectionCount} {rejectionCount === 1 ? 'vez' : 'veces'}</strong>.
                                    Al abrir una disputa, el equipo de administración revisará toda la evidencia automáticamente
                                    recopilada del proyecto, incluyendo:
                                </p>
                                <ul className="text-sm text-amber-800 mt-2 ml-4 space-y-1 list-disc">
                                    <li>Propuesta original del proyecto</li>
                                    <li>Contrato firmado entre las partes</li>
                                    <li>Historial completo de revisiones y justificaciones</li>
                                    <li>Carpetas de entregables y archivos subidos</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Rejection History Summary */}
                    {milestone.reviews && milestone.reviews.length > 0 && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <span className="material-symbols-outlined text-gray-600">history</span>
                                Historial de Rechazos ({rejectionCount})
                            </h3>
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {milestone.reviews
                                    .filter(r => r.status === 'REJECTED')
                                    .map((review, idx) => (
                                        <div key={idx} className="bg-white p-3 rounded border border-gray-200">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-medium text-gray-500">
                                                    Rechazo #{idx + 1}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(review.createdAt).toLocaleDateString('es-ES')}
                                                </span>
                                            </div>

                                            {/* Client's Rejection Comment */}
                                            <div className="mb-2">
                                                <p className="text-[10px] font-semibold text-gray-500 mb-1">Cliente (rechazo):</p>
                                                <p className="text-sm text-gray-700 bg-red-50 p-2 rounded">
                                                    {review.comment || 'Sin comentarios'}
                                                </p>
                                            </div>

                                            {/* Vendor's Submission Message */}
                                            {review.vendorMessage && (
                                                <div>
                                                    <p className="text-[10px] font-semibold text-gray-500 mb-1">Vendor (envío):</p>
                                                    <p className="text-sm text-gray-700 bg-blue-50 p-2 rounded">
                                                        {review.vendorMessage}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}

                    {/* Vendor Comment */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tu Observación Adicional <span className="text-red-500">*</span>
                        </label>
                        <p className="text-sm text-gray-500 mb-3">
                            Añade cualquier comentario o contexto adicional que consideres relevante para esta disputa.
                            Este comentario será visible para el equipo de administración.
                        </p>
                        <textarea
                            value={vendorComment}
                            onChange={(e) => setVendorComment(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[120px]"
                            placeholder="Escribe aquí cualquier observación adicional..."
                            disabled={loading}
                        />
                        <div className="flex items-center justify-between mt-2">
                            <span className={`text-sm ${charCount >= minChars && charCount <= maxChars ? 'text-green-600' : charCount < minChars ? 'text-amber-600' : 'text-red-600'}`}>
                                {charCount} / {maxChars} caracteres ({minChars} mínimo)
                            </span>
                            {charCount > maxChars && (
                                <span className="text-xs text-red-600">
                                    Excede por {charCount - maxChars} caracteres
                                </span>
                            )}
                            {charCount > 0 && charCount < minChars && (
                                <span className="text-xs text-amber-600">
                                    Faltan {minChars - charCount} caracteres
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Future: File Upload Section */}
                    {/* TODO: Implement file upload for vendor evidence */}

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                            <span className="material-symbols-outlined text-red-600 mt-0.5">error</span>
                            <p className="text-sm text-red-700 flex-1">{error}</p>
                        </div>
                    )}

                    {/* Summary */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-900 mb-2">Resumen de la Disputa</h3>
                        <div className="space-y-1 text-sm text-blue-800">
                            <p><strong>Hito:</strong> {milestone.title}</p>
                            <p><strong>Cantidad en disputa:</strong> ${milestone.amount.toFixed(2)}</p>
                            <p><strong>Número de rechazos:</strong> {rejectionCount}</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${isValid && !loading
                            ? 'bg-red-600 text-white hover:bg-red-700 shadow-sm'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        disabled={!isValid || loading}
                    >
                        {loading && (
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        )}
                        <span className="material-symbols-outlined">gavel</span>
                        Confirmar Apertura de Disputa
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OpenDisputeModal;
