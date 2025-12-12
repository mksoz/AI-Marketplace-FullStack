import React, { useState, useRef, useEffect } from 'react';
import ClientLayout from '../../components/ClientLayout';

const ClientProjectDeliverables: React.FC = () => {
  // Project Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState({
      name: 'Motor de Recomendación con IA',
      vendor: 'QuantumLeap AI',
      id: '1'
  });
  const searchRef = useRef<HTMLDivElement>(null);

  // Mock Data
  const projects = [
      { id: '1', name: 'Motor de Recomendación con IA', vendor: 'QuantumLeap AI', status: 'Activo' },
      { id: '2', name: 'Chatbot de Soporte al Cliente', vendor: 'InnovateAI Corp', status: 'Activo' },
      { id: '3', name: 'Análisis Predictivo de Ventas', vendor: 'Cognitive Tech', status: 'Revisión' },
      { id: '4', name: 'Visión por Computador Retail', vendor: 'InnovateAI Corp', status: 'Finalizado' },
  ];

  const filteredProjects = projects.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.vendor.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <div className="space-y-8">
        
         {/* Advanced Project Search Selector */}
         <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 relative z-20">
             <div className="w-full md:w-auto flex-1" ref={searchRef}>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Proyecto Seleccionado</label>
                
                <div className="relative">
                   <button 
                      onClick={() => setIsSearchOpen(!isSearchOpen)}
                      className="w-full md:w-96 flex items-center justify-between bg-gray-50 border border-gray-200 hover:bg-white hover:border-gray-300 text-gray-900 text-left rounded-xl px-4 py-3 transition-all group"
                   >
                      <div>
                         <span className="block font-bold text-lg leading-tight">{selectedProject.name}</span>
                         <span className="text-xs text-gray-500 font-medium">{selectedProject.vendor}</span>
                      </div>
                      <span className="material-symbols-outlined text-gray-400 group-hover:text-gray-600">expand_more</span>
                   </button>

                   {isSearchOpen && (
                      <div className="absolute top-full left-0 w-full md:w-[450px] bg-white rounded-xl shadow-floating border border-gray-100 mt-2 p-2 animate-in fade-in zoom-in-95 duration-200">
                         <div className="relative mb-2">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                            <input 
                               type="text" 
                               placeholder="Buscar por proyecto o vendor..." 
                               className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                               value={searchQuery}
                               onChange={(e) => setSearchQuery(e.target.value)}
                               autoFocus
                            />
                         </div>
                         <div className="max-h-60 overflow-y-auto space-y-1">
                            {filteredProjects.length > 0 ? (
                                filteredProjects.map(p => (
                                   <button 
                                      key={p.id}
                                      onClick={() => {
                                         setSelectedProject(p);
                                         setIsSearchOpen(false);
                                         setSearchQuery('');
                                      }}
                                      className={`w-full text-left px-3 py-2 rounded-lg flex justify-between items-center group transition-colors ${selectedProject.id === p.id ? 'bg-primary/5' : 'hover:bg-gray-50'}`}
                                   >
                                      <div>
                                         <p className={`font-bold text-sm ${selectedProject.id === p.id ? 'text-primary' : 'text-gray-900'}`}>{p.name}</p>
                                         <p className="text-xs text-gray-500">{p.vendor}</p>
                                      </div>
                                      {selectedProject.id === p.id && <span className="material-symbols-outlined text-primary text-sm">check</span>}
                                   </button>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 text-sm py-4">No se encontraron proyectos</p>
                            )}
                         </div>
                      </div>
                   )}
                </div>
             </div>
             <div className="flex gap-3 text-right">
                 <div>
                     <p className="text-xs text-gray-500 uppercase font-bold">Progreso Total</p>
                     <p className="text-2xl font-black text-gray-900">65%</p>
                 </div>
                 <div className="w-px bg-gray-200 h-10 mx-2"></div>
                 <div>
                     <p className="text-xs text-gray-500 uppercase font-bold">Próximo Pago</p>
                     <p className="text-xl font-bold text-primary">30 Sep</p>
                 </div>
             </div>
         </div>

         <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Hitos y Entregables</h2>
            
            <div className="space-y-8 relative pl-8 before:content-[''] before:absolute before:top-4 before:bottom-4 before:left-[19px] before:w-0.5 before:bg-gray-200">

               {/* Milestone 1: Completed */}
               <div className="relative">
                  <div className="absolute -left-[33px] top-0 w-10 h-10 rounded-full bg-green-500 border-4 border-white shadow-sm flex items-center justify-center text-white z-10">
                     <span className="material-symbols-outlined text-xl">check</span>
                  </div>
                  
                  <div className="bg-white rounded-xl border border-green-200 shadow-sm overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
                      <div className="bg-green-50 px-6 py-4 border-b border-green-100 flex justify-between items-center">
                          <div>
                              <h3 className="font-bold text-gray-900 text-lg">Hito 1: Descubrimiento y Diseño</h3>
                              <p className="text-xs text-green-700 font-medium mt-0.5 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-sm">paid</span> Pagado: $5,000.00 USD
                              </p>
                          </div>
                          <span className="px-3 py-1 bg-white text-green-700 text-xs font-bold rounded-full border border-green-200">COMPLETADO</span>
                      </div>
                      
                      <div className="divide-y divide-gray-100">
                          {/* Deliverable Item */}
                          <div className="p-4 px-6 flex items-start gap-4">
                              <div className="pt-1"><span className="material-symbols-outlined text-green-500">task_alt</span></div>
                              <div className="flex-1">
                                  <h4 className="font-bold text-gray-800 text-sm line-through decoration-gray-400">Documento de Requisitos Técnicos</h4>
                                  <p className="text-xs text-gray-500">Aprobado el 10 Ago</p>
                              </div>
                              <button className="text-gray-400 hover:text-primary"><span className="material-symbols-outlined">description</span></button>
                          </div>
                          {/* Deliverable Item */}
                          <div className="p-4 px-6 flex items-start gap-4">
                              <div className="pt-1"><span className="material-symbols-outlined text-green-500">task_alt</span></div>
                              <div className="flex-1">
                                  <h4 className="font-bold text-gray-800 text-sm line-through decoration-gray-400">Wireframes de Alta Fidelidad</h4>
                                  <p className="text-xs text-gray-500">Aprobado el 14 Ago</p>
                              </div>
                              <button className="text-gray-400 hover:text-primary"><span className="material-symbols-outlined">description</span></button>
                          </div>
                      </div>
                  </div>
               </div>

               {/* Milestone 2: Active */}
               <div className="relative">
                  <div className="absolute -left-[33px] top-0 w-10 h-10 rounded-full bg-primary border-4 border-white shadow-lg flex items-center justify-center text-white z-10 animate-pulse">
                     <span className="material-symbols-outlined text-xl">sync</span>
                  </div>
                  
                  <div className="bg-white rounded-xl border-2 border-primary shadow-lg overflow-hidden transform scale-[1.01]">
                      <div className="bg-primary/5 px-6 py-4 border-b border-primary/10 flex justify-between items-center">
                          <div>
                              <h3 className="font-bold text-gray-900 text-lg">Hito 2: Desarrollo MVP</h3>
                              <p className="text-xs text-primary font-medium mt-0.5 flex items-center gap-1">
                                  <span className="material-symbols-outlined text-sm">lock</span> En Escrow: $10,000.00 USD
                              </p>
                          </div>
                          <span className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full">EN PROGRESO</span>
                      </div>
                      
                      <div className="divide-y divide-gray-100">
                          {/* Deliverable Item */}
                          <div className="p-4 px-6 flex items-start gap-4 bg-gray-50">
                              <div className="pt-1"><span className="material-symbols-outlined text-green-500">check_circle</span></div>
                              <div className="flex-1">
                                  <h4 className="font-bold text-gray-900 text-sm">Configuración de Arquitectura AWS</h4>
                                  <p className="text-xs text-green-600 font-medium">Entregado y Aprobado</p>
                              </div>
                              <button className="text-primary hover:underline text-xs font-bold">Ver Archivo</button>
                          </div>
                          {/* Deliverable Item */}
                          <div className="p-4 px-6 flex items-start gap-4 bg-amber-50 border-l-4 border-amber-400">
                              <div className="pt-1"><span className="material-symbols-outlined text-amber-500">rate_review</span></div>
                              <div className="flex-1">
                                  <h4 className="font-bold text-gray-900 text-sm">API Endpoints (v1)</h4>
                                  <p className="text-xs text-amber-700 font-medium">En Revisión - Esperando tu aprobación</p>
                                  <div className="mt-2 flex gap-2">
                                      <button className="px-3 py-1 bg-primary text-white text-xs font-bold rounded hover:opacity-90">Aprobar</button>
                                      <button className="px-3 py-1 bg-white border border-gray-300 text-gray-700 text-xs font-bold rounded hover:bg-gray-50">Solicitar Cambios</button>
                                  </div>
                              </div>
                              <button className="text-gray-500 hover:text-primary"><span className="material-symbols-outlined">open_in_new</span></button>
                          </div>
                          {/* Deliverable Item */}
                          <div className="p-4 px-6 flex items-start gap-4 opacity-60">
                              <div className="pt-1"><span className="material-symbols-outlined text-gray-300">radio_button_unchecked</span></div>
                              <div className="flex-1">
                                  <h4 className="font-medium text-gray-500 text-sm">Integración Frontend</h4>
                                  <p className="text-xs text-gray-400">Pendiente - Vence 30 Sep</p>
                              </div>
                          </div>
                      </div>
                  </div>
               </div>

               {/* Milestone 3: Pending */}
               <div className="relative">
                  <div className="absolute -left-[33px] top-0 w-10 h-10 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center text-gray-400 z-10">
                     <span className="font-bold">3</span>
                  </div>
                  
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden opacity-60 grayscale">
                      <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                          <div>
                              <h3 className="font-bold text-gray-700 text-lg">Hito 3: QA y Despliegue</h3>
                              <p className="text-xs text-gray-500 mt-0.5">Pendiente: $5,000.00 USD</p>
                          </div>
                          <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs font-bold rounded-full">PENDIENTE</span>
                      </div>
                      <div className="p-6 text-center text-sm text-gray-400 italic">
                          Los entregables se activarán cuando se complete el Hito anterior.
                      </div>
                  </div>
               </div>

            </div>
         </div>

      </div>
    </ClientLayout>
  );
};

export default ClientProjectDeliverables;