import React, { useState, useRef, useEffect } from 'react';
import ClientLayout from '../../components/ClientLayout';
import ClientProposalDetailsModal from '../../components/ClientProposalDetailsModal';
import api from '../../services/api';

const ClientProposals: React.FC = () => {
   // View State
   const [viewMode, setViewMode] = useState<'board' | 'list'>('board');

   // Search & Filter State
   const [isSearchOpen, setIsSearchOpen] = useState(false);
   const [searchQuery, setSearchQuery] = useState('');
   const searchRef = useRef<HTMLDivElement>(null);
   const [statusFilter, setStatusFilter] = useState('Todos');
   const [dateFilter, setDateFilter] = useState({ start: '', end: '' });

   // Data State
   const [viewProposal, setViewProposal] = useState<any>(null);
   const [proposals, setProposals] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const [currentUserEmail, setCurrentUserEmail] = useState('');

   const fetchProjects = async () => {
      try {
         const [projectsRes, userRes] = await Promise.all([
            api.get('/projects/my-projects'),
            api.get('/auth/me').catch(() => ({ data: { email: '' } }))
         ]);

         // Map backend status to UI colors and Statuses
         const mappedProjects = projectsRes.data.map((p: any) => {
            let color = 'bg-gray-100 text-gray-700';
            let uiStatus = 'Pendiente';
            let statusId = 'PENDING'; // Internal ID for filtering

            if (p.status === 'COMPLETED') {
               color = 'bg-gray-100 text-gray-500'; uiStatus = 'Finalizada'; statusId = 'COMPLETED';
            }
            else if (p.status === 'ACCEPTED') {
               color = 'bg-green-100 text-green-700'; uiStatus = 'Aceptada'; statusId = 'ACCEPTED';
            }
            else if (p.status === 'IN_PROGRESS') {
               color = 'bg-blue-100 text-blue-700'; uiStatus = 'En Curso'; statusId = 'IN_PROGRESS';
            }
            else if (p.status === 'DECLINED' || p.status === 'CANCELLED') {
               color = 'bg-red-100 text-red-700'; uiStatus = 'Rechazada'; statusId = 'DECLINED';
            }
            else if (p.status === 'IN_NEGOTIATION' || p.status === 'CONTACTED') {
               color = 'bg-purple-100 text-purple-700'; uiStatus = 'En Negociación'; statusId = 'IN_NEGOTIATION';
            }
            else {
               color = 'bg-yellow-100 text-yellow-700'; uiStatus = 'Pendiente'; statusId = 'PENDING';
            }

            const needsSignature = p.contract && !p.contract.clientSigned && p.status === 'IN_NEGOTIATION';

            return {
               ...p,
               vendor: p.vendor?.companyName || 'Pendiente de Asignación',
               date: new Date(p.createdAt).toLocaleDateString(),
               rawDate: new Date(p.createdAt),
               rejectionReason: p.rejectionReason, // Ensure exact mapping
               color,
               uiStatus,
               statusId,
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

      const handleClickOutside = (event: MouseEvent) => {
         if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
            setIsSearchOpen(false);
         }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
   }, []);

   // Filter Logic
   const getFilteredProposals = () => {
      let result = proposals;

      // Filter by Status
      if (statusFilter !== 'Todos') {
         // Map friendly filter names back to internal IDs
         if (statusFilter === 'Pendiente') result = result.filter(p => p.statusId === 'PENDING');
         if (statusFilter === 'En Negociación') result = result.filter(p => p.statusId === 'IN_NEGOTIATION');
         if (statusFilter === 'Aceptada') result = result.filter(p => p.statusId === 'ACCEPTED' || p.statusId === 'COMPLETED' || p.statusId === 'IN_PROGRESS');
         if (statusFilter === 'Rechazada') result = result.filter(p => p.statusId === 'DECLINED');
      }

      // Filter by Search
      if (searchQuery.trim()) {
         result = result.filter(p =>
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.vendor.toLowerCase().includes(searchQuery.toLowerCase())
         );
      }

      // Filter by Date Range
      if (dateFilter.start) {
         const startDate = new Date(dateFilter.start);
         // Reset time to start of day for accurate comparison
         startDate.setHours(0, 0, 0, 0);
         result = result.filter(p => p.rawDate >= startDate);
      }
      if (dateFilter.end) {
         const endDate = new Date(dateFilter.end);
         // Set end date to end of day
         endDate.setHours(23, 59, 59, 999);
         result = result.filter(p => p.rawDate <= endDate);
      }

      return result;
   };

   const filteredProposals = getFilteredProposals();

   // Kanban Columns Configuration
   const columns = [
      { id: 'PENDING', label: 'Pendientes', color: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700' },
      { id: 'IN_NEGOTIATION', label: 'En Negociación', color: 'bg-purple-50 border-purple-200', text: 'text-purple-700' },
      { id: 'ACCEPTED', label: 'Aceptadas / Finalizadas', color: 'bg-green-50 border-green-200', text: 'text-green-700' },
      { id: 'DECLINED', label: 'Rechazadas', color: 'bg-red-50 border-red-200', text: 'text-red-700' }
   ];

   const getColumnProposals = (colId: string) => {
      return filteredProposals.filter(p => {
         if (colId === 'ACCEPTED') return p.statusId === 'ACCEPTED' || p.statusId === 'COMPLETED' || p.statusId === 'IN_PROGRESS';
         if (colId === 'DECLINED') return p.statusId === 'DECLINED' || p.statusId === 'CANCELLED';
         return p.statusId === colId;
      });
   };

   // Handle modal close and refresh
   const handleModalClose = () => {
      setViewProposal(null);
      fetchProjects();
   };

   return (
      <ClientLayout>
         <div className="space-y-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 shrink-0">
               <div>
                  <div className="flex items-center gap-2 mb-1">
                     <span className="material-symbols-outlined text-gray-400">description</span>
                     <span className="text-gray-500 text-sm font-medium">Gestión de Ofertas</span>
                  </div>
                  <h1 className="text-3xl font-black text-gray-900">Mis Propuestas</h1>
               </div>

               {/* View Toggles */}
               <div className="bg-white border border-gray-200 p-1 rounded-xl shadow-sm flex">
                  <button
                     onClick={() => setViewMode('list')}
                     className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'list' ? 'bg-gray-100 text-gray-900 shadow-inner' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                     <span className="material-symbols-outlined text-[18px]">table_rows</span> Lista
                  </button>
                  <button
                     onClick={() => setViewMode('board')}
                     className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${viewMode === 'board' ? 'bg-gray-100 text-gray-900 shadow-inner' : 'text-gray-500 hover:bg-gray-50'}`}
                  >
                     <span className="material-symbols-outlined text-[18px]">view_kanban</span> Tablero
                  </button>
               </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 shrink-0 z-20">
               {/* Search Input */}
               <div className="relative flex-1" ref={searchRef}>
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                  <input
                     type="text"
                     placeholder="Buscar por título, vendor..."
                     className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-gray-700"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                  />
               </div>

               {/* Date Filter */}
               <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-1">
                  <div className="relative">
                     <input
                        type="date"
                        className="bg-transparent text-sm font-medium text-gray-700 outline-none px-2 py-1.5 cursor-pointer"
                        value={dateFilter.start}
                        onChange={(e) => setDateFilter({ ...dateFilter, start: e.target.value })}
                        title="Desde"
                     />
                  </div>
                  <span className="text-gray-400">-</span>
                  <div className="relative">
                     <input
                        type="date"
                        className="bg-transparent text-sm font-medium text-gray-700 outline-none px-2 py-1.5 cursor-pointer"
                        value={dateFilter.end}
                        onChange={(e) => setDateFilter({ ...dateFilter, end: e.target.value })}
                        title="Hasta"
                     />
                  </div>
                  {(dateFilter.start || dateFilter.end) && (
                     <button
                        onClick={() => setDateFilter({ start: '', end: '' })}
                        className="p-1 hover:bg-gray-200 rounded-lg text-gray-500"
                        title="Limpiar fechas"
                     >
                        <span className="material-symbols-outlined text-sm">close</span>
                     </button>
                  )}
               </div>

               {/* Status Filter */}
               <div className="relative">
                  <select
                     className="appearance-none pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-gray-700 cursor-pointer text-sm min-w-[200px]"
                     value={statusFilter}
                     onChange={(e) => setStatusFilter(e.target.value)}
                  >
                     <option value="Todos">Todas las Propuestas</option>
                     <option value="Pendiente">Pendientes</option>
                     <option value="En Negociación">En Negociación</option>
                     <option value="Aceptada">Aceptadas / Finalizadas</option>
                     <option value="Rechazada">Rechazadas</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-xl">arrow_drop_down</span>
               </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-0 relative z-0">
               {viewMode === 'list' ? (
                  <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden h-full flex flex-col">
                     <div className="overflow-auto custom-scrollbar flex-1">
                        <table className="w-full text-left border-collapse">
                           <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                              <tr>
                                 <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Propuesta</th>
                                 <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Vendor</th>
                                 <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha</th>
                                 <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                                 <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-100">
                              {loading ? (
                                 <tr><td colSpan={5} className="p-8 text-center text-gray-400">Cargando propuestas...</td></tr>
                              ) : filteredProposals.length > 0 ? (
                                 filteredProposals.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors cursor-pointer group" onClick={() => setViewProposal(item)}>
                                       <td className="px-6 py-4">
                                          <div className="flex items-center gap-3">
                                             <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-gray-600 group-hover:bg-primary group-hover:text-white transition-colors">
                                                {item.title.charAt(0)}
                                             </div>
                                             <div>
                                                <p className="font-bold text-gray-900 group-hover:text-primary transition-colors">{item.title}</p>
                                                <p className="text-xs text-gray-500 font-mono">ID: {item.id.substring(0, 8)}...</p>
                                             </div>
                                          </div>
                                       </td>
                                       <td className="px-6 py-4 text-gray-700 font-medium">{item.vendor}</td>
                                       <td className="px-6 py-4 text-gray-500">{item.date}</td>
                                       <td className="px-6 py-4">
                                          <div className="flex flex-col gap-1 items-start">
                                             <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${item.color.replace('text-', 'text-').replace('bg-', 'bg- opacity-90')}`}>
                                                {item.uiStatus}
                                             </span>
                                             {item.needsSignature && (
                                                <span className="flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100 animate-pulse">
                                                   <span className="material-symbols-outlined text-[10px]">edit_document</span> REQUERIDO
                                                </span>
                                             )}
                                          </div>
                                       </td>
                                       <td className="px-6 py-4 text-right">
                                          <button
                                             className="p-2 text-gray-400 hover:text-primary hover:bg-white rounded-full transition-colors border border-transparent hover:border-gray-200 shadow-sm"
                                             onClick={(e) => { e.stopPropagation(); setViewProposal(item); }}
                                          >
                                             <span className="material-symbols-outlined">visibility</span>
                                          </button>
                                       </td>
                                    </tr>
                                 ))
                              ) : (
                                 <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                       <div className="flex flex-col items-center justify-center">
                                          <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">filter_list_off</span>
                                          <p>No se encontraron propuestas.</p>
                                       </div>
                                    </td>
                                 </tr>
                              )}
                           </tbody>
                        </table>
                     </div>
                  </div>
               ) : (
                  /* BOARD VIEW */
                  <div className="h-full overflow-x-auto pb-4">
                     <div className="flex gap-6 h-full min-w-[1000px]">
                        {columns.map(col => {
                           const colProps = getColumnProposals(col.id);
                           return (
                              <div key={col.id} className="flex-1 flex flex-col bg-gray-50 rounded-2xl border border-gray-200 min-w-[300px]">
                                 <div className={`p-4 border-b border-gray-200 rounded-t-2xl flex justify-between items-center ${col.color.replace('border', 'bg').replace('50', '100/50')}`}>
                                    <h3 className={`font-bold ${col.text}`}>{col.label}</h3>
                                    <span className="bg-white text-gray-800 font-bold px-2.5 py-0.5 rounded-lg text-xs shadow-sm border border-gray-100">{colProps.length}</span>
                                 </div>

                                 <div className="p-4 space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                                    {colProps.map(item => (
                                       <div
                                          key={item.id}
                                          onClick={() => setViewProposal(item)}
                                          className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg cursor-pointer hover:border-primary/50 transition-all group relative"
                                       >
                                          {item.needsSignature && (
                                             <div className="absolute top-2 right-2 flex items-center gap-1 text-[9px] font-black text-white bg-orange-500 px-2 py-0.5 rounded-full shadow-sm z-10 animate-pulse">
                                                TO-DO
                                             </div>
                                          )}

                                          <div className="flex justify-between items-start mb-3">
                                             <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-gray-600 group-hover:bg-primary group-hover:text-white transition-colors">
                                                {item.title.charAt(0)}
                                             </div>
                                          </div>

                                          <h4 className="font-bold text-gray-900 mb-1 leading-tight group-hover:text-primary transition-colors line-clamp-2">{item.title}</h4>
                                          <p className="text-xs text-gray-500 mb-3">{item.vendor}</p>

                                          {/* Rejection Reason Display */}
                                          {item.rejectionReason && col.id === 'DECLINED' && (
                                             <div className="mb-3 bg-red-50 p-2 rounded-lg border border-red-100">
                                                <p className="text-[10px] font-bold text-red-700 uppercase mb-1">Motivo de Rechazo:</p>
                                                <p className="text-xs text-red-600 italic line-clamp-3">"{item.rejectionReason}"</p>
                                             </div>
                                          )}

                                          <div className="flex items-center justify-between text-xs pt-3 border-t border-gray-50">
                                             <span className="text-gray-400 font-medium">{item.date}</span>
                                             <span className="material-symbols-outlined text-gray-300 group-hover:text-primary text-lg">arrow_forward</span>
                                          </div>
                                       </div>
                                    ))}

                                    {colProps.length === 0 && (
                                       <div className="py-8 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                                          <span className="text-xs font-medium opacity-70">Sin propuestas</span>
                                       </div>
                                    )}
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                  </div>
               )}
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