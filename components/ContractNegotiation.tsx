import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import Button from './Button';
import Modal from './Modal';

interface ContractVersion {
    id: string;
    versionNumber: number;
    content: string;
    changeMessage: string;
    createdBy: string;
    status: 'DRAFT' | 'PROPOSED' | 'ACCEPTED' | 'REJECTED';
    createdAt: string;
}

interface ContractNegotiationProps {
    projectId: string;
    currentUserId: string;
    currentUserRole: string; // 'CLIENT' | 'VENDOR'
    currentUserName?: string;
    otherPartyName?: string;
    onStatusChange?: (status: string) => void;
}

interface ChatMessage {
    id: string;
    sender: 'user' | 'ai';
    text: string;
}

const ContractNegotiation: React.FC<ContractNegotiationProps> = ({ projectId, currentUserId, currentUserRole, currentUserName, otherPartyName, onStatusChange }) => {
    const [history, setHistory] = useState<ContractVersion[]>([]);
    const [latestVersion, setLatestVersion] = useState<ContractVersion | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [newContent, setNewContent] = useState('');
    const [changeMessage, setChangeMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // AI Chat State
    const [showAIChat, setShowAIChat] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        { id: '1', sender: 'ai', text: 'Hola, soy tu asistente legal IA. ¿En qué puedo ayudarte a mejorar este contrato?' }
    ]);
    const [aiInput, setAiInput] = useState('');
    const [isAiTyping, setIsAiTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Modal States
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showAcceptModal, setShowAcceptModal] = useState(false);
    const [showSignModal, setShowSignModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [versionToActOn, setVersionToActOn] = useState<ContractVersion | null>(null);

    // Fetch History
    useEffect(() => {
        fetchHistory();
    }, [projectId]);

    // Scroll to bottom of chat
    useEffect(() => {
        if (showAIChat) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages, showAIChat]);

    const fetchHistory = async () => {
        try {
            const res = await api.get(`/contracts/${projectId}/history`);
            setHistory(res.data);
            if (res.data.length > 0) {
                setLatestVersion(res.data[0]);
                if (!editMode) {
                    setNewContent(res.data[0].content);
                }
            }
        } catch (err) {
            console.error("Error fetching history", err);
        }
    };

    const handlePropose = async () => {
        if (!newContent.trim()) return;
        setLoading(true);
        try {
            await api.post(`/contracts/${projectId}/propose`, {
                content: newContent,
                changeMessage: changeMessage || "Actualización del contrato"
            });
            await fetchHistory();
            setEditMode(false);
            setChangeMessage('');
            setChatMessages([{ id: '1', sender: 'ai', text: 'Hola, soy tu asistente legal IA. ¿En qué puedo ayudarte a mejorar este contrato?' }]); // Reset chat
            setShowAIChat(false);
        } catch (err) {
            console.error("Error proposing version", err);
        } finally {
            setLoading(false);
        }
    };

    const confirmAccept = async () => {
        if (!versionToActOn) return;
        setLoading(true);
        try {
            await api.post(`/contracts/version/${versionToActOn.id}/accept`);
            await fetchHistory();
            // Do NOT call onStatusChange('ACCEPTED') yet, wait for signature
            setShowAcceptModal(false);
        } catch (err) {
            console.error("Error accepting version", err);
        } finally {
            setLoading(false);
            setVersionToActOn(null);
        }
    };

    const confirmReject = async () => {
        if (!versionToActOn || !rejectionReason.trim()) return;
        setLoading(true);
        try {
            await api.post(`/contracts/version/${versionToActOn.id}/reject`, { reason: rejectionReason });
            await fetchHistory();
            setShowRejectModal(false);
            setRejectionReason('');
        } catch (err) {
            console.error("Error rejecting version", err);
        } finally {
            setLoading(false);
            setVersionToActOn(null);
        }
    };

    const handleSignContract = async () => {
        setLoading(true);
        try {
            const res = await api.post(`/contracts/${projectId}/sign`);
            await fetchHistory();
            setShowSignModal(false);
            if (res.data.status === 'SIGNED' && onStatusChange) {
                onStatusChange('SIGNED'); // Or 'SIGNED' depending on prop expectation
            }
        } catch (err) {
            console.error("Error signing contract", err);
        } finally {
            setLoading(false);
        }
    };


    const handleRestore = (version: ContractVersion) => {
        setNewContent(version.content);
        setChangeMessage(`Restaurado desde Versión ${version.versionNumber}`);
        setEditMode(true);
        setChatMessages([{ id: '1', sender: 'ai', text: 'Hola, soy tu asistente legal IA. ¿En qué puedo ayudarte a mejorar este contrato?' }]);
    };

    const handleSendMessage = async () => {
        if (!aiInput.trim()) return;

        const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text: aiInput };
        setChatMessages(prev => [...prev, userMsg]);
        setAiInput('');
        setIsAiTyping(true);

        // Mock AI Logic
        setTimeout(() => {
            let aiResponseText = "Entendido. He aplicado los cambios sugeridos al borrador.";

            // Simple mock interactions
            if (userMsg.text.toLowerCase().includes("formal")) {
                setNewContent(prev => prev.replace(/Hola/g, "Estimados").replace(/chau/g, "Atentamente") + "\n\n[IA: Se ha formalizado el tono del documento.]");
                aiResponseText = "He ajustado el tono para que sea más formal.";
            } else if (userMsg.text.toLowerCase().includes("cláusula")) {
                setNewContent(prev => prev + "\n\n## Cláusula Adicional\nLas partes acuerdan mantener la confidencialidad de la información compartida durante la vigencia de este contrato.");
                aiResponseText = "He añadido una cláusula de confidencialidad estándar al final del documento.";
            } else if (userMsg.text.toLowerCase().includes("resum")) {
                aiResponseText = "Este contrato establece los términos de colaboración, incluyendo presupuesto, plazos y entregables definidos anteriormente.";
            } else {
                setNewContent(prev => prev + `\n\n[IA: Cambios aplicados según: "${userMsg.text}"]`);
            }

            const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), sender: 'ai', text: aiResponseText };
            setChatMessages(prev => [...prev, aiMsg]);
            setIsAiTyping(false);
        }, 1500);
    };

    const insertText = (text: string) => {
        setNewContent(prev => prev + '\n' + text);
    };

    const downloadPDF = () => {
        console.log("Descargando PDF... (Funcionalidad simulada)");
    };

    const getProposedByText = (version: ContractVersion | null) => {
        if (!version) return '';
        if (version.createdBy === currentUserId) {
            return `Ti (${currentUserName || 'Yo'})`;
        }
        return otherPartyName ? `${otherPartyName}` : 'La otra parte';
    };

    // Helper to check signature status
    const getSignatureStatus = (version: ContractVersion) => {
        const isClient = currentUserRole === 'CLIENT';
        const isVendor = currentUserRole === 'VENDOR';

        const mySignedAt = isClient ? version.clientSignedAt : version.vendorSignedAt;
        const otherSignedAt = isClient ? version.vendorSignedAt : version.clientSignedAt;

        const iHaveSigned = !!mySignedAt;
        const otherHasSigned = !!otherSignedAt;

        return { iHaveSigned, otherHasSigned };
    };

    // Empty State (No Contract)
    if (history.length === 0 && !editMode) {
        if (currentUserRole === 'VENDOR') {
            return (
                <div className="flex flex-col items-center justify-center min-h-[500px] border border-gray-200 rounded-xl bg-gray-50 border-dashed animate-in fade-in zoom-in-95 duration-300">
                    <div className="p-6 rounded-full bg-blue-50 mb-6 shadow-sm">
                        <span className="material-symbols-outlined text-5xl text-blue-600">contract_edit</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No hay contrato activo</h3>
                    <p className="text-gray-500 text-sm max-w-md text-center mb-8 leading-relaxed">
                        Este proyecto aún no tiene un borrador de contrato. Como proveedor, debes generar la primera versión para comenzar la negociación.
                    </p>
                    <button
                        onClick={() => {
                            setNewContent(`# Contrato de Servicios\n\nEste contrato establece los términos para el proyecto...`);
                            setEditMode(true);
                        }}
                        className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center gap-3 transform hover:scale-105"
                    >
                        <span className="material-symbols-outlined">add_circle</span>
                        Generar Borrador Inicial
                    </button>
                </div>
            );
        }
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] p-8 text-center bg-gray-50 rounded-xl border border-gray-100">
                <div className="spinner mb-4 border-4 border-gray-200 border-t-primary h-10 w-10 rounded-full animate-spin"></div>
                <p className="text-gray-500 font-medium">Esperando a que el proveedor inicie el contrato...</p>
            </div>
        );
    }

    const isLatest = latestVersion?.id === history[0]?.id;
    const { iHaveSigned, otherHasSigned } = latestVersion ? getSignatureStatus(latestVersion) : { iHaveSigned: false, otherHasSigned: false };

    // Global lock: If any version is fully signed, the negotiation is closed.
    const isNegotiationClosed = history.some(v => {
        return v.status === 'ACCEPTED' && !!v.clientSignedAt && !!v.vendorSignedAt;
    });

    const isCurrentVersionFullySigned = iHaveSigned && otherHasSigned;

    return (
        <div className="flex flex-col md:flex-row h-[700px] bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden font-sans">
            {/* Sidebar: History */}
            <div className="w-full md:w-72 border-r border-gray-100 flex flex-col bg-gray-50/50 flex-shrink-0">
                <div className="p-5 border-b border-gray-100 bg-white sticky top-0 z-10">
                    <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Historial</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{history.length} versiones</p>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
                    {history.map((v) => {
                        const isSelected = latestVersion?.id === v.id && !editMode;
                        return (
                            <div
                                key={v.id}
                                onClick={() => { setLatestVersion(v); setEditMode(false); }}
                                className={`p-4 rounded-xl cursor-pointer transition-all border ${isSelected
                                        ? 'bg-white border-primary shadow-md ring-1 ring-primary/10'
                                        : 'bg-white border-gray-100 hover:border-gray-300 hover:shadow-sm'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${v.createdBy === currentUserId ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'
                                            }`}>
                                            {v.createdBy === currentUserId ? 'Yo' : 'Ex'}
                                        </div>
                                        <span className={`font-bold text-sm ${isSelected ? 'text-primary' : 'text-gray-700'}`}>Versión {v.versionNumber}</span>
                                    </div>
                                    <span className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-wider ${v.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                                            v.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                v.status === 'PROPOSED' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-gray-100 text-gray-500'
                                        }`}>
                                        {v.status === 'PROPOSED' ? 'Pendiente' :
                                            v.status === 'ACCEPTED' ? (v.clientSignedAt && v.vendorSignedAt ? 'Firmado' : 'Aceptado') :
                                                v.status === 'REJECTED' ? 'Rechazada' : 'Borrador'}
                                    </span>
                                </div>
                                <p className="text-[11px] text-gray-400 mb-2 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-xs">schedule</span>
                                    {new Date(v.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 bg-white relative">
                {editMode ? (
                    // EDITOR MODE
                    <div className="flex-1 flex flex-row h-full overflow-hidden animate-in slide-in-from-bottom-4 duration-300">

                        {/* Editor Area */}
                        <div className="flex-1 flex flex-col min-w-0 relative">
                            {/* Editor Toolbar */}
                            <div className="h-[60px] px-4 border-b border-gray-200 bg-white flex justify-between items-center z-20 flex-shrink-0">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-amber-500">edit_note</span>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-sm">Editor de Contrato</h3>
                                        <p className="text-xs text-amber-600">Editando nueva versión</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => insertText(`**${new Date().toLocaleDateString()}**`)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500" title="Insertar Fecha">
                                        <span className="material-symbols-outlined text-lg">calendar_today</span>
                                    </button>
                                    <button onClick={() => insertText(`\n> Firma: ____________________\n`)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500" title="Insertar Firma">
                                        <span className="material-symbols-outlined text-lg">ink_pen</span>
                                    </button>
                                </div>
                            </div>

                            {/* Textarea */}
                            <div className="flex-1 relative h-[calc(100%-120px)]">
                                <textarea
                                    className="w-full h-full p-6 md:p-8 outline-none resize-none font-mono text-sm leading-relaxed text-gray-800 focus:bg-gray-50/30 transition-colors"
                                    value={newContent}
                                    onChange={(e) => setNewContent(e.target.value)}
                                    placeholder="Escribe el contenido del contrato aquí... Usa MarkDown para formato."
                                    spellCheck={false}
                                />

                                {/* Floating AI Button */}
                                {!showAIChat && (
                                    <button
                                        onClick={() => setShowAIChat(true)}
                                        className="absolute bottom-6 right-6 w-12 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-110 z-30 group"
                                        title="Asistente IA"
                                    >
                                        <span className="material-symbols-outlined">auto_fix_high</span>
                                        <span className="absolute right-14 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                            Mejorar con IA
                                        </span>
                                    </button>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="h-[60px] px-4 border-t border-gray-100 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20 flex items-center flex-shrink-0">
                                <div className="flex items-center gap-4 w-full">
                                    <div className="flex-1 space-y-1">
                                        <input
                                            type="text"
                                            value={changeMessage}
                                            onChange={(e) => setChangeMessage(e.target.value)}
                                            placeholder="Descripción de los cambios..."
                                            className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-primary transition-all"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="sm" onClick={() => setEditMode(false)}>Cancelar</Button>
                                        <Button size="sm" onClick={handlePropose} loading={loading} className="shadow-lg shadow-primary/20">Guardar</Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* AI Chat Sidebar */}
                        {showAIChat && (
                            <div className="w-80 border-l border-gray-200 bg-gray-50 flex flex-col animate-in slide-in-from-right duration-300 shadow-xl z-30">
                                <div className="h-[60px] px-4 border-b border-gray-200 bg-white flex justify-between items-center flex-shrink-0">
                                    <h3 className="font-bold text-indigo-900 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-indigo-500">smart_toy</span>
                                        Asistente
                                    </h3>
                                    <button onClick={() => setShowAIChat(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full transition-colors">
                                        <span className="material-symbols-outlined text-sm">close</span>
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                                    {chatMessages.map((msg) => (
                                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${msg.sender === 'user'
                                                    ? 'bg-indigo-600 text-white rounded-tr-none'
                                                    : 'bg-white text-gray-700 border border-gray-200 rounded-tl-none shadow-sm'
                                                }`}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    ))}
                                    {isAiTyping && (
                                        <div className="flex justify-start">
                                            <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-200 shadow-sm flex gap-1">
                                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                <div className="p-3 border-t border-gray-200 bg-white flex-shrink-0">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={aiInput}
                                            onChange={(e) => setAiInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                            placeholder="Pide cambios a la IA..."
                                            className="w-full p-3 pr-10 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        />
                                        <button
                                            onClick={handleSendMessage}
                                            disabled={!aiInput.trim()}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-indigo-600 hover:text-indigo-800 disabled:text-gray-300 p-1"
                                        >
                                            <span className="material-symbols-outlined text-lg">send</span>
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-gray-400 text-center mt-2">La IA puede cometer errores. Revisa siempre el contenido.</p>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    // VIEWER MODE
                    <div className="flex-1 flex flex-col h-full bg-slate-50 relative">
                        {/* Toolbar */}
                        <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center shadow-sm z-10 sticky top-0 h-[60px]">
                            <div className="flex items-center gap-3">
                                <span className={`flex h-2 w-2 rounded-full ${latestVersion?.status === 'ACCEPTED' ? (isCurrentVersionFullySigned ? 'bg-blue-600' : 'bg-green-500') : 'bg-amber-500'}`}></span>
                                <div>
                                    <h3 className="font-bold text-gray-900 leading-none flex items-center gap-2">
                                        Contrato V{latestVersion?.versionNumber}
                                        {latestVersion?.status === 'ACCEPTED' && (
                                            isCurrentVersionFullySigned
                                                ? <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">Firmado</span>
                                                : <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">Aprobado</span>
                                        )}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-xs text-gray-500">
                                            Propuesto por <span className="font-medium text-gray-700">{getProposedByText(latestVersion)}</span>
                                        </p>
                                        {latestVersion?.status === 'ACCEPTED' && !isCurrentVersionFullySigned && (
                                            <>
                                                <span className="text-gray-300">|</span>
                                                <p className="text-xs font-medium text-amber-600 flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[10px]">pending</span>
                                                    {iHaveSigned
                                                        ? "Firmado por Ti. Esperando a la otra parte."
                                                        : "Firma Pendiente (Tu turno)"}
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 items-center">
                                {/* Download Actions */}
                                <button onClick={downloadPDF} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors" title="Descargar PDF">
                                    <span className="material-symbols-outlined text-xl">download</span>
                                </button>

                                <div className="h-6 w-px bg-gray-200 mx-2"></div>

                                {/* Main Actions - Only visible if negotiation is NOT closed */}
                                {!isNegotiationClosed && (
                                    <>
                                        {isLatest ? (
                                            <>
                                                {latestVersion?.status === 'ACCEPTED' ? (
                                                    !iHaveSigned && (
                                                        <button
                                                            onClick={() => setShowSignModal(true)}
                                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-xs flex items-center gap-2 shadow-sm animate-pulse"
                                                        >
                                                            <span className="material-symbols-outlined text-sm">ink_pen</span>
                                                            Firmar Contrato
                                                        </button>
                                                    )
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            setNewContent(latestVersion?.content || '');
                                                            setChangeMessage("Nueva versión basada en V" + latestVersion?.versionNumber);
                                                            setEditMode(true);
                                                            setChatMessages([{ id: '1', sender: 'ai', text: 'Hola, soy tu asistente legal IA. ¿En qué puedo ayudarte a mejorar este contrato?' }]);
                                                        }}
                                                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark font-bold text-xs flex items-center gap-2 shadow-sm"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">edit</span>
                                                        Editar Contrato
                                                    </button>
                                                )}
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => handleRestore(latestVersion!)}
                                                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-bold text-xs flex items-center gap-2 shadow-sm"
                                            >
                                                <span className="material-symbols-outlined text-sm">restore</span>
                                                Restaurar esta versión
                                            </button>
                                        )}
                                    </>
                                )}

                                {/* Review Actions - Only for Pending Proposals from others and NOT closed */}
                                {!isNegotiationClosed && latestVersion?.status === 'PROPOSED' && latestVersion.createdBy !== currentUserId && (
                                    <div className="flex gap-2 ml-2">
                                        <button
                                            onClick={() => { setVersionToActOn(latestVersion); setShowRejectModal(true); }}
                                            className="px-4 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-all flex items-center gap-2"
                                        >
                                            Rechazar
                                        </button>
                                        <button
                                            onClick={() => { setVersionToActOn(latestVersion); setShowAcceptModal(true); }}
                                            className="px-4 py-2 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-md flex items-center gap-2"
                                        >
                                            Aprobar
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Document Viewer */}
                        <div className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar bg-slate-50 flex justify-center">
                            <article className="prose prose-sm md:prose-base max-w-[800px] w-full bg-white p-8 md:p-12 shadow-sm border border-gray-200 min-h-full rounded-none md:rounded-lg">
                                {latestVersion?.status === 'REJECTED' && (
                                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                                        <div className="flex items-center gap-2 text-red-800 font-bold mb-1">
                                            <span className="material-symbols-outlined text-lg">block</span>
                                            Versión Rechazada
                                        </div>
                                        <p className="text-red-700 text-sm">Esta versión fue rechazada y no es válida.</p>
                                    </div>
                                )}
                                {latestVersion?.status === 'ACCEPTED' && (
                                    <div className={`mb-6 p-4 rounded-r-lg border-l-4 ${isCurrentVersionFullySigned ? 'bg-blue-50 border-blue-500' : 'bg-green-50 border-green-500'}`}>
                                        <div className={`flex items-center gap-2 font-bold mb-1 ${isCurrentVersionFullySigned ? 'text-blue-800' : 'text-green-800'}`}>
                                            <span className="material-symbols-outlined text-lg">{isCurrentVersionFullySigned ? 'verified' : 'fact_check'}</span>
                                            {isCurrentVersionFullySigned ? 'Contrato Finalizado y Firmado' : 'Versión Aprobada - Pendiente de Firmas'}
                                        </div>
                                        <p className={`text-sm ${isCurrentVersionFullySigned ? 'text-blue-700' : 'text-green-700'}`}>
                                            {isCurrentVersionFullySigned
                                                ? "Este contrato es oficial y vinculante. El proyecto ha comenzado."
                                                : "El contenido ha sido aceptado por ambas partes. Se requieren firmas para oficializar."}
                                        </p>
                                    </div>
                                )}
                                <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed font-normal">{latestVersion?.content}</pre>
                            </article>
                        </div>
                    </div>
                )}
            </div>

            {/* MODALS */}

            {/* Accept Modal */}
            <Modal
                isOpen={showAcceptModal}
                onClose={() => setShowAcceptModal(false)}
                title="Aprobar Borrador"
                size="md"
            >
                <div>
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-start gap-4 mb-6">
                        <div className="p-2 bg-white rounded-full text-green-600 shadow-sm">
                            <span className="material-symbols-outlined text-2xl">thumb_up</span>
                        </div>
                        <div>
                            <h4 className="font-bold text-green-900">¿Aprobar contenido?</h4>
                            <p className="text-green-800 text-sm mt-1">Al aprobar, se congela la edición y se habilita la <strong>Firma del Contrato</strong>. Ambas partes deberán firmar para finalizar.</p>
                        </div>
                    </div>
                    <div className="flex gap-3 justify-end">
                        <Button variant="ghost" onClick={() => setShowAcceptModal(false)}>Cancelar</Button>
                        <Button onClick={confirmAccept} loading={loading} className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-100">
                            Confirmar y Aprobar
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Sign Modal */}
            <Modal
                isOpen={showSignModal}
                onClose={() => setShowSignModal(false)}
                title="Firmar Contrato"
                size="md"
            >
                <div>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center gap-4 mb-6">
                        <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-sm flex-shrink-0">
                            <span className="material-symbols-outlined text-2xl">ink_pen</span>
                        </div>
                        <div>
                            <h4 className="font-bold text-blue-900">Firma Digital</h4>
                            <p className="text-blue-800 text-sm mt-1">Al confirmar, firmas digitalmente este contrato como <strong>{currentUserName || 'Usuario'}</strong>. Esta acción es vinculante.</p>
                        </div>
                    </div>
                    <div className="flex gap-3 justify-end">
                        <Button variant="ghost" onClick={() => setShowSignModal(false)}>Cancelar</Button>
                        <Button onClick={handleSignContract} loading={loading} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100 w-full md:w-auto">
                            Firmar Contrato
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Reject Modal */}
            <Modal
                isOpen={showRejectModal}
                onClose={() => setShowRejectModal(false)}
                title="Rechazar Cambios"
                size="md"
            >
                <div>
                    <div className="mb-4">
                        <p className="text-gray-600 text-sm mb-4">
                            Por favor, explica brevemente por qué rechazas esta versión para ayudar a la otra parte a realizar las correcciones necesarias.
                        </p>
                        <label className="block text-xs font-bold text-gray-700 mb-2 uppercase">Motivo del rechazo</label>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none resize-none transition-all"
                            rows={4}
                            placeholder="Ej: La cláusula 3.2 no es correcta, el plazo debería ser..."
                            autoFocus
                        />
                    </div>
                    <div className="flex gap-3 justify-end">
                        <Button variant="ghost" onClick={() => setShowRejectModal(false)}>Cancelar</Button>
                        <Button
                            onClick={confirmReject}
                            loading={loading}
                            disabled={!rejectionReason.trim()}
                            className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-100"
                        >
                            <span className="material-symbols-outlined text-lg mr-1">thumb_down</span>
                            Rechazar Versión
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ContractNegotiation;
