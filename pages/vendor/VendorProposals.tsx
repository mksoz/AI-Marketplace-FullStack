import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VendorLayout from '../../components/VendorLayout';

interface Lead {
    id: string;
    client: string;
    project: string;
    budget: string; // raw string for display
    budgetVal: number; // number for sorting
    score: number;
    status: 'Nuevo' | 'Contactado' | 'Negociación' | 'Ganado' | 'Perdido';
    matchReasons: string[];
    date: string;
}

const VendorProposals: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'inbox' | 'template'>('inbox');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('board');
  const [sortConfig, setSortConfig] = useState<{key: keyof Lead, direction: 'asc' | 'desc'} | null>(null);

  // Mock Leads with AI Score
  const [leads, setLeads] = useState<Lead[]>([
      { id: '1', client: 'Fintech Global', project: 'Chatbot IA Banca', budget: '$45k', budgetVal: 45000, score: 98, status: 'Nuevo', matchReasons: ['Exp. Fintech', 'Python'], date: 'Hace 2h' },
      { id: '2', client: 'Retail Corp', project: 'Análisis Predictivo', budget: '$25k', budgetVal: 25000, score: 85, status: 'Contactado', matchReasons: ['Retail', 'Data Science'], date: 'Ayer' },
      { id: '3', client: 'Startup X', project: 'MVP Generativo', budget: '$12k', budgetVal: 12000, score: 45, status: 'Perdido', matchReasons: ['Budget bajo'], date: 'Hace 3 días' },
      { id: '4', client: 'Logistics Pro', project: 'Optimización Rutas', budget: '$60k', budgetVal: 60000, score: 92, status: 'Negociación', matchReasons: ['Algoritmos', 'Logística'], date: 'Hace 1 semana' },
      { id: '5', client: 'EduTech Inc', project: 'Tutor IA', budget: '$30k', budgetVal: 30000, score: 78, status: 'Nuevo', matchReasons: ['NLP'], date: 'Hace 4h' },
  ]);

  // Kanban Columns
  const columns = [
      { id: 'Nuevo', label: 'Nuevos Leads', color: 'bg-blue-50 border-blue-200' },
      { id: 'Contactado', label: 'Contactados', color: 'bg-yellow-50 border-yellow-200' },
      { id: 'Negociación', label: 'En Negociación', color: 'bg-purple-50 border-purple-200' },
      { id: 'Ganado', label: 'Cerrados', color: 'bg-green-50 border-green-200' }
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
                                    <strong>Fintech Global</strong> tiene un Score de 98/100. Recomiendo moverlo a "Contactado" hoy mismo.
                                </p>
                              </div>
                          </div>
                          <button className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                              Ver Análisis
                          </button>
                      </div>
                  </div>

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
                                                  <div key={lead.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group relative">
                                                      <div className="flex justify-between items-start mb-2">
                                                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${lead.score > 90 ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-600 border-gray-100'}`}>
                                                              Match: {lead.score}%
                                                          </span>
                                                          <button className="text-gray-300 hover:text-gray-500"><span className="material-symbols-outlined text-base">more_horiz</span></button>
                                                      </div>
                                                      <h4 className="font-bold text-gray-900 text-sm mb-0.5">{lead.project}</h4>
                                                      <p className="text-xs text-gray-500 mb-3">{lead.client}</p>
                                                      
                                                      <div className="flex flex-wrap gap-1 mb-3">
                                                          {lead.matchReasons.map(tag => (
                                                              <span key={tag} className="text-[9px] bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded border border-gray-100">{tag}</span>
                                                          ))}
                                                      </div>

                                                      <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                                                          <span className="font-bold text-gray-900 text-sm">{lead.budget}</span>
                                                          <span className="text-[10px] text-gray-400">{lead.date}</span>
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
                                  <div key={lead.id} className="p-4 flex gap-4 items-center hover:bg-gray-50 transition-colors group">
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
                                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${lead.status === 'Nuevo' ? 'bg-blue-100 text-blue-700' : lead.status === 'Ganado' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                              {lead.status}
                                          </span>
                                      </div>
                                      <div className="w-24 text-right">
                                          <button className="p-2 border border-gray-200 rounded-lg hover:bg-primary hover:text-white hover:border-primary text-gray-400 transition-colors">
                                              <span className="material-symbols-outlined text-lg">arrow_forward</span>
                                          </button>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}
              </div>
          )}

          {activeTab === 'template' && (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center space-y-6 animate-in fade-in duration-300">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-primary">
                      <span className="material-symbols-outlined text-4xl">edit_document</span>
                  </div>
                  <div>
                      <h2 className="text-2xl font-bold text-gray-900">Configurador de Plantilla de Requisitos</h2>
                      <p className="text-gray-500 max-w-lg mx-auto mt-2">
                          Diseña el formulario que los clientes deben completar para solicitar tus servicios. Define preguntas clave para filtrar leads de baja calidad.
                      </p>
                  </div>
                  <button 
                    onClick={() => navigate('/vendor/proposals/template')}
                    className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/20 transition-transform hover:-translate-y-1"
                  >
                      Abrir Editor Visual
                  </button>
              </div>
          )}

      </div>
    </VendorLayout>
  );
};

export default VendorProposals;