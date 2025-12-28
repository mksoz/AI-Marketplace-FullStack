import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import TemplateRenderer from './TemplateRenderer';
import ContractNegotiation from './ContractNegotiation';
import api from '../services/api';

interface ClientProposalDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    proposal: any;
    currentUserEmail: string;
}

const ClientProposalDetailsModal: React.FC<ClientProposalDetailsModalProps> = ({ isOpen, onClose, proposal, currentUserEmail }) => {
    const [activeTab, setActiveTab] = useState<'details' | 'contract'>('details');
    const [currentUserId, setCurrentUserId] = useState('');
    const [currentUserName, setCurrentUserName] = useState('');

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
        if (isOpen && proposal) {
            setActiveTab('details');
        }
    }, [isOpen, proposal]);

    if (!proposal) return null;

    const currentStatus = proposal.status;

    // Tabs logic
    const showContract = ['IN_NEGOTIATION', 'ACCEPTED', 'CONTACTED'].includes(currentStatus);

    // Auto-switch tabs if needed (e.g. if opened in negotiation, maybe distinct visual cue? but let's default to details)

    const renderTabs = () => (
        <div className="flex border-b border-gray-200 mb-6">
            <button
                onClick={() => setActiveTab('details')}
                className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'details' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                Detalles
            </button>
            {showContract && (
                <button
                    onClick={() => setActiveTab('contract')}
                    className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'contract' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                    Contrato
                </button>
            )}
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Proyecto: ${proposal.title}`}
            size="6xl"
        >
            <div>
                {/* Header Info */}
                <div className="flex justify-between items-start bg-gray-50 p-4 rounded-xl mb-6 flex-none">
                    <div>
                        <h3 className="font-bold text-lg text-gray-900">{proposal.vendor?.companyName || "Proveedor Asignado"}</h3>
                        <p className="text-gray-500 text-sm">Vendor</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-lg text-primary">{proposal.budget}</p>
                        <p className="text-gray-500 text-xs">Presupuesto</p>
                    </div>
                </div>

                {renderTabs()}

                <div className="mb-6">
                    {activeTab === 'details' && (
                        <div className="space-y-6">
                            {proposal.templateData ? (
                                <TemplateRenderer
                                    templateName={proposal.templateData.templateName || "Solicitud de Proyecto"}
                                    templateDesc={proposal.templateData.templateDesc || ""}
                                    fields={proposal.templateData.structure || []}
                                    answers={proposal.templateData.answers || {}}
                                />
                            ) : (
                                <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <p>Descripción del Proyecto</p>
                                    <p className="mt-2 text-gray-600 italic">{proposal.description}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'contract' && (
                        <ContractNegotiation
                            projectId={proposal.id}
                            currentUserId={currentUserId}
                            currentUserRole="CLIENT"
                            currentUserName={currentUserName}
                            otherPartyName={proposal.vendor?.companyName || "Proveedor"}
                        />
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default ClientProposalDetailsModal;
