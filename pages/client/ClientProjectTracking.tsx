import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ClientLayout from '../../components/ClientLayout';

const ClientProjectTracking: React.FC = () => {
  const navigate = useNavigate();

  // Project Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Default to Specific Project for Demo of Roadmap
  const [selectedProject, setSelectedProject] = useState<{name: string, vendor: string, id: string} | null>({
      name: 'Motor de Recomendación con IA',
      vendor: 'QuantumLeap AI',
      id: '1'
  });
  
  const searchRef = useRef<HTMLDivElement>(null);

  // Mock Data Extended
  const projects = [
      { 
        id: '1', 
        name: 'Motor de Recomendación con IA', 
        vendor: 'QuantumLeap AI', 
        status: 'En Desarrollo', 
        progress: 65,
        endDate: '31 Oct, 2024',
        finance: { total: 80000, paid: 60000, pending: 20000 },
        pendingAction: 'Validar Wireframes Finales',
        nextMilestone: 'Entrenamiento del Modelo',
        // Enhanced Timeline for Roadmap
        timeline: [
            { id: 1, title: 'Kickoff', date: '15 Jul', status: 'completed', desc: 'Definición de alcance y firma de contrato.' },
            { id: 2, title: 'Análisis de Datos', date: '01 Ago', status: 'completed', desc: 'Limpieza de dataset y selección de features.' },
            { id: 3, title: 'Diseño UX/UI', date: '20 Ago', status: 'completed', desc: 'Wireframes y prototipos aprobados.' },
            { id: 4, title: 'Entrenamiento', date: '30 Sep', status: 'current', desc: 'Entrenamiento del modelo con GPU clusters. Optimizando precisión.', daysLeft: 5 },
            { id: 5, title: 'Integración API', date: '15 Oct', status: 'pending', desc: 'Conexión del modelo con el backend existente.' },
            { id: 6, title: 'QA & Entrega', date: '31 Oct', status: 'pending', desc: 'Pruebas finales y despliegue a producción.' }
        ],
        activity: [
            { text: 'Nuevo entregable subido: "Reporte de Precisión v2"', time: 'Hace 2 horas', type: 'file' },
            { text: 'Pago del Hito 2 liberado', time: 'Hace 2 días', type: 'payment' },
            { text: 'Reunión de seguimiento programada', time: 'Hace 3 días', type: 'meeting' }
        ]
      },
      // ... other projects (kept structure but simplified for brevity in this specific update)
      { id: '2', name: 'Chatbot Soporte', vendor: 'InnovateAI', status: 'Inicio', progress: 15, timeline: [], activity: [], finance: {total:0, paid:0, pending:0} }
  ];

  const filteredProjects = projects.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.vendor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeProject = selectedProject ? projects.find(p => p.id === selectedProject.id) : null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper for Roadmap visual state
  const [activeNodeId, setActiveNodeId] = useState<number | null>(4); // Default to current

  return (
    <ClientLayout>
       <div className="space-y-8 pb-20">
          
          {/* Header & Context Selector */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
             <h1 className="text-3xl font-black text-gray-900">
                {selectedProject ? selectedProject.name : 'Vista General de Proyectos'}
             </h1>
             
             {/* Project Selector */}
             <div className="relative w-full md:w-96 z-30" ref={searchRef}>
                <button 
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                    className="w-full flex items-center justify-between bg-white border border-gray-200 hover:border-primary/50 text-gray-900 text-left rounded-xl px-4 py-3 shadow-sm transition-all group"
                >
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-gray-500">
                            {selectedProject ? 'folder' : 'dashboard'}
                        </span>
                        <div>
                            <span className="block font-bold text-sm leading-tight">
                                {selectedProject ? selectedProject.name : 'Vista General'}
                            </span>
                            <span className="text-xs text-gray-500 font-medium">
                                {selectedProject ? selectedProject.vendor : 'Resumen Global'}
                            </span>
                        </div>
                    </div>
                    <span className="material-symbols-outlined text-gray-400 group-hover:text-gray-600">expand_more</span>
                </button>

                {isSearchOpen && (
                    <div className="absolute top-full right-0 w-full bg-white rounded-xl shadow-floating border border-gray-100 mt-2 p-2 animate-in fade-in zoom-in-95 duration-200">
                        {/* Search and List Logic (Same as before) */}
                        <div className="max-h-60 overflow-y-auto space-y-1">
                            {filteredProjects.map(p => (
                                <button 
                                    key={p.id}
                                    onClick={() => {
                                        setSelectedProject({name: p.name, vendor: p.vendor, id: p.id});
                                        setIsSearchOpen(false);
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-lg flex justify-between items-center group transition-colors ${selectedProject?.id === p.id ? 'bg-primary/5' : 'hover:bg-gray-50'}`}
                                >
                                    <div>
                                        <p className={`font-bold text-sm ${selectedProject?.id === p.id ? 'text-primary' : 'text-gray-900'}`}>{p.name}</p>
                                        <p className="text-xs text-gray-500">{p.vendor}</p>
                                    </div>
                                    {selectedProject?.id === p.id && <span className="material-symbols-outlined text-primary text-sm">check</span>}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
             </div>
          </div>

          {activeProject && (
             <div className="space-y-8 animate-in fade-in duration-500">
                
                {/* 1. NEW INTERACTIVE VISUAL ROADMAP */}
                <section className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm overflow-hidden relative">
                    <div className="flex justify-between items-end mb-10">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Hoja de Ruta Interactiva</h2>
                            <p className="text-gray-500 text-sm mt-1">Sigue el progreso en tiempo real de cada fase.</p>
                        </div>
                        <div className="text-right">
                            <span className="text-xs font-bold text-gray-400 uppercase">Estado General</span>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="font-bold text-green-600">A tiempo</span>
                            </div>
                        </div>
                    </div>

                    {/* Horizontal Timeline Container */}
                    <div className="relative pt-12 pb-10 overflow-x-auto no-scrollbar">
                        {/* Connecting Line - Adjusted top to account for padding-top */}
                        <div className="absolute top-[4.3rem] left-0 w-full h-1 bg-gray-100 -z-0"></div>
                        
                        <div className="flex justify-between min-w-[800px] px-4 relative z-10">
                            {activeProject.timeline.map((milestone, index) => {
                                const isCompleted = milestone.status === 'completed';
                                const isCurrent = milestone.status === 'current';
                                const isActive = activeNodeId === milestone.id;

                                return (
                                    <div key={milestone.id} className="flex flex-col items-center group cursor-pointer" onClick={() => setActiveNodeId(milestone.id)}>
                                        {/* Node Circle */}
                                        <div className={`
                                            w-14 h-14 rounded-full flex items-center justify-center border-4 transition-all duration-300 relative
                                            ${isCompleted ? 'bg-green-500 border-green-100 text-white' : 
                                              isCurrent ? 'bg-primary border-primary/20 text-white shadow-lg shadow-primary/30 scale-110' : 
                                              'bg-white border-gray-200 text-gray-300'}
                                            ${isActive ? 'ring-2 ring-offset-2 ring-dark' : ''}
                                        `}>
                                            <span className="material-symbols-outlined text-2xl">
                                                {isCompleted ? 'check' : isCurrent ? 'sync' : 'radio_button_unchecked'}
                                            </span>
                                            
                                            {/* Days Left Bubble for Current */}
                                            {isCurrent && milestone.daysLeft && (
                                                <div className="absolute -top-3 -right-3 bg-dark text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md animate-bounce">
                                                    {milestone.daysLeft}d
                                                </div>
                                            )}
                                        </div>

                                        {/* Text Info */}
                                        <div className="mt-4 text-center">
                                            <p className={`text-xs font-bold uppercase mb-1 ${isCurrent ? 'text-primary' : 'text-gray-400'}`}>
                                                {milestone.date}
                                            </p>
                                            <p className={`text-sm font-bold transition-colors ${isActive ? 'text-dark' : 'text-gray-500'}`}>
                                                {milestone.title}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Detailed Info Panel (Shows based on selection) */}
                    {activeNodeId && (
                        <div className="mt-4 bg-gray-50 rounded-xl p-6 border border-gray-100 animate-in slide-in-from-top-2 duration-300 flex items-start gap-4">
                            <div className="p-3 bg-white rounded-lg shadow-sm text-primary">
                                <span className="material-symbols-outlined text-2xl">info</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-gray-900 text-lg">
                                    {activeProject.timeline.find(m => m.id === activeNodeId)?.title}
                                </h3>
                                <p className="text-gray-600 mt-1">
                                    {activeProject.timeline.find(m => m.id === activeNodeId)?.desc}
                                </p>
                                {activeProject.timeline.find(m => m.id === activeNodeId)?.status === 'current' && (
                                    <div className="mt-3 flex gap-3">
                                        <button className="text-xs bg-dark text-white px-3 py-1.5 rounded-lg font-bold hover:bg-black transition-colors">
                                            Ver Tareas
                                        </button>
                                        <button className="text-xs bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-bold hover:bg-gray-100 transition-colors">
                                            Contactar Vendor
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </section>

                {/* 2. STATS & ACTIVITY (Sidebar layout below roadmap) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Financial Summary */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                           <span className="material-symbols-outlined text-gray-400">payments</span> Finanzas del Proyecto
                        </h3>
                        <div className="space-y-4">
                           <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                               <span className="text-sm text-gray-500">Presupuesto</span>
                               <span className="font-bold text-gray-900">${activeProject.finance.total.toLocaleString()}</span>
                           </div>
                           <div className="relative pt-2">
                               <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                                   <span>Pagado ({Math.round((activeProject.finance.paid/activeProject.finance.total)*100)}%)</span>
                                   <span>Escrow</span>
                               </div>
                               <div className="flex w-full h-3 rounded-full overflow-hidden">
                                   <div className="bg-green-500" style={{width: `${(activeProject.finance.paid/activeProject.finance.total)*100}%`}}></div>
                                   <div className="bg-blue-300" style={{width: `${(activeProject.finance.pending/activeProject.finance.total)*100}%`}}></div>
                               </div>
                           </div>
                           <button onClick={() => navigate('/client/funds')} className="w-full py-2 text-sm text-primary font-bold hover:bg-primary/5 rounded-lg transition-colors">
                               Administrar Fondos
                           </button>
                        </div>
                    </div>

                    {/* Recent Activity Feed */}
                    <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                       <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                           <span className="material-symbols-outlined text-gray-400">history</span> Actividad Reciente
                       </h3>
                       <div className="space-y-4">
                           {activeProject.activity.map((act, i) => (
                               <div key={i} className="flex gap-4 items-start p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                                   <div className={`p-2 rounded-full flex-shrink-0 ${act.type === 'file' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                                       <span className="material-symbols-outlined text-lg">
                                           {act.type === 'file' ? 'description' : act.type === 'payment' ? 'paid' : 'notifications'}
                                       </span>
                                   </div>
                                   <div>
                                       <p className="text-sm font-bold text-gray-800">{act.text}</p>
                                       <p className="text-xs text-gray-400 mt-0.5">{act.time}</p>
                                   </div>
                               </div>
                           ))}
                       </div>
                    </div>
                </div>
             </div>
          )}
       </div>
    </ClientLayout>
  );
};

export default ClientProjectTracking;