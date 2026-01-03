import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import Button from './Button';
import SlideToSign from './SlideToSign';


interface ContractVersion {
    id: string;
    versionNumber: number;
    content: string;
    changeMessage: string;
    createdBy: string;
    status: 'DRAFT' | 'PROPOSED' | 'ACCEPTED' | 'REJECTED';
    createdAt: string;
    clientSignedAt?: string;
    vendorSignedAt?: string;

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
            if (Array.isArray(res.data)) {
                // Sanitize data to prevent crashes
                const safeHistory = res.data.map((v: any) => ({
                    ...v,
                    content: v.content || '',
                    createdAt: v.createdAt || new Date().toISOString(),
                    clientSignedAt: v.clientSignedAt || undefined,
                    vendorSignedAt: v.vendorSignedAt || undefined

                }));

                setHistory(safeHistory);
                if (safeHistory.length > 0) {
                    setLatestVersion(safeHistory[0]);
                    if (!editMode) {
                        setNewContent(safeHistory[0].content);
                    }
                }
            } else {
                setHistory([]);
            }
        } catch (err) {
            console.error("Error fetching history", err);
            setHistory([]);
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

    const handleSignContract = async () => {
        setLoading(true);
        try {
            const res = await api.post(`/contracts/${projectId}/sign`);
            await fetchHistory();

            if (res.data.status === 'SIGNED' && onStatusChange) {
                onStatusChange('SIGNED');
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


    // Safe Date Formatter
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "Fecha inválida";
            return date.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
        } catch (e) {
            return "Fecha desconocida";
        }
    };

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
                                            v.status === 'ACCEPTED' ? 'Aprobado' :
                                                v.status === 'REJECTED' ? 'Rechazada' : 'Borrador'}
                                    </span>
                                </div>
                                <p className="text-[11px] text-gray-400 mb-2 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-xs">schedule</span>
                                    {formatDate(v.createdAt)}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Main Content */}
            {/* Main Content - RESTORED SAFELY */}
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
                    // VIEWER MODE (Step 1: Restoration)
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
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 items-center">
                                {/* Download Actions */}
                                <button onClick={downloadPDF} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors" title="Descargar PDF">
                                    <span className="material-symbols-outlined text-xl">download</span>
                                </button>

                                <div className="h-6 w-px bg-gray-200 mx-2"></div>

                                {/* Main Actions */}
                                {isLatest ? (
                                    <>
                                        {latestVersion?.status === 'ACCEPTED' ? (
                                            // Accepted State - No Edit, Just Download/View
                                            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                                <span className="text-xs font-bold uppercase tracking-wide">Aprobado</span>
                                            </div>
                                        ) : (
                                            // Edit Button (Restored to Top)
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
                                        onClick={() => latestVersion && handleRestore(latestVersion)}
                                        className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-bold text-xs flex items-center gap-2 shadow-sm"
                                    >
                                        <span className="material-symbols-outlined text-sm">restore</span>
                                        Restaurar esta versión
                                    </button>
                                )}

                            </div>
                        </div>

                        {/* Document Viewer Container (No Scroll) */}
                        <div className="flex-1 flex flex-col bg-slate-50 relative overflow-hidden">
                            {/* Scrollable Paper Wrapper */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12 flex justify-center">
                                <article className="prose prose-sm md:prose-base max-w-[800px] w-full bg-white p-8 md:p-12 shadow-sm border border-gray-200 h-min min-h-full rounded-none md:rounded-lg">
                                    {latestVersion?.status === 'REJECTED' && (
                                        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                                            <div className="flex items-center gap-2 text-red-800 font-bold mb-1">
                                                <span className="material-symbols-outlined text-lg">block</span>
                                                Versión Rechazada
                                            </div>
                                            <p className="text-red-700 text-sm">Esta versión fue rechazada y no es válida.</p>
                                        </div>
                                    )}
                                    <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed font-normal">{latestVersion?.content}</pre>

                                </article>
                            </div>

                            {/* Fixed Signature Footer */}
                            {isLatest && ['DRAFT', 'PROPOSED', 'ACCEPTED'].includes(latestVersion?.status || '') && (
                                <div className="flex-shrink-0 bg-slate-50 border-t border-gray-200 p-4 pb-6 flex flex-col items-center z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                                    <div className="w-full max-w-[420px] flex flex-col items-center gap-3">
                                        <p className="text-sm text-gray-500 font-medium h-4 text-center">
                                            {iHaveSigned
                                                ? "Contrato firmado exitosamente."
                                                : "Presiona y mantén el botón para firmar y aceptar los términos."}
                                        </p>
                                        <SlideToSign
                                            isSigned={iHaveSigned}
                                            onConfirm={handleSignContract}
                                            // onRevert={handleUnsignContract}
                                            isLoading={loading}
                                            labelUnsigned="Presiona hasta completar"
                                            labelSigned="Firmado Exitosamente"
                                        />
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                )}
            </div>




        </div >
    );
};

export default ContractNegotiation;

