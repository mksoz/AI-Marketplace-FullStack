import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VendorLayout from '../../components/VendorLayout';
import TemplateEditor from './TemplateEditor';
import VendorProposalDetailsModal from '../../components/VendorProposalDetailsModal';
import api from '../../services/api';

interface Lead {
    id: string;
    client: string;
    project: string;
    budget: string; // raw string for display
    budgetVal: number; // number for sorting
    score: number;
    status: 'Pendiente' | 'En Negociación' | 'Aceptada' | 'Finalizada' | 'Perdido';
    rawStatus: string; // Backend enum value
    matchReasons: string[];
    date: string;
    templateData?: any;
    description?: string;
}

const VendorProposals: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'inbox' | 'template'>('inbox');
    const [viewMode, setViewMode] = useState<'list' | 'board'>('board');
    const [sortConfig, setSortConfig] = useState<{ key: keyof Lead, direction: 'asc' | 'desc' } | null>(null);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);

    const statusMapping: Record<string, Lead['status']> = {
        'PROPOSED': 'Pendiente',
        'OPEN': 'Pendiente',
        'CONTACTED': 'En Negociación',
        'IN_NEGOTIATION': 'En Negociación',
        'ACCEPTED': 'Aceptada',
        'IN_PROGRESS': 'Finalizada',
        'COMPLETED': 'Finalizada',
        'DECLINED': 'Perdido',
    };

    const fetchLeads = async () => {
        // Only fetch if "inbox" tab is active
        if (activeTab !== 'inbox') return;

        setLoading(true);
        try {
            const response = await api.get('/projects/vendor/requests');
            const data = response.data.map((p: any) => ({
                id: p.id,
                client: p.client?.companyName || 'Cliente Confidencial',
                project: p.title,
                budget: p.budget ? `$${p.budget.toLocaleString()}` : 'Por definir',
                budgetVal: p.budget || 0,
                score: Math.floor(Math.random() * (99 - 70 + 1) + 70), // Mock score
                status: statusMapping[p.status] || 'Nuevo',
                rawStatus: p.status,
                matchReasons: ['Match IA'], // Placeholder
                date: new Date(p.createdAt).toLocaleDateString(),
                templateData: p.templateData || { answers: {}, structure: [] },
                description: p.description,
                needsSignature: p.contract && !p.contract.vendorSigned && p.status === 'IN_NEGOTIATION',
                contract: p.contract // Include contract object to check signatures
            }));
            setLeads(data);
        } catch (error) {
            console.error("Error fetching leads", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, [activeTab]);

    const handleCardClick = (lead: Lead) => {
        setSelectedLead(lead);
        setIsDetailsOpen(true);
    };

    const handleStatusUpdate = () => {
        fetchLeads(); // Refresh list after status change
    };

    // Kanban Columns
    const columns = [
        { id: 'Pendiente', label: 'Pendientes', color: 'bg-blue-50 border-blue-200' },
        { id: 'En Negociación', label: 'En Negociación', color: 'bg-purple-50 border-purple-200' },
        { id: 'Aceptada', label: 'Proyectos Aceptados (Pend. Configuración)', color: 'bg-teal-50 border-teal-200' },
        { id: 'Finalizada', label: 'Cerradas / Ganadas', color: 'bg-green-50 border-green-200' }
    ];

    // Sorting for List View
    const sortedLeads = [...leads].sort((a, b) => {
        if (!sortConfig) return 0;
        // @ts-ignore
        const aValue = a[sortConfig.key];
        // @ts-ignore
        const bValue = b[sortConfig.key];

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const requestSort = (key: keyof Lead) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: keyof Lead) => {
        if (sortConfig?.key !== key) return <span className="material-symbols-outlined text-[10px] text-gray-300">unfold_more</span>;
        return <span className="material-symbols-outlined text-[10px] text-primary">{sortConfig.direction === 'asc' ? 'expand_less' : 'expand_more'}</span>;
    };

    const pendingSetups = leads.filter(l => l.rawStatus === 'ACCEPTED').length;

    return (
        <VendorLayout>
            <div className="space-y-8 h-full flex flex-col">

                <div className="flex flex-col md:flex-row justify-between items-end gap-4 shrink-0">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Gestión de Propuestas</h1>
                        <p className="text-gray-500 mt-1">Organiza tu pipeline de ventas y oportunidades.</p>
                    </div>

                    <div className="flex gap-4 items-center">
                        {/* View Toggle */}
                        <div className="bg-gray-100 p-1 rounded-lg flex">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-md transition-all flex items-center ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-700'}`}
                                title="Vista de Lista"
                            >
                                <span className="material-symbols-outlined">list</span>
                            </button>
                            <button
                                onClick={() => setViewMode('board')}
                                className={`p-2 rounded-md transition-all flex items-center ${viewMode === 'board' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-700'}`}
                                title="Vista Kanban"
                            >
                                <span className="material-symbols-outlined">view_kanban</span>
                            </button>
                        </div>

                        {/* Main Tabs */}
                        <div className="bg-gray-100 p-1 rounded-lg flex">
                            <button
                                onClick={() => setActiveTab('inbox')}
                                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'inbox' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Pipeline
                            </button>
                            <button
                                onClick={() => setActiveTab('template')}
                                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'template' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Plantillas
                            </button>
                        </div>
                    </div>
                </div>

                {activeTab === 'inbox' && (
                    <div className="flex-1 flex flex-col animate-in fade-in duration-300 min-h-0">

                        {/* AI Widget */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl p-4 text-white shadow-lg relative overflow-hidden mb-6 shrink-0">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <span className="material-symbols-outlined text-8xl">smart_toy</span>
                            </div>
                            <div className="relative z-10 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <span className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm"><span className="material-symbols-outlined text-lg">auto_awesome</span></span>
                                    <div>
                                        <h3 className="font-bold text-sm">Insight del Agente</h3>
                                        <p className="text-indigo-100 text-xs">
                                            {pendingSetups > 0
                                                ? `Tienes ${pendingSetups} proyecto${pendingSetups > 1 ? 's' : ''} pendiente${pendingSetups > 1 ? 's' : ''} de configurar.`
                                                : leads.length > 0
                                                    ? `Tienes ${leads.length} propuestas activas en tu pipeline.`
                                                    : 'No hay propuestas aún. ¡Optimiza tus plantillas!'}
                                        </p>
                                    </div>
                                </div>
                                <button className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                                    Ver Análisis
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-12">
                                <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
                            </div>
                        ) : (
                            <>
                                {/* KANBAN VIEW */}
                                {viewMode === 'board' && (
                                    <div className="flex-1 overflow-x-auto pb-4">
                                        <div className="flex gap-4 h-full min-w-[1000px]">
                                            {columns.map(col => {
                                                const colLeads = leads.filter(l => l.status === col.id);
                                                const totalValue = colLeads.reduce((acc, curr) => acc + curr.budgetVal, 0);

                                                return (
                                                    <div key={col.id} className="flex-1 flex flex-col bg-gray-50 rounded-xl border border-gray-200 min-w-[280px]">
                                                        {/* Column Header */}
                                                        <div className={`p-3 border-b border-gray-200 rounded-t-xl flex justify-between items-center ${col.color.replace('border', 'bg').replace('50', '100/50')}`}>
                                                            <div>
                                                                <h3 className="font-bold text-gray-700 text-sm">{col.label}</h3>
                                                                <p className="text-xs text-gray-500 font-medium">${(totalValue / 1000).toFixed(0)}k en pipeline</p>
                                                            </div>
                                                            <span className="bg-white text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm border border-gray-100">
                                                                {colLeads.length}
                                                            </span>
                                                        </div>

                                                        {/* Cards Container */}
                                                        <div className="p-3 space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                                                            {colLeads.map(lead => (
                                                                <div
                                                                    key={lead.id}
                                                                    onClick={() => handleCardClick(lead)}
                                                                    className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-primary group relative"
                                                                >
                                                                    <div className="flex justify-between items-start mb-2">
                                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${lead.score > 90 ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-600 border-gray-100'}`}>
                                                                            Match: {lead.score}%
                                                                        </span>
                                                                        <button className="text-gray-300 hover:text-gray-500"><span className="material-symbols-outlined text-base">more_horiz</span></button>
                                                                    </div>
                                                                    <h4 className="font-bold text-gray-900 text-sm mb-0.5 line-clamp-2">{lead.project}</h4>
                                                                    <p className="text-xs text-gray-500 mb-3">{lead.client}</p>

                                                                    <div className="flex flex-wrap gap-1 mb-3">
                                                                        {lead.matchReasons.map(tag => (
                                                                            <span key={tag} className="text-[9px] bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded border border-gray-100">{tag}</span>
                                                                        ))}
                                                                    </div>

                                                                    <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                                                                        <span className="font-bold text-gray-900 text-sm">{lead.budget}</span>
                                                                        <div>
                                                                            {lead.needsSignature && (
                                                                                <span className="text-[9px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100 flex items-center gap-1 animate-pulse mb-1">
                                                                                    <span className="material-symbols-outlined text-[10px]">edit_document</span> FIRMA PENDIENTE
                                                                                </span>
                                                                            )}
                                                                            {lead.rawStatus === 'ACCEPTED' && (
                                                                                <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 flex items-center gap-1 animate-pulse mb-1">
                                                                                    <span className="material-symbols-outlined text-[10px]">settings</span> CONFIGURACIÓN PENDIENTE
                                                                                </span>
                                                                            )}
                                                                            <span className="text-[10px] text-gray-400 block text-right">{lead.date}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            {colLeads.length === 0 && (
                                                                <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                                                                    <p className="text-xs text-gray-400">Sin leads</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* LIST VIEW */}
                                {viewMode === 'list' && (
                                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                        <div className="p-4 border-b border-gray-100 flex gap-4 text-sm text-gray-500 bg-gray-50 font-bold items-center">
                                            <div onClick={() => requestSort('score')} className="w-16 text-center cursor-pointer flex items-center justify-center gap-1 hover:text-dark">
                                                Score {getSortIcon('score')}
                                            </div>
                                            <div onClick={() => requestSort('project')} className="flex-1 cursor-pointer flex items-center gap-1 hover:text-dark">
                                                Oportunidad {getSortIcon('project')}
                                            </div>
                                            <div onClick={() => requestSort('budgetVal')} className="w-32 cursor-pointer flex items-center gap-1 hover:text-dark">
                                                Presupuesto {getSortIcon('budgetVal')}
                                            </div>
                                            <div onClick={() => requestSort('status')} className="w-32 cursor-pointer flex items-center gap-1 hover:text-dark">
                                                Estado {getSortIcon('status')}
                                            </div>
                                            <span className="w-24 text-right">Acción</span>
                                        </div>
                                        <div className="divide-y divide-gray-100">
                                            {sortedLeads.map(lead => (
                                                <div
                                                    key={lead.id}
                                                    onClick={() => handleCardClick(lead)}
                                                    className="p-4 flex gap-4 items-center hover:bg-gray-50 transition-colors group cursor-pointer"
                                                >
                                                    <div className="w-16 flex flex-col items-center justify-center">
                                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs border-2 ${lead.score > 90 ? 'border-green-500 text-green-700 bg-green-50' : lead.score > 50 ? 'border-yellow-500 text-yellow-700 bg-yellow-50' : 'border-gray-300 text-gray-500 bg-gray-100'}`}>
                                                            {lead.score}
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-gray-900 text-sm">{lead.project}</h3>
                                                        <p className="text-xs text-gray-500">{lead.client} • <span className="text-gray-400">{lead.date}</span></p>
                                                    </div>
                                                    <div className="w-32 font-medium text-gray-700 text-sm">{lead.budget}</div>
                                                    <div className="w-32">
                                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${lead.status === 'Pendiente' ? 'bg-blue-100 text-blue-700' : lead.status === 'Cerrada' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                            {lead.status}
                                                        </span>
                                                    </div>
                                                    <div className="w-24 text-right flex flex-col items-end gap-1">
                                                        {lead.needsSignature && (
                                                            <span className="text-[8px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100 animate-pulse">
                                                                FIRMA PENDIENTE
                                                            </span>
                                                        )}
                                                        {lead.rawStatus === 'ACCEPTED' && (
                                                            <span className="text-[8px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 animate-pulse">
                                                                CONFIGURACIÓN PENDIENTE
                                                            </span>
                                                        )}
                                                        <button className="p-2 border border-gray-200 rounded-lg hover:bg-primary hover:text-white hover:border-primary text-gray-400 transition-colors">
                                                            <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'template' && (
                    <div className="flex-1 flex flex-col animate-in fade-in duration-300">
                        <TemplateEditor />
                    </div>
                )}

                {selectedLead && (
                    <VendorProposalDetailsModal
                        isOpen={isDetailsOpen}
                        onClose={() => setIsDetailsOpen(false)}
                        lead={selectedLead}
                        onStatusUpdate={handleStatusUpdate}
                    />
                )}

            </div>
        </VendorLayout>
    );
};

export default VendorProposals;