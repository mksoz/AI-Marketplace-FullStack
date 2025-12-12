import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ClientLayout from '../../components/ClientLayout';

const ClientProjects: React.FC = () => {
  const navigate = useNavigate();
  
  // Advanced Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContext, setSelectedContext] = useState({
      id: 'all',
      name: 'Todos los Proyectos',
      vendor: 'Vista General'
  });
  const searchRef = useRef<HTMLDivElement>(null);

  // Mock Data Enrichied for Holistic View
  const projects = [
      { 
        id: '1', 
        name: 'Motor de Recomendación con IA', 
        vendor: 'QuantumLeap AI', 
        status: 'En Progreso', 
        progress: 65, 
        image: 'https://picsum.photos/id/48/100/100',
        tracking: { phase: 'Entrenamiento Modelo', nextEvent: 'Demo Semanal', date: 'Mañana, 10:00' },
        deliverables: { current: 'Hito 2', pendingReview: false, nextPayment: '$10,000' },
        files: { count: 12, lastUpload: 'Reporte_Metricas_v2.pdf', time: 'Hace 2h' }
      },
      { 
        id: '2', 
        name: 'Chatbot de Soporte al Cliente', 
        vendor: 'InnovateAI Corp', 
        status: 'Inicio', 
        progress: 15, 
        image: 'https://picsum.photos/id/4/100/100',
        tracking: { phase: 'Diseño de Conversación', nextEvent: 'Workshop UX', date: '22 Ago, 15:00' },
        deliverables: { current: 'Hito 1', pendingReview: false, nextPayment: '$5,000' },
        files: { count: 3, lastUpload: 'Kickoff_Deck.pdf', time: 'Hace 1d' }
      },
      { 
        id: '3', 
        name: 'Análisis Predictivo de Ventas', 
        vendor: 'Cognitive Tech', 
        status: 'En Revisión', 
        progress: 95, 
        image: 'https://picsum.photos/id/20/100/100',
        tracking: { phase: 'Validación Final', nextEvent: 'Cierre Proyecto', date: '30 Sep' },
        deliverables: { current: 'Hito Final', pendingReview: true, nextPayment: '$8,000' },
        files: { count: 24, lastUpload: 'Codigo_Fuente_Final.zip', time: 'Hace 30m' }
      },
  ];

  // Logic for filtering projects based on selection or dropdown search
  const filteredProjects = projects.filter(p => {
      // If a specific project is selected via dropdown, show only that one
      if (selectedContext.id !== 'all') {
          return p.id === selectedContext.id;
      }
      // Otherwise show all (The search query inside dropdown is only for the dropdown list itself)
      return true;
  });

  // Logic for the dropdown list items
  const dropdownSuggestions = searchQuery.trim() 
      ? projects.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.vendor.toLowerCase().includes(searchQuery.toLowerCase()))
      : projects;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <ClientLayout>
       <div className="space-y-8 pb-12">
          
          {/* Header Section */}
          <div>
            <h1 className="text-3xl font-black text-gray-900">Mis Proyectos</h1>
            <p className="text-gray-500 mt-1">Visión general y acceso rápido a todos tus desarrollos activos.</p>
          </div>

          {/* Advanced Search Bar */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 relative z-20">
             <div className="w-full md:w-auto flex-1" ref={searchRef}>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Filtrar Proyecto</label>
                
                <div className="relative">
                   <button 
                      onClick={() => setIsSearchOpen(!isSearchOpen)}
                      className="w-full md:w-96 flex items-center justify-between bg-gray-50 border border-gray-200 hover:bg-white hover:border-gray-300 text-gray-900 text-left rounded-xl px-4 py-3 transition-all group"
                   >
                      <div className="flex items-center gap-3">
                         {selectedContext.id !== 'all' ? (
                             <span className="material-symbols-outlined text-primary">folder</span>
                         ) : (
                             <span className="material-symbols-outlined text-gray-400">dashboard</span>
                         )}
                         <div>
                             <span className="block font-bold text-lg leading-tight">{selectedContext.name}</span>
                             <span className="text-xs text-gray-500 font-medium">{selectedContext.vendor}</span>
                         </div>
                      </div>
                      <span className="material-symbols-outlined text-gray-400 group-hover:text-gray-600">expand_more</span>
                   </button>

                   {isSearchOpen && (
                      <div className="absolute top-full left-0 w-full md:w-[450px] bg-white rounded-xl shadow-floating border border-gray-100 mt-2 p-2 animate-in fade-in zoom-in-95 duration-200">
                         <div className="relative mb-2">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                            <input 
                               type="text" 
                               placeholder="Buscar proyecto..." 
                               className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                               value={searchQuery}
                               onChange={(e) => setSearchQuery(e.target.value)}
                               autoFocus
                            />
                         </div>
                         <div className="max-h-60 overflow-y-auto space-y-1">
                            <button 
                               onClick={() => {
                                  setSelectedContext({ name: 'Todos los Proyectos', vendor: 'Vista General', id: 'all' });
                                  setIsSearchOpen(false);
                                  setSearchQuery('');
                               }}
                               className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 hover:bg-gray-50"
                            >
                               <span className="material-symbols-outlined text-gray-400">dashboard</span>
                               <div>
                                   <p className="font-bold text-sm text-gray-900">Todos los Proyectos</p>
                                   <p className="text-xs text-gray-500">Mostrar lista completa</p>
                               </div>
                            </button>
                            
                            <div className="border-t border-gray-100 my-1"></div>
                            
                            {dropdownSuggestions.length > 0 ? (
                                dropdownSuggestions.map(p => (
                                   <button 
                                      key={p.id}
                                      onClick={() => {
                                         setSelectedContext({ name: p.name, vendor: p.vendor, id: p.id });
                                         setIsSearchOpen(false);
                                         setSearchQuery('');
                                      }}
                                      className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 hover:bg-gray-50 group"
                                   >
                                      <img src={p.image} alt={p.name} className="w-8 h-8 rounded-md bg-gray-100 object-cover" />
                                      <div className="flex-1">
                                         <p className="font-bold text-sm text-gray-900">{p.name}</p>
                                         <p className="text-xs text-gray-500">{p.vendor}</p>
                                      </div>
                                   </button>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 text-sm py-4">No se encontraron resultados</p>
                            )}
                         </div>
                      </div>
                   )}
                </div>
             </div>
             
             <div className="flex gap-2">
                 <button 
                    onClick={() => navigate('/search')}
                    className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:opacity-90 shadow-lg shadow-primary/20 flex items-center gap-2 transition-transform hover:-translate-y-0.5"
                 >
                    <span className="material-symbols-outlined">add</span>
                    Nuevo Proyecto
                 </button>
             </div>
          </div>

          {/* High Level Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl">folder_open</span>
                  </div>
                  <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Activos</p>
                      <p className="text-2xl font-black text-gray-900">{projects.length}</p>
                  </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl">payments</span>
                  </div>
                  <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Inversión Total</p>
                      <p className="text-2xl font-black text-gray-900">$120k</p>
                  </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl">notifications_active</span>
                  </div>
                  <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Acciones Pendientes</p>
                      <p className="text-2xl font-black text-gray-900">1 Revisión</p>
                  </div>
              </div>
          </div>

          {/* Project Cards Grid */}
          <div className="space-y-6">
             {filteredProjects.map(project => (
                 <div key={project.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-card transition-shadow duration-300">
                    
                    {/* Card Header */}
                    <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/30">
                        <div className="flex items-center gap-4">
                            <img src={project.image} alt="Logo" className="w-14 h-14 rounded-xl object-cover border border-gray-200 shadow-sm" />
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{project.name}</h2>
                                <p className="text-sm text-gray-500 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">storefront</span> 
                                    {project.vendor}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${project.status === 'En Revisión' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                                {project.status}
                            </span>
                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                                <span className="material-symbols-outlined">more_horiz</span>
                            </button>
                        </div>
                    </div>

                    {/* Card Content: 3 Columns Holistic View */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
                        
                        {/* 1. SEGUIMIENTO (Tracking) */}
                        <div className="p-6 hover:bg-gray-50 transition-colors group">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="material-symbols-outlined text-blue-500">timeline</span>
                                <h3 className="font-bold text-gray-900 text-sm uppercase">Seguimiento</h3>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                                        <span>Progreso General</span>
                                        <span>{project.progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-blue-600 h-2 rounded-full transition-all duration-1000" style={{width: `${project.progress}%`}}></div>
                                    </div>
                                </div>
                                
                                <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                                    <p className="text-xs text-gray-500 mb-1">Próximo Evento</p>
                                    <p className="font-bold text-gray-900 text-sm">{project.tracking.nextEvent}</p>
                                    <p className="text-xs text-blue-600 font-medium mt-0.5">{project.tracking.date}</p>
                                </div>

                                <button 
                                    onClick={() => navigate('/client/projects/track')}
                                    className="w-full py-2 border border-gray-200 text-gray-600 font-bold text-xs rounded-lg hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 group-hover:bg-white"
                                >
                                    Ver Cronograma <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </button>
                            </div>
                        </div>

                        {/* 2. HITOS Y ENTREGABLES (Deliverables) */}
                        <div className="p-6 hover:bg-gray-50 transition-colors group">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="material-symbols-outlined text-green-600">flag</span>
                                <h3 className="font-bold text-gray-900 text-sm uppercase">Hitos y Pagos</h3>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-xs text-gray-500">Fase Actual</p>
                                        <p className="font-bold text-gray-900">{project.deliverables.current}</p>
                                    </div>
                                    {project.deliverables.pendingReview && (
                                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                                    )}
                                </div>

                                <div className={`p-3 rounded-lg border ${project.deliverables.pendingReview ? 'bg-amber-50 border-amber-200' : 'bg-gray-50 border-gray-200'}`}>
                                    {project.deliverables.pendingReview ? (
                                        <>
                                            <p className="text-xs font-bold text-amber-800 flex items-center gap-1">
                                                <span className="material-symbols-outlined text-sm">warning</span> Acción Requerida
                                            </p>
                                            <p className="text-xs text-amber-700 mt-1">Revisar entregable para liberar pago.</p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-xs text-gray-500">Próximo Pago (Escrow)</p>
                                            <p className="font-bold text-gray-900 text-sm">{project.deliverables.nextPayment}</p>
                                        </>
                                    )}
                                </div>

                                <button 
                                    onClick={() => navigate(project.deliverables.pendingReview ? '/client/funds/review' : '/client/projects/deliverables')}
                                    className={`w-full py-2 border font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2 group-hover:bg-white
                                        ${project.deliverables.pendingReview 
                                            ? 'bg-amber-100 border-amber-200 text-amber-800 hover:bg-amber-200' 
                                            : 'border-gray-200 text-gray-600 hover:border-green-300 hover:text-green-600 hover:bg-green-50'
                                        }`}
                                >
                                    {project.deliverables.pendingReview ? 'Revisar Ahora' : 'Gestionar Hitos'} <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </button>
                            </div>
                        </div>

                        {/* 3. ARCHIVOS (Files) */}
                        <div className="p-6 hover:bg-gray-50 transition-colors group">
                             <div className="flex items-center gap-2 mb-4">
                                <span className="material-symbols-outlined text-purple-500">folder</span>
                                <h3 className="font-bold text-gray-900 text-sm uppercase">Archivos</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
                                        <span className="material-symbols-outlined">description</span>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">{project.files.count}</p>
                                        <p className="text-xs text-gray-400">Archivos en total</p>
                                    </div>
                                </div>

                                <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                    <p className="text-xs text-gray-400 mb-1">Última actualización</p>
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <span className="material-symbols-outlined text-gray-400 text-sm">draft</span>
                                        <p className="text-xs font-medium text-gray-700 truncate">{project.files.lastUpload}</p>
                                    </div>
                                    <p className="text-[10px] text-gray-400 text-right mt-1">{project.files.time}</p>
                                </div>

                                <button 
                                    onClick={() => navigate('/client/projects/files')}
                                    className="w-full py-2 border border-gray-200 text-gray-600 font-bold text-xs rounded-lg hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 transition-all flex items-center justify-center gap-2 group-hover:bg-white"
                                >
                                    Ir al Repositorio <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </button>
                            </div>
                        </div>

                    </div>
                 </div>
             ))}

             {filteredProjects.length === 0 && (
                 <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                     <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                         <span className="material-symbols-outlined text-3xl">search_off</span>
                     </div>
                     <h3 className="font-bold text-gray-900 text-lg">No se encontraron proyectos</h3>
                     <p className="text-gray-500">Intenta ajustar tu búsqueda o limpiar los filtros.</p>
                     <button 
                         onClick={() => { setSelectedContext({ name: 'Todos los Proyectos', vendor: 'Vista General', id: 'all' }); setSearchQuery(''); }}
                         className="mt-4 text-primary text-sm font-bold hover:underline"
                     >
                         Ver todos los proyectos
                     </button>
                 </div>
             )}
          </div>
       </div>
    </ClientLayout>
  );
};

export default ClientProjects;