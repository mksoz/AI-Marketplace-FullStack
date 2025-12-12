import React, { useState, useRef, useEffect } from 'react';
import ClientLayout from '../../components/ClientLayout';
import { MOCK_COMPANIES } from '../../constants';

const ClientVendors: React.FC = () => {
  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVendor, setSelectedVendor] = useState({
      name: 'Todos los Vendors',
      type: 'Vista General',
      id: 'all'
  });
  const searchRef = useRef<HTMLDivElement>(null);

  // Filter Logic for Sidebar List
  const getDisplayedVendors = () => {
     if (searchQuery.trim()) {
         return MOCK_COMPANIES.filter(c => 
             c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
             c.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
         );
     }
     if (selectedVendor.id !== 'all') {
         return MOCK_COMPANIES.filter(c => c.id === selectedVendor.id);
     }
     return MOCK_COMPANIES;
  };

  const displayedVendors = getDisplayedVendors();
  
  // Dropdown suggestions (always filter by query to allow changing selection)
  const searchSuggestions = searchQuery.trim()
    ? MOCK_COMPANIES.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.specialties.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())))
    : MOCK_COMPANIES;

  // Detail view: If specific vendor selected, show it. If "All", show first from list or default.
  const detailVendor = selectedVendor.id !== 'all' 
     ? MOCK_COMPANIES.find(c => c.id === selectedVendor.id) 
     : displayedVendors[0] || MOCK_COMPANIES[0];

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
          <div className="flex justify-between items-center">
             <div>
                <h1 className="text-3xl font-black text-gray-900">Mis Vendors</h1>
                <p className="text-gray-500 mt-1">Gestiona y descubre tus socios tecnológicos de IA</p>
             </div>
          </div>

          {/* Advanced Search Bar */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 relative z-20">
             <div className="w-full md:w-auto flex-1" ref={searchRef}>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Buscar Vendor</label>
                
                <div className="relative">
                   <button 
                      onClick={() => setIsSearchOpen(!isSearchOpen)}
                      className="w-full md:w-96 flex items-center justify-between bg-gray-50 border border-gray-200 hover:bg-white hover:border-gray-300 text-gray-900 text-left rounded-xl px-4 py-3 transition-all group"
                   >
                      <div className="flex items-center gap-3">
                         {selectedVendor.id !== 'all' && (
                             <img src={MOCK_COMPANIES.find(c => c.id === selectedVendor.id)?.logo} alt="Logo" className="w-8 h-8 rounded-md object-cover" />
                         )}
                         <div>
                             <span className="block font-bold text-lg leading-tight">{selectedVendor.name}</span>
                             <span className="text-xs text-gray-500 font-medium">{selectedVendor.type}</span>
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
                               placeholder="Buscar vendor o especialidad..." 
                               className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                               value={searchQuery}
                               onChange={(e) => setSearchQuery(e.target.value)}
                               autoFocus
                            />
                         </div>
                         <div className="max-h-60 overflow-y-auto space-y-1">
                            <button 
                               onClick={() => {
                                  setSelectedVendor({ name: 'Todos los Vendors', type: 'Vista General', id: 'all' });
                                  setIsSearchOpen(false);
                                  setSearchQuery('');
                               }}
                               className="w-full text-left px-3 py-2 rounded-lg flex justify-between items-center hover:bg-gray-50"
                            >
                               <span className="font-bold text-sm text-primary">Ver Todos</span>
                            </button>
                            {searchSuggestions.length > 0 ? (
                                searchSuggestions.map(c => (
                                   <button 
                                      key={c.id}
                                      onClick={() => {
                                         setSelectedVendor({ name: c.name, type: c.specialties[0], id: c.id });
                                         setIsSearchOpen(false);
                                         setSearchQuery('');
                                      }}
                                      className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 hover:bg-gray-50 group"
                                   >
                                      <img src={c.logo} alt={c.name} className="w-8 h-8 rounded-md bg-gray-100 object-cover" />
                                      <div className="flex-1">
                                         <p className="font-bold text-sm text-gray-900">{c.name}</p>
                                         <p className="text-xs text-gray-500 truncate">{c.specialties.join(', ')}</p>
                                      </div>
                                   </button>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 text-sm py-4">No se encontraron vendors</p>
                            )}
                         </div>
                      </div>
                   )}
                </div>
             </div>
             
             <div className="flex gap-2">
                 <button className="px-4 py-3 bg-[#1313ec] text-white font-bold rounded-xl hover:opacity-90 shadow-lg shadow-blue-200">
                    Nuevo Proyecto
                 </button>
             </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 items-start">
             {/* List */}
             <div className="w-full lg:w-1/3 flex flex-col gap-4">
                <div className="flex gap-2 pb-2">
                   <button className="px-4 py-1.5 bg-[#1313ec] text-white rounded-lg text-sm font-medium">Todos</button>
                   <button className="px-4 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50">Favoritos</button>
                   <button className="px-4 py-1.5 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50">Contactados</button>
                </div>

                <div className="space-y-3">
                   {displayedVendors.length > 0 ? (
                       displayedVendors.map((company) => (
                          <div 
                             key={company.id} 
                             onClick={() => {
                                 setSelectedVendor({ name: company.name, type: company.specialties[0], id: company.id });
                                 // Optionally scroll to top on mobile
                             }}
                             className={`p-4 rounded-xl bg-white border cursor-pointer hover:shadow-md transition-all flex gap-4 ${detailVendor?.id === company.id ? 'ring-2 ring-[#1313ec]/20 border-[#1313ec]' : 'border-gray-200'}`}
                          >
                             <img src={company.logo} alt={company.name} className="w-12 h-12 rounded-lg bg-gray-100 object-cover" />
                             <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                   <h3 className="font-semibold text-gray-900 truncate">{company.name}</h3>
                                   <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Verificado</span>
                                </div>
                                <p className="text-xs text-gray-500 truncate mt-1">{company.specialties[0]}</p>
                                <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                                   <span className="material-symbols-outlined text-[14px]">location_on</span> {company.location}
                                </div>
                             </div>
                          </div>
                       ))
                   ) : (
                       <p className="text-center text-gray-500 py-8">No se encontraron vendors.</p>
                   )}
                </div>
             </div>

             {/* Detail Panel */}
             {detailVendor && (
                 <div className="w-full lg:w-2/3 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden sticky top-24">
                    <div className="h-32 bg-gradient-to-r from-blue-50 to-indigo-50 relative">
                       <div className="absolute top-4 right-4 flex gap-2">
                          <button className="p-2 bg-white/80 rounded-lg hover:bg-white text-gray-700"><span className="material-symbols-outlined text-sm">share</span></button>
                          <button className="p-2 bg-white/80 rounded-lg hover:bg-white text-red-500"><span className="material-symbols-outlined filled text-sm">favorite</span></button>
                       </div>
                       <div className="absolute -bottom-10 left-8">
                          <img src={detailVendor.logo} alt="Logo" className="w-20 h-20 rounded-xl border-4 border-white shadow-sm bg-white object-cover" />
                       </div>
                    </div>
                    
                    <div className="pt-12 px-8 pb-8">
                       <div className="flex justify-between items-start mb-6">
                          <div>
                             <h2 className="text-2xl font-bold text-gray-900">{detailVendor.name}</h2>
                             <p className="text-gray-500 text-lg">{detailVendor.slogan}</p>
                          </div>
                          <div className="flex gap-3">
                             <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[20px]">chat</span> Mensaje
                             </button>
                          </div>
                       </div>

                       <div className="border-b border-gray-100 mb-6">
                          <nav className="flex gap-8">
                             <button className="pb-3 border-b-2 border-[#1313ec] text-[#1313ec] font-semibold text-sm">Perfil</button>
                             <button className="pb-3 border-b-2 border-transparent text-gray-500 hover:text-gray-900 font-medium text-sm">Proyectos ({detailVendor.projects})</button>
                             <button className="pb-3 border-b-2 border-transparent text-gray-500 hover:text-gray-900 font-medium text-sm">Reseñas ({detailVendor.reviews})</button>
                          </nav>
                       </div>

                       <div className="space-y-6">
                          <div>
                             <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Sobre la empresa</h3>
                             <p className="text-sm text-gray-600 leading-relaxed">{detailVendor.description}</p>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-y border-gray-50">
                             <div>
                                <p className="text-xs text-gray-500 flex items-center gap-1 mb-1"><span className="material-symbols-outlined text-[16px]">group</span> Tamaño</p>
                                <p className="font-semibold text-sm">{detailVendor.teamSize}</p>
                             </div>
                             <div>
                                <p className="text-xs text-gray-500 flex items-center gap-1 mb-1"><span className="material-symbols-outlined text-[16px]">location_on</span> Ubicación</p>
                                <p className="font-semibold text-sm">{detailVendor.location}</p>
                             </div>
                             <div>
                                <p className="text-xs text-gray-500 flex items-center gap-1 mb-1"><span className="material-symbols-outlined text-[16px]">language</span> Web</p>
                                <a href={`https://${detailVendor.website}`} target="_blank" rel="noreferrer" className="font-semibold text-sm text-[#1313ec] hover:underline truncate block">{detailVendor.website}</a>
                             </div>
                             <div>
                                <p className="text-xs text-gray-500 flex items-center gap-1 mb-1"><span className="material-symbols-outlined text-[16px]">verified</span> Estado</p>
                                <p className="font-semibold text-sm">Verificado</p>
                             </div>
                          </div>

                          <div className="flex justify-end">
                             <button className="flex items-center gap-1 text-sm font-semibold text-[#1313ec] hover:underline">
                                Ver perfil completo <span className="material-symbols-outlined text-sm">arrow_forward</span>
                             </button>
                          </div>
                       </div>
                    </div>
                 </div>
             )}
          </div>
       </div>
    </ClientLayout>
  );
};

export default ClientVendors;