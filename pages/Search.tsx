import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Button from '../components/Button';
import FAQWidget from '../components/FAQWidget';
import Modal from '../components/Modal';
import { MOCK_COMPANIES } from '../constants';
import { Company } from '../types';
import { sendMessageToGemini } from '../services/geminiService';
import { vendorService } from '../services/vendorService';
import api from '../services/api';

const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialQuery = searchParams.get('q') || '';

  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // Chat State
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model', text: string }[]>(() => {
    const savedChat = sessionStorage.getItem('ai_dev_connect_chat_history');
    if (savedChat) {
      return JSON.parse(savedChat);
    }
    return [
      { role: 'model', text: `¡Hola! He encontrado algunas empresas que coinciden con "${initialQuery || 'tu búsqueda'}". ¿Quieres que filtre por especialidad o presupuesto?` }
    ];
  });
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Filter State
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [activeFilters, setActiveFilters] = useState<{ industries: string[], teamSize: string[] }>({
    industries: [],
    teamSize: []
  });

  const [isLoading, setIsLoading] = useState(true);

  // Saved vendors state
  const [savedVendorIds, setSavedVendorIds] = useState<Set<string>>(new Set());

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const vendorsPerPage = 10;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    sessionStorage.setItem('ai_dev_connect_chat_history', JSON.stringify(chatMessages));
  }, [chatMessages]);

  // Load Vendors from API
  useEffect(() => {
    const loadVendors = async () => {
      try {
        setIsLoading(true);
        const data = await vendorService.getAllVendors();

        // Initialize saved vendors from API data
        const savedIds = new Set<string>();
        data.forEach((v: any) => {
          if (v.isSaved) {
            savedIds.add(v.id);
          }
        });
        setSavedVendorIds(savedIds);

        // Map Backend Data to Frontend Company Interface
        const mappedCompanies: Company[] = data.map((v: any) => ({
          id: v.id,
          name: v.companyName || 'Agencia Sin Nombre',
          slogan: v.bio?.substring(0, 50) + '...' || 'Expertos en IA',
          description: v.bio || 'Sin descripción',
          rating: 4.8, // Mock
          reviews: 12, // Mock 
          logo: `https://ui-avatars.com/api/?name=${v.companyName}&background=random`,
          banner: 'https://picsum.photos/seed/ai/800/300', // Mock
          tags: v.skills || ['AI', 'Development'],
          specialties: v.skills || [],
          industries: ['Technology', 'SaaS'], // Mock
          projects: 5, // Mock
          teamSize: '11-50', // Mock
          founded: '2020', // Mock
          location: 'Remote', // Mock
          email: v.user?.email, // user is included in the findMany
          phone: '',
          website: '',
          portfolio: [],
          pricing: { type: 'Contact' }
        }));

        setCompanies(mappedCompanies);

      } catch (error) {
        console.error("Failed to load vendors", error);
        setCompanies([]); // Clear if error, don't show mocks if user wants strict DB View
      } finally {
        setIsLoading(false);
      }
    };
    loadVendors();
  }, []);

  // Filter Logic
  useEffect(() => {
    let result = companies;

    // Filter by Initial Query (Search Term)
    if (initialQuery) {
      const q = initialQuery.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.specialties.some(s => s.toLowerCase().includes(q)) ||
        c.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Filter by Active Filters
    if (activeFilters.industries.length > 0) {
      result = result.filter(c => c.industries.some(i => activeFilters.industries.includes(i)));
    }
    if (activeFilters.teamSize.length > 0) {
      result = result.filter(c => activeFilters.teamSize.includes(c.teamSize));
    }

    setFilteredCompanies(result);
    setCurrentPage(1); // Reset to page 1 when filters change
  }, [activeFilters, companies, initialQuery]);

  const handleCompanyClick = (company: Company) => {
    if (selectedCompany?.id === company.id) {
      setSelectedCompany(null);
    } else {
      setSelectedCompany(company);
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const msg = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: msg }]);
    setIsChatLoading(true);

    const response = await sendMessageToGemini(msg, `User is searching for vendors. Current query: ${initialQuery}`);
    setChatMessages(prev => [...prev, { role: 'model', text: response }]);
    setIsChatLoading(false);
  };

  const handleProposalRedirect = (companyId: string) => {
    navigate(`/company/${companyId}?openModal=true`);
  };

  const toggleFilter = (type: 'industries' | 'teamSize', value: string) => {
    setActiveFilters(prev => {
      const current = prev[type];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [type]: updated };
    });
  };

  // Save/unsave vendor functionality
  const handleToggleSaveVendor = async (vendorId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      const response = await api.post(`/vendors/${vendorId}/save`);

      if (response.data.saved) {
        setSavedVendorIds(prev => new Set([...prev, vendorId]));
      } else {
        setSavedVendorIds(prev => {
          const updated = new Set(prev);
          updated.delete(vendorId);
          return updated;
        });
      }
    } catch (error) {
      console.error('Error toggling vendor save:', error);
    }
  };

  // Pagination helpers
  const totalPages = Math.ceil(filteredCompanies.length / vendorsPerPage);
  const startIndex = (currentPage - 1) * vendorsPerPage;
  const paginatedCompanies = filteredCompanies.slice(startIndex, startIndex + vendorsPerPage);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Helper to simulate matches for the UI
  const getMatches = (company: Company, query: string) => {
    if (!query) return [];
    const q = query.toLowerCase();

    // 1. Try to find exact keywords in specialties/tags
    const features = [...company.specialties, ...company.tags];
    const directMatches = features.filter(f =>
      f.toLowerCase().includes(q) || q.includes(f.toLowerCase())
    );

    if (directMatches.length > 0) return directMatches.slice(0, 3);

    // 2. If query is present but no direct keyword match, return top specialties 
    return company.specialties.slice(0, 2);
  };

  // Extract all unique options for filters
  const allIndustries = Array.from(new Set(companies.flatMap(c => c.industries))) as string[];
  const allTeamSizes = Array.from(new Set(companies.map(c => c.teamSize))) as string[];

  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white relative">
      <Header />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar: Filters & Results */}
        <aside className={`w-full md:w-[400px] lg:w-[450px] flex-col border-r border-gray-200 bg-white z-10 ${isMobileChatOpen ? 'hidden md:flex' : 'flex'}`}>
          {/* Filters Header */}
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0">
            <h2 className="font-bold text-lg text-dark">Resultados</h2>
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-dark px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Filtros
              <span className="material-symbols-outlined text-lg">tune</span>
              {(activeFilters.industries.length + activeFilters.teamSize.length) > 0 && (
                <span className="bg-dark text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full ml-1">
                  {activeFilters.industries.length + activeFilters.teamSize.length}
                </span>
              )}
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <p className="text-sm text-gray-500 mb-2">Mostrando {filteredCompanies.length} empresas</p>

            {filteredCompanies.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                  <span className="material-symbols-outlined text-3xl">search_off</span>
                </div>
                <h3 className="font-bold text-gray-700">Sin resultados</h3>
                <p className="text-gray-500 text-sm mt-1">Intenta ajustar tus filtros.</p>
                <button
                  onClick={() => setActiveFilters({ industries: [], teamSize: [] })}
                  className="mt-4 text-primary text-sm font-semibold hover:underline"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              paginatedCompanies.map(company => {
                const matches = getMatches(company, initialQuery);
                return (
                  <div
                    key={company.id}
                    onClick={() => handleCompanyClick(company)}
                    className={`group p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md relative pb-12
                        ${selectedCompany?.id === company.id ? 'border-dark bg-gray-50' : 'border-gray-200 bg-white hover:border-gray-300'}
                      `}
                  >
                    <div className="flex gap-4">
                      <img src={company.logo} alt={company.name} className="w-16 h-16 rounded-lg object-cover border border-gray-100 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-dark truncate pr-8">{company.name}</h3>
                          <div className="absolute top-4 right-4 flex items-center gap-1 text-xs font-bold text-dark">
                            <span className="material-symbols-outlined text-sm filled text-black">star</span>
                            {company.rating}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-2 mt-1">{company.description}</p>

                        {initialQuery && matches.length > 0 && (
                          <div className="mt-3 flex flex-col gap-1">
                            {matches.map((match, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                                <span className="material-symbols-outlined text-sm filled text-emerald-600" style={{ fontSize: '18px' }}>check</span>
                                {match}
                              </div>
                            ))}
                          </div>
                        )}

                        {(!initialQuery || matches.length === 0) && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {company.tags.slice(0, 2).map(tag => (
                              <span key={tag} className="text-xs font-medium bg-gray-100 px-2 py-1 rounded-md text-gray-600">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleToggleSaveVendor(company.id, e)}
                      className={`absolute bottom-4 right-4 p-2 rounded-full hover:bg-gray-200 transition-colors ${savedVendorIds.has(company.id) ? 'text-primary' : 'text-gray-400 hover:text-primary'
                        }`}
                    >
                      <span className={`material-symbols-outlined text-xl ${savedVendorIds.has(company.id) ? 'filled' : ''}`}>favorite</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 flex justify-center items-center gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${currentPage === page ? 'bg-dark text-white' : 'hover:bg-gray-100 text-gray-600'
                    }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          )}
        </aside>

        {/* Chat FAB (Mobile Only) */}
        {!isMobileChatOpen && (
          <button
            onClick={() => setIsMobileChatOpen(true)}
            className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-floating flex items-center justify-center z-40 hover:bg-primary/90 transition-transform hover:scale-105 active:scale-95"
          >
            <span className="material-symbols-outlined text-3xl">smart_toy</span>
          </button>
        )}

        {/* Main Content: Chat & Overlay */}
        <main className={`flex-1 flex-col bg-gray-50 relative ${isMobileChatOpen ? 'flex' : 'hidden md:flex'}`}>
          {/* Mobile Chat Header (Back Button) */}
          <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-20">
            <button onClick={() => setIsMobileChatOpen(false)} className="p-2 -ml-2 text-gray-600 rounded-full hover:bg-gray-100">
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div>
              <h2 className="font-bold text-gray-900">Asistente IA</h2>
              <p className="text-xs text-primary font-medium">Online</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full h-full p-6 pt-20 md:pt-6">
            <div className="flex-1 overflow-y-auto space-y-6 pr-4 no-scrollbar pb-20 md:pb-0">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-3 max-w-[85%] sm:max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-gray-200' : 'bg-primary text-white'}`}>
                      <span className="material-symbols-outlined text-sm">{msg.role === 'user' ? 'person' : 'smart_toy'}</span>
                    </div>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                      ? 'bg-gray-100 text-dark rounded-tr-none'
                      : 'bg-white shadow-sm border border-gray-100 text-gray-700 rounded-tl-none'
                      }`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[80%]">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-sm">smart_toy</span>
                    </div>
                    <div className="bg-white shadow-sm border border-gray-100 p-4 rounded-2xl rounded-tl-none flex gap-1 items-center h-10">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="mt-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-2 sticky bottom-0 md:static">
              <input
                type="text"
                className="flex-1 bg-transparent px-4 py-3 outline-none text-dark placeholder:text-gray-400"
                placeholder="Escribe tu mensaje..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                disabled={isChatLoading}
              />
              <button
                onClick={handleSendChat}
                disabled={isChatLoading || !chatInput.trim()}
                className="p-3 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </div>
          </div>

          {selectedCompany && (
            <div className="absolute inset-4 z-20 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm" onClick={() => setSelectedCompany(null)}></div>
              <div className="bg-white w-full max-w-2xl h-fit max-h-[90%] rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200">
                <button
                  onClick={() => setSelectedCompany(null)}
                  className="absolute top-4 right-4 z-10 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-all text-gray-500 hover:text-dark"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
                <div className="p-8 pt-12 flex-1 overflow-y-auto">
                  <div className="flex flex-col gap-6 items-start mb-8">
                    <div className="flex gap-4 items-center">
                      <img src={selectedCompany.logo} alt={selectedCompany.name} className="w-20 h-20 rounded-xl border border-gray-100 object-cover" />
                      <div>
                        <h2 className="text-2xl font-bold text-dark leading-tight">{selectedCompany.name}</h2>
                        <p className="text-gray-500 text-sm mt-1">{selectedCompany.location}</p>
                        <div className="flex gap-1 mt-2">
                          {selectedCompany.tags.map(tag => (
                            <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 w-full">
                      <Button fullWidth onClick={() => handleProposalRedirect(selectedCompany.id)}>Enviar Propuesta</Button>
                      <Button variant="outline" fullWidth onClick={() => navigate(`/company/${selectedCompany.id}`)}>Ver Perfil</Button>
                      <button
                        onClick={(e) => handleToggleSaveVendor(selectedCompany.id, e)}
                        className={`p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex-shrink-0 ${savedVendorIds.has(selectedCompany.id) ? 'text-primary border-primary' : 'text-gray-400 hover:text-primary'
                          }`}
                      >
                        <span className={`material-symbols-outlined ${savedVendorIds.has(selectedCompany.id) ? 'filled' : ''}`}>favorite</span>
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="text-center">
                      <span className="block text-xl font-bold text-primary">{selectedCompany.rating}</span>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Valoración</span>
                    </div>
                    <div className="text-center border-l border-gray-200">
                      <span className="block text-xl font-bold text-dark">{selectedCompany.projects}+</span>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Proyectos</span>
                    </div>
                    <div className="text-center border-l border-gray-200">
                      <span className="block text-xl font-bold text-dark">{selectedCompany.teamSize}</span>
                      <span className="text-xs text-gray-500 uppercase tracking-wide">Equipo</span>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <section>
                      <h3 className="font-bold text-lg mb-2 text-dark">Sobre la empresa</h3>
                      <p className="text-gray-600 leading-relaxed text-sm">{selectedCompany.description}</p>
                    </section>
                    <section>
                      <h3 className="font-bold text-lg mb-2 text-dark">Especialidades</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedCompany.specialties.map(s => (
                          <span key={s} className="px-3 py-1 bg-white border border-gray-200 text-gray-700 rounded-full text-sm font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Company Details Modal (Mobile/Responsive) */}
      {selectedCompany && (
        <Modal
          isOpen={!!selectedCompany && window.innerWidth < 768}
          onClose={() => handleCompanyClick(selectedCompany)} // Toggle off or set null
          title={selectedCompany.name}
        >
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <img src={selectedCompany.logo} alt={selectedCompany.name} className="w-20 h-20 rounded-xl object-cover border border-gray-100" />
              <div>
                <h3 className="font-bold text-xl text-dark">{selectedCompany.name}</h3>
                <p className="text-gray-500 text-sm">{selectedCompany.industries.join(', ')}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-sm filled text-yellow-500">star</span>
                  <span className="font-bold text-dark">{selectedCompany.rating}</span>
                  <span className="text-gray-400 text-sm">({selectedCompany.reviews} reviews)</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-dark mb-2">Sobre nosotros</h4>
              <p className="text-gray-600 text-sm leading-relaxed">{selectedCompany.description}</p>
            </div>

            <div className="grid grid-cols-3 gap-4 border-y border-gray-100 py-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">98%</p>
                <p className="text-xs text-gray-500">Éxito</p>
              </div>
              <div className="text-center border-l border-gray-100">
                <p className="text-2xl font-bold text-dark">{selectedCompany.teamSize}</p>
                <p className="text-xs text-gray-500">Expertos</p>
              </div>
              <div className="text-center border-l border-gray-100">
                <p className="text-2xl font-bold text-dark">2h</p>
                <p className="text-xs text-gray-500">Resp.</p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-dark mb-2">Especialidades</h4>
              <div className="flex flex-wrap gap-2">
                {selectedCompany.specialties.map(s => (
                  <span key={s} className="px-3 py-1 bg-gray-50 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => handleProposalRedirect(selectedCompany.id)}
                className="flex-1 bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors"
              >
                Enviar Propuesta
              </button>
              <button
                onClick={() => navigate(`/company/${selectedCompany.id}`)}
                className="px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-700 font-bold"
              >
                Ver Perfil
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Filters Modal */}
      <Modal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} title="Filtrar Resultados">
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
          <div>
            <h3 className="font-bold text-lg mb-3">Industria</h3>
            <div className="grid grid-cols-2 gap-3">
              {allIndustries.map(industry => (
                <label key={industry} className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${activeFilters.industries.includes(industry) ? 'bg-dark border-dark' : 'border-gray-300 group-hover:border-dark'}`}>
                    {activeFilters.industries.includes(industry) && <span className="material-symbols-outlined text-white text-sm">check</span>}
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={activeFilters.industries.includes(industry)}
                    onChange={() => toggleFilter('industries', industry)}
                  />
                  <span className="text-gray-700">{industry}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h3 className="font-bold text-lg mb-3">Tamaño del Equipo</h3>
            <div className="space-y-3">
              {allTeamSizes.map(size => (
                <label key={size} className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${activeFilters.teamSize.includes(size) ? 'border-dark' : 'border-gray-300 group-hover:border-dark'}`}>
                    {activeFilters.teamSize.includes(size) && <div className="w-3 h-3 rounded-full bg-dark"></div>}
                  </div>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={activeFilters.teamSize.includes(size)}
                    onChange={() => toggleFilter('teamSize', size)}
                  />
                  <span className="text-gray-700">{size} empleados</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="pt-6 mt-6 border-t border-gray-100 flex justify-between items-center">
          <button
            onClick={() => setActiveFilters({ industries: [], teamSize: [] })}
            className="text-gray-500 hover:text-dark font-medium underline text-sm"
          >
            Borrar todo
          </button>
          <Button onClick={() => setIsFilterModalOpen(false)} className="px-8">
            Mostrar {filteredCompanies.length} resultados
          </Button>
        </div>
      </Modal>

      <FAQWidget />
    </div>
  );
};

export default Search;