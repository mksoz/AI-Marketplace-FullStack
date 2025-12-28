
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import api from '../services/api';
import Button from './Button';
import ConfirmationModal from './ConfirmationModal';

interface Contract {
    id: string;
    content: string;
    status: 'DRAFT' | 'PENDING_SIGNATURE' | 'SIGNED' | 'CANCELLED';
    clientSigned: boolean;
    vendorSigned: boolean;
    clientSignedAt?: string;
    vendorSignedAt?: string;
}

interface ContractViewerProps {
    projectId: string;
    currentUserRole: 'CLIENT' | 'VENDOR';
}

const ContractViewer: React.FC<ContractViewerProps> = ({ projectId, currentUserRole }) => {
    const [contract, setContract] = useState<Contract | null>(null);
    const [loading, setLoading] = useState(true);
    const [signing, setSigning] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const fetchContract = async () => {
        try {
            const response = await api.get(`/contracts/${projectId}`);
            setContract(response.data);
        } catch (error) {
            console.error("Error fetching contract", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContract();
    }, [projectId]);

    const handleSignClick = () => {
        setShowConfirm(true);
    };

    const handleConfirmSign = async () => {
        setSigning(true);
        try {
            const res = await api.post(`/contracts/${projectId}/sign`);
            setContract(res.data);

            const isFullySigned = res.data.clientSigned && res.data.vendorSigned;
            setSuccessMessage(isFullySigned
                ? "¡Contrato firmado por ambas partes! El proyecto ha comenzado oficialmente."
                : "Has firmado el contrato correctamente. Se ha notificado a la contraparte."
            );
            setShowSuccessModal(true);
        } catch (error) {
            console.error(error);
            alert("Error al firmar");
        } finally {
            setSigning(false);
            setShowConfirm(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-400">Cargando contrato...</div>;

    if (!contract) return (
        <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <span className="material-symbols-outlined text-4xl mb-2 text-gray-300">description</span>
            <p>Aún no se ha generado un borrador de contrato.</p>
            <p className="text-xs text-gray-400 mt-1">El contrato se generará automáticamente cuando la propuesta pase a estado "En Negociación".</p>
        </div>
    );

    const alreadySigned = currentUserRole === 'CLIENT' ? contract.clientSigned : contract.vendorSigned;
    const bothSigned = contract.status === 'SIGNED';

    return (
        <>
            <div className="flex flex-col h-[600px] border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden relative">
                {/* Success Modal Overlay */}
                {showSuccessModal && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white p-6 rounded-2xl shadow-xl border border-green-100 max-w-xs text-center transform animate-in zoom-in-95 duration-300 mx-4">
                            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 text-green-600">
                                <span className="material-symbols-outlined text-3xl">check_circle</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">¡Firma Exitosa!</h3>
                            <p className="text-sm text-gray-600 mb-4">{successMessage}</p>
                            <Button onClick={() => setShowSuccessModal(false)} className="w-full justify-center">Entendido</Button>
                        </div>
                    </div>
                )}

                {/* Toolbar */}
                <div className="bg-gray-50 p-3 border-b border-gray-200 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className={`material-symbols-outlined ${bothSigned ? 'text-green-600' : 'text-orange-500'}`}>
                            {bothSigned ? 'verified_user' : 'pending_actions'}
                        </span>
                        <div>
                            <h3 className="font-bold text-gray-900 text-sm">Contrato de Servicios</h3>
                            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">
                                Estado: {bothSigned ? 'Firmado y Vigente' : 'Pendiente de Firmas'}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <div className={`px-2 py-1 rounded text-[10px] font-bold border ${contract.vendorSigned ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                            Proveedor {contract.vendorSigned ? 'Firmado' : 'Pendiente'}
                        </div>
                        <div className={`px-2 py-1 rounded text-[10px] font-bold border ${contract.clientSigned ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                            Cliente {contract.clientSigned ? 'Firmado' : 'Pendiente'}
                        </div>
                    </div>
                </div>

                {/* Document Viewer */}
                <div className="flex-1 overflow-y-auto p-8 bg-white text-gray-800 text-sm leading-relaxed font-serif">
                    <div className="max-w-2xl mx-auto space-y-4">
                        <ReactMarkdown>{contract.content}</ReactMarkdown>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end items-center gap-4">
                    {bothSigned ? (
                        <div className="flex items-center gap-2 text-green-700 font-bold text-sm bg-green-100 px-3 py-1.5 rounded-lg">
                            <span className="material-symbols-outlined text-base">check_circle</span>
                            Documento Finalizado
                        </div>
                    ) : (
                        <Button
                            onClick={handleSignClick}
                            disabled={alreadySigned || signing}
                            className={alreadySigned ? 'opacity-50 cursor-not-allowed' : ''}
                            variant={alreadySigned ? 'outline' : 'primary'}
                        >
                            {signing ? 'Firmando...' : alreadySigned ? 'Ya has firmado' : 'Firmar Contrato Digitalmente'}
                        </Button>
                    )}
                </div>
            </div>

            <ConfirmationModal
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleConfirmSign}
                title="Firmar Contrato"
                message="¿Estás seguro de que deseas firmar este contrato? Esta acción es legalmente vinculante y no se puede deshacer."
                confirmText="Sí, Firmar"
                variant="info"
            />
        </>
    );
};

export default ContractViewer;
