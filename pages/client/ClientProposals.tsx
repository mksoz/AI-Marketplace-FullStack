import React, { useState, useRef, useEffect } from 'react';
import ClientLayout from '../../components/ClientLayout';
import Modal from '../../components/Modal';

const ClientProposals: React.FC = () => {
  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContext, setSelectedContext] = useState({
      label: 'Todas las Propuestas',
      sublabel: 'Vista General',
      id: 'all'
  });
  const searchRef = useRef<HTMLDivElement>(null);

  // Proposal Viewing State
  const [viewProposal, setViewProposal] = useState<any>(null);

  // Mock Data
  const proposals = [
     { 
         id: '1', 
         title: 'Desarrollo de Chatbot', 
         vendor: 'AI Solutions Inc.', 
         date: '15/10/2023', 
         status: 'En Revisión', 
         color: 'bg-blue-100 text-blue-700',
         description: 'Implementación de un asistente virtual basado en NLP para atención al cliente 24/7.',
         price: '$12,500'
     },
     { 
         id: '2', 
         title: 'Sistema de Recomendación', 
         vendor: 'InnovateAI', 
         date: '12/10/2023', 
         status: 'Aceptada', 
         color: 'bg-green-100 text-green-700',
         description: 'Motor de recomendación personalizado para e-commerce utilizando filtrado colaborativo.',
         price: '$25,000' 
     },
     { 
         id: '3', 
         title: 'Optimización de Logística', 
         vendor: 'DataDriven Co.', 
         date: '05/10/2023', 
         status: 'Rechazada', 
         color: 'bg-red-100 text-red-700',
         description: 'Algoritmo de optimización de rutas para flota de distribución.',
         price: '$18,000' 
     },
     { 
         id: '4', 
         title: 'Análisis Predictivo', 
         vendor: 'Future Forward', 
         date: '01/10/2023', 
         status: 'Enviada', 
         color: 'bg-gray-100 text-gray-700',
         description: 'Dashboard de análisis predictivo de ventas y churn rate.',
         price: '$30,000' 
     },
  ];

  const getFilteredProposals = () => {
      if (searchQuery.trim()) {
          return proposals.filter(p => 
              p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
              p.vendor.toLowerCase().includes(searchQuery.toLowerCase())
          );
      }
      if (selectedContext.id !== 'all') {
          return proposals.filter(p => p.id === selectedContext.id);
      }
      return proposals;
  };

  const filteredProposals = getFilteredProposals();
  
  const searchSuggestions = searchQuery.trim() 
      ? proposals.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.vendor.toLowerCase().includes(searchQuery.toLowerCase()))
      : proposals;

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
       <div className="space-y-6">
          <div className="flex items-center justify-between">
             <h1 className="text-3xl font-black text-gray-900">Mis Propuestas</h1>
          </div>

          {/* Advanced Search Bar */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 relative z-20">
             <div className="w-full md:w-auto flex-1" ref={searchRef}>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Filtrar Propuestas</label>
                
                <div className="relative">
                   <button 
                      onClick={() => setIsSearchOpen(!isSearchOpen)}
                      className="w-full md:w-96 flex items-center justify-between bg-gray-50 border border-gray-200 hover:bg-white hover:border-gray-300 text-gray-900 text-left rounded-xl px-4 py-3 transition-all group"
                   >
                      <div>
                         <span className="block font-bold text-lg leading-tight">{selectedContext.label}</span>
                         <span className="text-xs text-gray-500 font-medium">{selectedContext.sublabel}</span>
                      </div>
                      <span className="material-symbols-outlined text-gray-400 group-hover:text-gray-600">expand_more</span>
                   </button>

                   {isSearchOpen && (
                      <div className="absolute top-full left-0 w-full md:w-[450px] bg-white rounded-xl shadow-floating border border-gray-100 mt-2 p-2 animate-in fade-in zoom-in-95 duration-200">
                         <div className="relative mb-2">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                            <input 
                               type="text" 
                               placeholder="Buscar por título o vendor..." 
                               className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                               value={searchQuery}
                               onChange={(e) => setSearchQuery(e.target.value)}
                               autoFocus
                            />
                         </div>
                         <div className="max-h-60 overflow-y-auto space-y-1">
                            <button 
                               onClick={() => {
                                  setSelectedContext({ label: 'Todas las Propuestas', sublabel: 'Vista General', id: 'all' });
                                  setIsSearchOpen(false);
                                  setSearchQuery('');
                               }}
                               className="w-full text-left px-3 py-2 rounded-lg flex justify-between items-center hover:bg-gray-50"
                            >
                               <span className="font-bold text-sm text-primary">Ver Todas</span>
                            </button>
                            {searchSuggestions.length > 0 ? (
                                searchSuggestions.map(p => (
                                   <button 
                                      key={p.id}
                                      onClick={() => {
                                         setSelectedContext({ label: p.title, sublabel: p.vendor, id: p.id });
                                         setIsSearchOpen(false);
                                         setSearchQuery('');
                                      }}
                                      className="w-full text-left px-3 py-2 rounded-lg flex justify-between items-center hover:bg-gray-50 group"
                                   >
                                      <div>
                                         <p className="font-bold text-sm text-gray-900">{p.title}</p>
                                         <p className="text-xs text-gray-500">{p.vendor}</p>
                                      </div>
                                      <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">{p.status}</span>
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
                <button className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 text-gray-600 font-medium text-sm flex items-center gap-2 shadow-sm bg-white">
                   <span className="material-symbols-outlined">download</span> Exportar
                </button>
             </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
             {['Todos', 'Borrador', 'Enviada', 'En Revisión', 'Aceptada', 'Rechazada'].map((status, i) => (
                <button key={i} className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${i === 0 ? 'bg-blue-50 text-primary border border-blue-100' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                   {status}
                </button>
             ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
             <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                   <tr>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Título de la Propuesta</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Vendor</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Fecha de Envío</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Acciones</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                   {filteredProposals.length > 0 ? (
                       filteredProposals.map((item, i) => (
                          <tr key={item.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setViewProposal(item)}>
                             <td className="px-6 py-4 font-medium text-gray-900">{item.title}</td>
                             <td className="px-6 py-4 text-gray-500">{item.vendor}</td>
                             <td className="px-6 py-4 text-gray-500">{item.date}</td>
                             <td className="px-6 py-4">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${item.color}`}>{item.status}</span>
                             </td>
                             <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <button 
                                        className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-full transition-colors tooltip"
                                        title="Ver Propuesta"
                                    >
                                       <span className="material-symbols-outlined">visibility</span>
                                    </button>
                                </div>
                             </td>
                          </tr>
                       ))
                   ) : (
                       <tr>
                           <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                               No se encontraron propuestas con los filtros actuales.
                           </td>
                       </tr>
                   )}
                </tbody>
             </table>
          </div>
       </div>

       {/* View Proposal Modal */}
       <Modal isOpen={!!viewProposal} onClose={() => setViewProposal(null)} title="Detalles de la Propuesta">
          {viewProposal && (
              <div className="space-y-6">
                 <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">{viewProposal.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">Vendor: <span className="font-semibold text-gray-700">{viewProposal.vendor}</span></p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${viewProposal.color}`}>
                        {viewProposal.status}
                    </span>
                 </div>
                 
                 <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <h4 className="text-sm font-bold text-gray-900 mb-2">Descripción del Alcance</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{viewProposal.description}</p>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                     <div className="p-3 border border-gray-200 rounded-lg text-center">
                        <p className="text-xs text-gray-500 uppercase font-bold">Fecha de Envío</p>
                        <p className="text-gray-900 font-semibold">{viewProposal.date}</p>
                     </div>
                     <div className="p-3 border border-gray-200 rounded-lg text-center bg-gray-50">
                        <p className="text-xs text-gray-500 uppercase font-bold">Presupuesto</p>
                        <p className="text-primary font-bold text-lg">{viewProposal.price}</p>
                     </div>
                 </div>
                 
                 <div className="flex gap-3 pt-2 border-t border-gray-100 mt-2">
                    <button className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-lg">download</span> Descargar PDF
                    </button>
                    {/* Show Edit only if editable */}
                    {(viewProposal.status === 'En Revisión' || viewProposal.status === 'Borrador') && (
                        <button className="flex-1 py-2.5 bg-primary text-white font-bold rounded-lg hover:opacity-90 transition-colors flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-lg">edit</span> Editar
                        </button>
                    )}
                 </div>
              </div>
          )}
       </Modal>
    </ClientLayout>
  );
};

export default ClientProposals;