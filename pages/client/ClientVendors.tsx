import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ClientLayout from '../../components/ClientLayout';
import api from '../../services/api';

const ClientVendors: React.FC = () => {
   const navigate = useNavigate();
   // Data State
   const [vendors, setVendors] = useState<any[]>([]);
   const [loading, setLoading] = useState(true);
   const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'contacted'>('all');

   // Search State
   const [activeVendorId, setActiveVendorId] = useState<string | null>(null);

   // Search State
   const [isSearchOpen, setIsSearchOpen] = useState(false);
   const [searchQuery, setSearchQuery] = useState('');
   const searchRef = useRef<HTMLDivElement>(null);

   // Fetch vendors from API
   useEffect(() => {
      const fetchVendors = async () => {
         try {
            setLoading(true);
            const res = await api.get('/vendors/my-vendors');

            // Map API response to UI structure
            const mappedVendors = res.data.map((v: any) => ({
               id: v.id,
               name: v.companyName || 'Vendor Sin Nombre',
               slogan: v.bio || 'Soluciones tecnológicas avanzadas',
               description: v.bio || 'Este vendor ofrece servicios especializados en desarrollo de software e inteligencia artificial.',
               logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(v.companyName || 'Vendor')}&background=random`,
               specialties: v.skills || [],
               location: 'Remoto', // Default as not in schema
               website: 'siteweb.com', // Default
               teamSize: '10-50', // Default
               projects: v.hasProject ? 1 : 0,
               reviews: v.reviews?.length || 0,
               rating: 4.8, // Mock
               isSaved: v.isSaved,
               hasProject: v.hasProject,
               email: v.user?.email
            }));

            setVendors(mappedVendors);
            // Default select first one
            if (mappedVendors.length > 0) setActiveVendorId(mappedVendors[0].id);

         } catch (error) {
            console.error('Error fetching vendors:', error);
         } finally {
            setLoading(false);
         }
      };
      fetchVendors();
   }, []);

   // Filter Logic for Sidebar List
   const getDisplayedVendors = () => {
      let filtered = vendors;

      // Filter by tab
      if (activeTab === 'favorites') {
         filtered = filtered.filter(v => v.isSaved);
      } else if (activeTab === 'contacted') {
         filtered = filtered.filter(v => v.hasProject);
      }

      // Filter by search query
      if (searchQuery.trim()) {
         filtered = filtered.filter(v =>
            v.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.specialties?.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()))
         );
      }

      return filtered;
   };

   const displayedVendors = getDisplayedVendors();

   // Dropdown suggestions
   const searchSuggestions = searchQuery.trim()
      ? vendors.filter(v =>
         v.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         v.specialties?.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      : vendors;

   // Detail view logic
   const detailVendor = activeVendorId
      ? vendors.find(v => v.id === activeVendorId) || displayedVendors[0]
      : displayedVendors[0];

   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
            setIsSearchOpen(false);
         }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
   }, []);

   const handleToggleSaveVendor = async (vendorId: string, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();

      try {
         const response = await api.post(`/vendors/${vendorId}/save`);

         // Update local state optimistically
         setVendors(prev => prev.map(v => {
            if (v.id === vendorId) {
               return { ...v, isSaved: response.data.saved };
            }
            return v;
         }));

      } catch (error) {
         console.error('Error toggling vendor save:', error);
      }
   };

   return (
      <ClientLayout>
         <div className="space-y-6">
            <div className="flex justify-between items-center">
               <div>
                  <h1 className="text-3xl font-black text-gray-900">Mis Vendors</h1>
                  <p className="text-gray-500 mt-1">Gestiona y descubre tus socios tecnológicos de IA</p>
               </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 items-start">
               {/* List */}
               <div className="w-full lg:w-1/3 flex flex-col gap-4">
                  {/* Filter Buttons */}
                  <div className="flex gap-2">
                     <button
                        onClick={() => setActiveTab('all')}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium ${activeTab === 'all' ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                           }`}
                     >
                        Todos
                     </button>
                     <button
                        onClick={() => setActiveTab('favorites')}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium ${activeTab === 'favorites' ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                           }`}
                     >
                        Favoritos
                     </button>
                     <button
                        onClick={() => setActiveTab('contacted')}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium ${activeTab === 'contacted' ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                           }`}
                     >
                        Contactados
                     </button>
                  </div>

                  {/* Compact Search Bar */}
                  <div className="w-full relative" ref={searchRef}>
                     <div
                        className="flex items-center gap-2 w-full bg-white border border-gray-200 rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all"
                        onClick={() => setIsSearchOpen(true)}
                     >
                        <span className="material-symbols-outlined text-gray-400 text-[20px]">search</span>
                        <input
                           type="text"
                           placeholder="Buscar vendor o especialidad..."
                           className="flex-1 bg-transparent outline-none text-sm text-gray-900 placeholder:text-gray-400"
                           value={searchQuery}
                           onChange={(e) => {
                              setSearchQuery(e.target.value);
                              setIsSearchOpen(true);
                           }}
                           onFocus={() => setIsSearchOpen(true)}
                        />
                        {searchQuery && (
                           <button onClick={(e) => { e.stopPropagation(); setSearchQuery(''); }} className="text-gray-400 hover:text-gray-600">
                              <span className="material-symbols-outlined text-[18px]">close</span>
                           </button>
                        )}
                     </div>

                     {isSearchOpen && (
                        <div className="absolute top-full left-0 w-full bg-white rounded-xl shadow-floating border border-gray-100 mt-2 p-2 animate-in fade-in zoom-in-95 duration-200 max-h-80 overflow-y-auto z-50">
                           {searchSuggestions.length > 0 ? (
                              searchSuggestions.map(c => (
                                 <button
                                    key={c.id}
                                    onClick={() => {
                                       setSearchQuery(c.name);
                                       setActiveVendorId(c.id);
                                       setIsSearchOpen(false);
                                    }}
                                    className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 hover:bg-gray-50 group transition-colors"
                                 >
                                    <img src={c.logo} alt={c.name} className="w-8 h-8 rounded-md bg-gray-100 object-cover" />
                                    <div className="flex-1">
                                       <p className="font-bold text-sm text-gray-900">{c.name}</p>
                                       <p className="text-xs text-gray-500 truncate">{c.specialties?.join(', ')}</p>
                                    </div>
                                 </button>
                              ))
                           ) : (
                              <p className="text-center text-gray-500 text-sm py-4">No se encontraron vendors</p>
                           )}
                        </div>
                     )}
                  </div>

                  <div className="space-y-3">
                     {displayedVendors.length > 0 ? (
                        displayedVendors.map((company) => (
                           <div
                              key={company.id}
                              onClick={() => {
                                 setActiveVendorId(company.id);
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
                           <button onClick={(e) => handleToggleSaveVendor(detailVendor.id, e)} className={`p-2 bg-white/80 rounded-lg hover:bg-white transition-colors ${detailVendor.isSaved ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}><span className={`material-symbols-outlined text-sm ${detailVendor.isSaved ? 'filled' : ''}`}>favorite</span></button>
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
                              <button
                                 onClick={() => navigate(`/company/${detailVendor.id}`)}
                                 className="flex items-center gap-1 text-sm font-semibold text-[#1313ec] hover:underline"
                              >
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