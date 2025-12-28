import React, { useState, useRef, useEffect } from 'react';
import ClientLayout from '../../components/ClientLayout';
import ClientProposalDetailsModal from '../../components/ClientProposalDetailsModal';
import api from '../../services/api';

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
   const [proposals, setProposals] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const [currentUserEmail, setCurrentUserEmail] = useState('');

   // Tab State
   const [activeTab, setActiveTab] = useState('Todos');

   const fetchProjects = async () => {
      try {
         const [projectsRes, userRes] = await Promise.all([
            api.get('/projects/my-projects'),
            api.get('/auth/me').catch(() => ({ data: { email: '' } }))
         ]);

         // Map backend status to UI colors
         const mappedProjects = projectsRes.data.map((p: any) => {
            let color = 'bg-gray-100 text-gray-700';
            let uiStatus = 'Pendiente';

            if (p.status === 'COMPLETED') {
               color = 'bg-gray-100 text-gray-500'; uiStatus = 'Finalizada';
            }
            else if (p.status === 'ACCEPTED') {
               color = 'bg-green-100 text-green-700'; uiStatus = 'Aceptada';
            }
            else if (p.status === 'DECLINED' || p.status === 'CANCELLED') {
               color = 'bg-red-100 text-red-700'; uiStatus = 'Rechazada';
            }
            else if (p.status === 'IN_NEGOTIATION' || p.status === 'CONTACTED') {
               color = 'bg-purple-100 text-purple-700'; uiStatus = 'En Negociación';
            }
            else {
               color = 'bg-yellow-100 text-yellow-700'; uiStatus = 'Pendiente'; // PROPOSED, OPEN
            }

            const needsSignature = p.contract && !p.contract.clientSigned && p.status === 'IN_NEGOTIATION';

            return {
               ...p,
               vendor: p.vendor?.companyName || 'Pendiente de Asignación',
               date: new Date(p.createdAt).toLocaleDateString(),
               color,
               uiStatus, // Store mapped status for filtering
               needsSignature
            };
         });

         setProposals(mappedProjects);
         setCurrentUserEmail(userRes.data?.email || '');
      } catch (error) {
         console.error("Error fetching projects", error);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchProjects();
   }, []);

   const getFilteredProposals = () => {
      let result = proposals;

      // Filter by Tab
      if (activeTab !== 'Todos') {
         result = result.filter(p => p.uiStatus === activeTab);
      }

      // Filter by Search
      if (searchQuery.trim()) {
         result = result.filter(p =>
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.vendor.toLowerCase().includes(searchQuery.toLowerCase())
         );
      }
      // Filter by Dropdown Context
      if (selectedContext.id !== 'all') {
         result = result.filter(p => p.id === selectedContext.id);
      }
      return result;
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

   // Handle modal close and refresh
   const handleModalClose = () => {
      setViewProposal(null);
      fetchProjects(); // Refresh data in case status changed (signed)
   };

   // Tabs List
   const tabs = ['Todos', 'Pendiente', 'En Negociación', 'Aceptada', 'Finalizada', 'Rechazada'];

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
                           {/* Search Input */}
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

                           {/* Results List */}
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
               {tabs.map((status, i) => (
                  <button
                     key={i}
                     onClick={() => setActiveTab(status)}
                     className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeTab === status ? 'bg-blue-50 text-primary border border-blue-100' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
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
                     {loading ? (
                        <tr><td colSpan={5} className="p-8 text-center text-gray-400">Cargando propuestas...</td></tr>
                     ) : filteredProposals.length > 0 ? (
                        filteredProposals.map((item, i) => (
                           <tr key={item.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setViewProposal(item)}>
                              <td className="px-6 py-4 font-medium text-gray-900">{item.title}</td>
                              <td className="px-6 py-4 text-gray-500">{item.vendor}</td>
                              <td className="px-6 py-4 text-gray-500">{item.date}</td>
                              <td className="px-6 py-4">
                                 <div className="flex flex-col gap-1">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold w-fit ${item.color}`}>{item.uiStatus}</span>
                                    {item.needsSignature && (
                                       <span className="flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100 w-fit animate-pulse">
                                          <span className="material-symbols-outlined text-sm">edit_document</span> ACCIÓN REQUERIDA: FIRMAR
                                       </span>
                                    )}
                                 </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                 <div className="flex justify-end gap-2">
                                    <button
                                       className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-full transition-colors tooltip"
                                       title="Ver Propuesta"
                                       onClick={(e) => { e.stopPropagation(); setViewProposal(item); }}
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
         <ClientProposalDetailsModal
            isOpen={!!viewProposal}
            onClose={handleModalClose}
            proposal={viewProposal}
            currentUserEmail={currentUserEmail}
         />
      </ClientLayout>
   );
};

export default ClientProposals;