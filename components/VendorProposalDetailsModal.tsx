import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import TemplateRenderer from './TemplateRenderer';
import ContractNegotiation from './ContractNegotiation';
import ProjectSetupWizard from './ProjectSetupWizard';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

interface VendorProposalDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    lead: any;
    onStatusUpdate: () => void;
    initialTab?: 'proposal' | 'contract' | 'configuracion'; // NEW: optional initial tab
}

const VendorProposalDetailsModal: React.FC<VendorProposalDetailsModalProps> = ({ isOpen, onClose, lead, onStatusUpdate, initialTab = 'proposal' }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'proposal' | 'contract' | 'configuracion'>('proposal');
    const [rejecting, setRejecting] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showAcceptModal, setShowAcceptModal] = useState(false);
    const [initialMessage, setInitialMessage] = useState('¡Hola! He aceptado tu solicitud de proyecto. ¿Hablamos de los detalles?');
    const [currentUserId, setCurrentUserId] = useState('');
    const [currentUserName, setCurrentUserName] = useState('');
    const [isSetupWizardOpen, setIsSetupWizardOpen] = useState(false);

    useEffect(() => {
        const fetchMe = async () => {
            try {
                const res = await api.get('/auth/me');
                setCurrentUserId(res.data.id || res.data.userId);
                setCurrentUserName(res.data.name || res.data.username || "Usuario");
            } catch (e) {
                console.error("Error fetching user", e);
            }
        };
        if (isOpen) fetchMe();
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && lead) {
            setActiveTab(initialTab); // Use initialTab prop
        }
    }, [isOpen, lead, initialTab]);

    if (!lead) return null;

    const currentStatus = lead.rawStatus;

    // Tabs availability based on status or active navigation
    const showContract = ['IN_NEGOTIATION', 'ACCEPTED', 'CONTACTED'].includes(currentStatus) || activeTab === 'contract';
    const showConfiguracion = currentStatus === 'ACCEPTED' || activeTab === 'configuracion';

    const handleStatusChange = async (newStatus: string, reason?: string, message?: string) => {
        setLoading(true);
        try {
            await api.patch(`/projects/${lead.id}/status`, {
                status: newStatus,
                rejectionReason: reason,
                initialMessage: message
            });
            onStatusUpdate();
            // Automatically close modal and navigate to proposals list if progressing
            if (newStatus === 'IN_NEGOTIATION') {
                setShowAcceptModal(false);
                onClose();
                navigate('/vendor/proposals');
            }

            if (newStatus === 'DECLINED' || newStatus === 'CONTACTED') {
                if (newStatus === 'CONTACTED') {
                    setShowAcceptModal(false);
                }
                onClose();
            }
        } catch (error) {
            console.error("Error updating status", error);
            alert("Error al actualizar el estado");
        } finally {
            setLoading(false);
            setRejecting(false);
        }
    };

    const confirmRejection = () => {
        if (!rejectionReason.trim()) return alert("Por favor indica un motivo.");
        handleStatusChange('DECLINED', rejectionReason);
    };

    const renderTabs = () => (
        <div className="flex border-b border-gray-200 mb-6">
            <button
                onClick={() => setActiveTab('proposal')}
                className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'proposal' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                Propuesta
            </button>
            {showContract && (
                <button
                    onClick={() => setActiveTab('contract')}
                    className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'contract' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Contrato
                </button>
            )}
            {showConfiguracion && (
                <button
                    onClick={() => setActiveTab('configuracion')}
                    className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'configuracion' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    <span className="material-symbols-outlined text-sm">settings</span>
                    Configuración
                </button>
            )}
        </div>
    );

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title={`Gestión: ${lead.project}`}
                size="6xl"
            >
                <div>
                    {/* Header Info */}
                    <div className="flex justify-between items-start bg-gray-50 p-4 rounded-xl mb-6 flex-none">
                        <div>
                            <h3 className="font-bold text-lg text-gray-900">{lead.client}</h3>
                            <p className="text-gray-500 text-sm">Empresa Cliente</p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-lg text-primary">{lead.budget}</p>
                            <p className="text-gray-500 text-xs">Presupuesto Estimado</p>
                        </div>
                    </div>

                    {renderTabs()}

                    {/* Content Area */}
                    <div className="mb-6">
                        {activeTab === 'proposal' && (
                            <div className="space-y-6">
                                {lead.templateData ? (
                                    <TemplateRenderer
                                        templateName={lead.templateData.templateName || "Propuesta"}
                                        templateDesc={lead.templateData.templateDesc || ""}
                                        fields={lead.templateData.structure || []}
                                        answers={lead.templateData.answers || {}}
                                    />
                                ) : (
                                    <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                        <p>Propuesta básica sin datos de plantilla estructurada.</p>
                                        <p className="mt-2 text-gray-600">{lead.description}</p>
                                    </div>
                                )}

                                {/* AI Match Info */}
                                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="material-symbols-outlined text-indigo-600">smart_toy</span>
                                        <h4 className="font-bold text-indigo-900">Análisis de Compatibilidad ({lead.score}%)</h4>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {lead.matchReasons?.map((tag: string) => (
                                            <span key={tag} className="bg-white text-indigo-700 px-2 py-1 rounded text-xs font-medium border border-indigo-100">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'contract' && (
                            <ContractNegotiation
                                projectId={lead.id}
                                currentUserId={currentUserId}
                                currentUserRole="VENDOR"
                                currentUserName={currentUserName}
                                otherPartyName={lead.client}
                                onStatusChange={(s) => { if (s === 'ACCEPTED') onStatusUpdate(); }}
                            />
                        )}

                        {activeTab === 'configuracion' && (
                            <ProjectSetupWizard
                                isOpen={false}
                                onClose={() => { }}
                                projectId={lead.id}
                                onSuccess={() => {
                                    onStatusUpdate(); // Refresh project list
                                    onClose(); // Close modal
                                    navigate(`/vendor/projects/${lead.id}`); // Navigate to THIS project
                                }}
                                initialData={{ budget: lead.budgetVal }}
                                inline={true}
                            />
                        )}
                    </div>

                    {/* Actions Footer - Proposal Tab Only */}
                    {activeTab === 'proposal' && (
                        <div className="pt-6 border-t border-gray-100 flex flex-wrap gap-3 justify-end items-center">
                            {rejecting ? (
                                <div className="flex flex-1 gap-2 items-center animate-in slide-in-from-right">
                                    <input
                                        value={rejectionReason}
                                        onChange={e => setRejectionReason(e.target.value)}
                                        placeholder="Motivo del rechazo..."
                                        className="flex-1 border border-red-200 bg-red-50 text-red-900 placeholder:text-red-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-red-500"
                                        autoFocus
                                    />
                                    <Button variant="ghost" onClick={() => setRejecting(false)}>Cancelar</Button>
                                    <Button onClick={confirmRejection} className="bg-red-600 hover:bg-red-700 text-white">Confirmar Rechazo</Button>
                                </div>
                            ) : (
                                <>
                                    {currentStatus !== 'DECLINED' && currentStatus !== 'ACCEPTED' && (
                                        <Button variant="ghost" className="text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => setRejecting(true)}>
                                            Rechazar Propuesta
                                        </Button>
                                    )}

                                    {currentStatus === 'PROPOSED' && (
                                        <Button onClick={() => setShowAcceptModal(true)}>
                                            Aceptar Propuesta
                                        </Button>
                                    )}

                                    {currentStatus === 'CONTACTED' && (
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-green-600 font-medium italic">Propuesta aceptada. Continúa en la pestaña de Contrato.</span>
                                        </div>
                                    )}

                                    {currentStatus === 'IN_NEGOTIATION' && (
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-green-600 font-medium italic">En negociación. Revisa los términos en la pestaña de Contrato.</span>
                                        </div>
                                    )}

                                    {currentStatus === 'ACCEPTED' && (
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-blue-600 font-medium italic">Proyecto aceptado (Contrato firmado). Configura el proyecto en la pestaña "Configuración".</span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
                {/* Project Setup Wizard */}
                <ProjectSetupWizard
                    isOpen={isSetupWizardOpen}
                    onClose={() => setIsSetupWizardOpen(false)}
                    projectId={lead.id}
                    onSuccess={() => {
                        handleStatusChange('IN_PROGRESS');
                        onClose();
                        navigate('/vendor/projects');
                    }}
                    initialData={{ budget: lead.budgetVal }}
                />
            </Modal>

            {/* Accept Message Modal */}
            <Modal
                isOpen={showAcceptModal}
                onClose={() => setShowAcceptModal(false)}
                title="Aceptar Propuesta"
                size="md"
            >
                <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-center gap-3">
                        <span className="material-symbols-outlined text-green-600">check_circle</span>
                        <div>
                            <p className="font-bold text-green-900 text-sm">Estás por aceptar este proyecto</p>
                            <p className="text-green-700 text-xs">Se creará un chat con el cliente automáticamente.</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-2 uppercase italic">Primer Mensaje para el Cliente</label>
                        <textarea
                            value={initialMessage}
                            onChange={e => setInitialMessage(e.target.value)}
                            rows={4}
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all"
                            placeholder="Escribe un mensaje de bienvenida..."
                        />
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button variant="ghost" className="flex-1" onClick={() => setShowAcceptModal(false)} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button
                            className="flex-[2]"
                            onClick={() => handleStatusChange('IN_NEGOTIATION', undefined, initialMessage)}
                            disabled={loading}
                        >
                            {loading ? 'Enviando...' : 'Enviar y Aceptar'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default VendorProposalDetailsModal;
