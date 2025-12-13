import React, { useState, useRef, useEffect } from 'react';
import VendorLayout from '../../components/VendorLayout';
import Modal from '../../components/Modal';

// Types for Files
interface Folder {
    id: string;
    name: string;
    filesCount: number;
    updated: string;
}

interface FileItem {
    id: string;
    name: string;
    type: string;
    size: string;
    date: string;
    uploader: string;
}

const VendorProjects: React.FC = () => {
  // Navigation within project details
  const [activeTab, setActiveTab] = useState<'overview' | 'deliverables' | 'files'>('overview');
  const [selectedProject, setSelectedProject] = useState<any>(null);

  // File Management State (Homologous to Client)
  const [fileViewMode, setFileViewMode] = useState<'documents' | 'repository'>('documents');
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{type: 'folder'|'file', id: string, name: string} | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRepoConnected, setIsRepoConnected] = useState(true); // Toggle to simulate connection state

  // Search & Filter State for Projects List
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedContext, setSelectedContext] = useState({
      id: 'all',
      name: 'Todos los Proyectos',
      client: 'Vista General'
  });
  const searchRef = useRef<HTMLDivElement>(null);

  // Release Funds Modal State
  const [releaseModalOpen, setReleaseModalOpen] = useState(false);
  const [milestoneForRelease, setMilestoneForRelease] = useState<{name: string, amount: string} | null>(null);
  const [releaseNote, setReleaseNote] = useState('');

  const projects = [
      { 
        id: '1', 
        name: 'Motor de Recomendación', 
        client: 'Cliente Corp', 
        status: 'En Progreso', 
        deadline: '30 Oct 2024',
        progress: 65,
        nextMilestone: 'Entrenamiento Modelo',
        budget: '$45,000',
        tags: ['Python', 'ML']
      },
      { 
        id: '2', 
        name: 'Dashboard Analítico', 
        client: 'Logistics Pro', 
        status: 'En Espera', 
        deadline: '15 Nov 2024',
        progress: 10,
        nextMilestone: 'Definición de KPIs',
        budget: '$12,000',
        tags: ['React', 'D3.js']
      },
      { 
        id: '3', 
        name: 'Chatbot Bancario', 
        client: 'FinBank Global', 
        status: 'Finalizado', 
        deadline: '10 Sep 2024',
        progress: 100,
        nextMilestone: '-',
        budget: '$85,000',
        tags: ['NLP', 'Security']
      },
      { 
        id: '4', 
        name: 'App de Inventario', 
        client: 'Retail X', 
        status: 'En Progreso', 
        deadline: '20 Dic 2024',
        progress: 35,
        nextMilestone: 'Backend API',
        budget: '$22,500',
        tags: ['Mobile', 'Cloud']
      },
  ];

  // Mock Folders/Files
  const folders: Folder[] = [
    { id: 'f1', name: 'Entregables Finales', filesCount: 3, updated: '2 días' },
    { id: 'f2', name: 'Documentación Técnica', filesCount: 12, updated: '5 horas' },
    { id: 'f3', name: 'Recursos del Cliente', filesCount: 5, updated: '1 semana' },
  ];

  const files: FileItem[] = [
    { id: 'fi1', name: 'Arquitectura_v2.pdf', type: 'pdf', size: '2.4 MB', date: '15 Ago, 2024', uploader: 'QuantumLeap' },
    { id: 'fi2', name: 'Dataset_Sample.csv', type: 'csv', size: '15 MB', date: '14 Ago, 2024', uploader: 'Cliente Corp' },
  ];

  // Filter Logic
  const filteredProjects = projects.filter(p => {
      // 1. Context Selection
      if (selectedContext.id !== 'all' && p.id !== selectedContext.id) return false;

      // 2. Status Filter
      const matchesStatus = statusFilter === 'Todos' || p.status === statusFilter;
      
      // 3. Search Query (Global search if 'all' selected, otherwise redundant but safe)
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.client.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesStatus && matchesSearch;
  });

  // Dropdown suggestions
  const dropdownSuggestions = searchQuery.trim() 
      ? projects.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.client.toLowerCase().includes(searchQuery.toLowerCase()))
      : projects;

  // File Handlers
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => { setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); console.log('File Dropped'); };
  
  const getFileIcon = (type: string) => {
    if (type === 'pdf') return 'picture_as_pdf';
    if (type === 'csv' || type === 'xlsx') return 'table_chart';
    return 'insert_drive_file';
  };

  const handleSync = () => {
      setIsSyncing(true);
      setTimeout(() => setIsSyncing(false), 2000);
  };

  const openReleaseModal = (milestoneName: string, amount: string) => {
      setMilestoneForRelease({ name: milestoneName, amount });
      setReleaseModalOpen(true);
  };

  const handleSendReleaseRequest = () => {
      // Logic to send request
      console.log('Requesting release for:', milestoneForRelease, 'Note:', releaseNote);
      setReleaseModalOpen(false);
      setReleaseNote('');
      // Could add a toast notification here
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeMenuId && !(event.target as Element).closest('.folder-menu-trigger')) {
          setActiveMenuId(null);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeMenuId]);


  // If no project selected, show list (Enhanced)
  if (!selectedProject) {
      return (
        <VendorLayout>
           <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                 <div>
                    <h1 className="text-3xl font-black text-gray-900">Mis Proyectos</h1>
                    <p className="text-gray-500 mt-1">Gestión centralizada de desarrollos, entregas y recursos.</p>
                 </div>
                 <div className="flex gap-2">
                    <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50">
                        Exportar Lista
                    </button>
                    {/* Removed "New Project" button as per requirement */}
                 </div>
              </div>

              {/* Filters Toolbar - Intelligent Search */}
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center relative z-20">
                  <div className="flex-1 w-full md:w-auto relative" ref={searchRef}>
                      <div className="relative">
                        <button 
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            className="w-full md:w-96 flex items-center justify-between bg-gray-50 border border-gray-200 hover:bg-white hover:border-gray-300 text-gray-900 text-left rounded-xl px-4 py-2.5 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                {selectedContext.id !== 'all' ? (
                                    <span className="material-symbols-outlined text-primary">rocket_launch</span>
                                ) : (
                                    <span className="material-symbols-outlined text-gray-400">dashboard</span>
                                )}
                                <div>
                                    <span className="block font-bold text-sm leading-tight">{selectedContext.name}</span>
                                    <span className="text-xs text-gray-500 font-medium">{selectedContext.client}</span>
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
                                            setSelectedContext({ name: 'Todos los Proyectos', client: 'Vista General', id: 'all' });
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
                                                    setSelectedContext({ name: p.name, client: p.client, id: p.id });
                                                    setIsSearchOpen(false);
                                                    setSearchQuery('');
                                                }}
                                                className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 hover:bg-gray-50 group"
                                            >
                                                <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                                                    {p.name.charAt(0)}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-sm text-gray-900">{p.name}</p>
                                                    <p className="text-xs text-gray-500">{p.client}</p>
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
                  
                  <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
                      {['Todos', 'En Progreso', 'En Espera', 'Finalizado'].map(status => (
                          <button 
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${statusFilter === status ? 'bg-dark text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                          >
                              {status}
                          </button>
                      ))}
                  </div>

                  <div className="flex items-center border-l border-gray-200 pl-4 gap-1">
                      <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-gray-200 text-dark' : 'text-gray-400 hover:text-gray-600'}`}>
                          <span className="material-symbols-outlined">view_list</span>
                      </button>
                      <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-gray-200 text-dark' : 'text-gray-400 hover:text-gray-600'}`}>
                          <span className="material-symbols-outlined">grid_view</span>
                      </button>
                  </div>
              </div>

              {/* Projects List/Grid */}
              {viewMode === 'list' ? (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                      <table className="w-full text-left">
                          <thead className="bg-gray-50 border-b border-gray-200">
                              <tr>
                                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Proyecto</th>
                                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Cliente</th>
                                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Estado</th>
                                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Deadline</th>
                                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Progreso</th>
                                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Acción</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                              {filteredProjects.map(p => (
                                  <tr key={p.id} onClick={() => setSelectedProject(p)} className="hover:bg-gray-50 cursor-pointer transition-colors group">
                                      <td className="px-6 py-4">
                                          <p className="font-bold text-gray-900">{p.name}</p>
                                          <div className="flex gap-1 mt-1">{p.tags.map(t => <span key={t} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{t}</span>)}</div>
                                      </td>
                                      <td className="px-6 py-4 text-sm text-gray-600">{p.client}</td>
                                      <td className="px-6 py-4">
                                          <span className={`px-2 py-1 rounded text-xs font-bold ${p.status === 'En Progreso' ? 'bg-green-100 text-green-700' : p.status === 'En Espera' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'}`}>
                                              {p.status}
                                          </span>
                                      </td>
                                      <td className="px-6 py-4 text-sm font-medium text-gray-700">{p.deadline}</td>
                                      <td className="px-6 py-4">
                                          <div className="flex items-center gap-2">
                                              <div className="w-20 bg-gray-100 rounded-full h-1.5">
                                                  <div className="bg-primary h-1.5 rounded-full" style={{width: `${p.progress}%`}}></div>
                                              </div>
                                              <span className="text-xs font-bold text-gray-600">{p.progress}%</span>
                                          </div>
                                      </td>
                                      <td className="px-6 py-4 text-right">
                                          <button className="text-gray-400 hover:text-primary group-hover:bg-white p-2 rounded-full transition-colors"><span className="material-symbols-outlined">arrow_forward</span></button>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {filteredProjects.map(p => (
                         <div key={p.id} onClick={() => setSelectedProject(p)} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-xl font-bold">
                                        {p.name.charAt(0)}
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${p.status === 'En Progreso' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{p.status}</span>
                                </div>
                                <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-primary transition-colors">{p.name}</h3>
                                <p className="text-sm text-gray-500 mb-4">{p.client}</p>
                                
                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-xs font-bold text-gray-500">
                                        <span>Progreso</span>
                                        <span>{p.progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2">
                                        <div className="bg-primary h-2 rounded-full" style={{width: `${p.progress}%`}}></div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-sm text-gray-500">
                                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">event</span> {p.deadline}</span>
                                <span className="font-bold text-gray-900">{p.budget}</span>
                            </div>
                         </div>
                     ))}
                  </div>
              )}
           </div>
        </VendorLayout>
      );
  }

  // Project Detail View
  return (
    <VendorLayout>
        <div className="space-y-6">
            {/* Header / Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <button onClick={() => setSelectedProject(null)} className="hover:text-dark">Proyectos</button>
                <span className="material-symbols-outlined text-sm">chevron_right</span>
                <span className="font-bold text-gray-900">{selectedProject.name}</span>
            </div>

            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-black text-gray-900">{selectedProject.name}</h1>
                    <p className="text-gray-500">Cliente: <span className="font-semibold text-gray-700">{selectedProject.client}</span></p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50">Contactar Cliente</button>
                    <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90">Nueva Entrega</button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex gap-6">
                    <button onClick={() => setActiveTab('overview')} className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
                        Seguimiento
                    </button>
                    <button onClick={() => setActiveTab('deliverables')} className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'deliverables' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
                        Hitos y Entregables
                    </button>
                    <button onClick={() => setActiveTab('files')} className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'files' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
                        Archivos
                    </button>
                </nav>
            </div>

            {/* Content Area */}
            <div className="py-4">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Roadmap / Timeline */}
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <h3 className="font-bold text-gray-900 mb-6">Cronograma</h3>
                                <div className="space-y-6 relative pl-4 border-l-2 border-gray-100 ml-2">
                                    <div className="relative">
                                        <div className="absolute -left-[23px] top-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                        <h4 className="text-sm font-bold text-gray-900">Kickoff y Diseño</h4>
                                        <p className="text-xs text-gray-500 mb-1">15 Sep - Completado</p>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute -left-[23px] top-0 w-4 h-4 bg-primary rounded-full border-2 border-white animate-pulse"></div>
                                        <h4 className="text-sm font-bold text-primary">Desarrollo MVP</h4>
                                        <p className="text-xs text-gray-500 mb-2">En curso - Fecha límite: {selectedProject.deadline}</p>
                                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm text-gray-600">
                                            Actualmente trabajando en la integración de la API de recomendaciones.
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute -left-[23px] top-0 w-4 h-4 bg-gray-300 rounded-full border-2 border-white"></div>
                                        <h4 className="text-sm font-bold text-gray-400">QA y Testing</h4>
                                        <p className="text-xs text-gray-500">Pendiente</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <h3 className="font-bold text-gray-900 mb-4">Estado de Pagos</h3>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-500">Total Proyecto</span>
                                    <span className="font-bold text-gray-900">{selectedProject.budget}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                                    <div className="bg-green-500 h-2 rounded-full" style={{width: '40%'}}></div>
                                </div>
                                <div className="flex gap-2">
                                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded font-bold">40% Cobrado</span>
                                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded font-bold">20% Escrow</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'deliverables' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-gray-900">Entregables Requeridos</h3>
                            <button className="text-sm font-bold text-primary hover:underline">+ Añadir Entregable Extra</button>
                        </div>
                        
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex justify-between items-center">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                    <span className="font-bold text-sm text-gray-700 uppercase">Hito 2: Desarrollo MVP</span>
                                    <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded">Fondos en Escrow: $5,000</span>
                                </div>
                                {/* NEW TRIGGER BUTTON FOR FUNDS RELEASE */}
                                <button 
                                    onClick={() => openReleaseModal('Hito 2: Desarrollo MVP', '$5,000')}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                                >
                                    <span className="material-symbols-outlined text-sm">payments</span>
                                    Solicitar Liberación
                                </button>
                            </div>
                            <div className="divide-y divide-gray-100">
                                <div className="p-4 px-6 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-sm">check</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">Arquitectura Backend</p>
                                            <p className="text-xs text-gray-500">Subido el 10 Oct</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-green-600">Aprobado</span>
                                </div>
                                <div className="p-4 px-6 flex justify-between items-center bg-amber-50/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-400 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-sm">upload</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">API Endpoints Documentación</p>
                                            <p className="text-xs text-amber-600">Pendiente de subida</p>
                                        </div>
                                    </div>
                                    <button className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90">
                                        Subir Archivo
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* FILE MANAGER / GITHUB SYNC SECTION */}
                {activeTab === 'files' && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        {/* Sub-navigation for Files */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-gray-100 p-1 rounded-xl flex items-center">
                                <button 
                                    onClick={() => setFileViewMode('documents')}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${fileViewMode === 'documents' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <span className="material-symbols-outlined text-lg">folder</span> Documentos
                                </button>
                                <button 
                                    onClick={() => setFileViewMode('repository')}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${fileViewMode === 'repository' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" className={`w-4 h-4 ${fileViewMode === 'repository' ? 'opacity-100' : 'opacity-50'}`} alt="GitHub" />
                                    GitHub Sync
                                </button>
                            </div>
                        </div>

                        {/* GITHUB SYNC VIEW (VENDOR) */}
                        {fileViewMode === 'repository' && (
                            <div className="space-y-6">
                                {!isRepoConnected ? (
                                    <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <span className="material-symbols-outlined text-4xl text-gray-400">link_off</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">Conectar Repositorio</h3>
                                        <p className="text-gray-500 max-w-md mx-auto mb-8">Sincroniza tu repositorio de GitHub para dar visibilidad automática al cliente sobre el progreso del código.</p>
                                        <button 
                                            onClick={() => setIsRepoConnected(true)}
                                            className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center gap-2 mx-auto"
                                        >
                                            <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark-Light-32px.png" className="w-5 h-5" alt="GitHub" />
                                            Conectar con GitHub
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {/* Repo Control Panel */}
                                        <div className="bg-gray-900 text-white rounded-2xl p-6 shadow-lg flex flex-col md:flex-row justify-between items-center gap-6">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
                                                    <span className="text-green-400 text-xs font-bold uppercase tracking-wider">Conectado</span>
                                                </div>
                                                <h3 className="text-xl font-mono font-bold flex items-center gap-2">
                                                    quantum-leap/recommendation-engine
                                                    <span className="material-symbols-outlined text-gray-500 text-sm">lock</span>
                                                </h3>
                                                <p className="text-gray-400 text-sm mt-1">Sincronización automática activa (cada 1h)</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button 
                                                    onClick={() => setIsRepoConnected(false)}
                                                    className="px-4 py-2 border border-gray-700 text-gray-300 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors"
                                                >
                                                    Desconectar
                                                </button>
                                                <button 
                                                    onClick={handleSync}
                                                    disabled={isSyncing}
                                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-500 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                                >
                                                    {isSyncing ? (
                                                        <>
                                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                                            Sincronizando...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="material-symbols-outlined text-lg">sync</span>
                                                            Sincronizar Ahora
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Visibility Preview */}
                                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                                                <h4 className="font-bold text-gray-700 text-sm flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-gray-400">visibility</span>
                                                    Vista Previa del Cliente
                                                </h4>
                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">Visible</span>
                                            </div>
                                            <div className="p-6 bg-white opacity-70 pointer-events-none grayscale-[0.5]">
                                                {/* Simulated Commit History Preview */}
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                                                        <span>Últimos Commits</span>
                                                        <span>Hace 2 horas</span>
                                                    </div>
                                                    {[1, 2, 3].map(i => (
                                                        <div key={i} className="flex gap-3 items-center p-3 border border-gray-100 rounded-lg">
                                                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                            <div className="h-2 bg-gray-200 rounded w-64"></div>
                                                            <div className="flex-1"></div>
                                                            <div className="h-2 bg-gray-100 rounded w-12"></div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* DOCUMENTS VIEW (EXISTING LOGIC) */}
                        {fileViewMode === 'documents' && (
                            <>
                                {/* Internal Breadcrumbs for Files */}
                                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => setCurrentFolder(null)} 
                                            className={`text-sm font-bold hover:underline flex items-center gap-1 ${!currentFolder ? 'text-gray-900' : 'text-gray-500'}`}
                                        >
                                            <span className="material-symbols-outlined text-lg">folder_open</span> Root
                                        </button>
                                        {currentFolder && (
                                            <>
                                                <span className="material-symbols-outlined text-gray-300 text-sm">chevron_right</span>
                                                <span className="text-sm font-bold text-gray-900">{currentFolder.name}</span>
                                            </>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        {!currentFolder && (
                                            <button className="flex items-center gap-1 text-xs font-bold text-primary hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-colors">
                                                <span className="material-symbols-outlined text-base">create_new_folder</span> Nueva Carpeta
                                            </button>
                                        )}
                                        <button className="flex items-center gap-1 text-xs font-bold text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors">
                                            <span className="material-symbols-outlined text-base">upload_file</span> Subir
                                        </button>
                                    </div>
                                </div>

                                {/* Drag & Drop Area */}
                                <div 
                                    onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                                    className={`w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:bg-gray-50'}`}
                                >
                                    <span className="material-symbols-outlined text-3xl text-gray-400">cloud_upload</span>
                                    <p className="text-sm text-gray-600 font-medium">Arrastra archivos aquí o haz clic para explorar</p>
                                </div>

                                {/* Folders View */}
                                {!currentFolder && (
                                    <>
                                        <h3 className="text-xs font-bold text-gray-500 uppercase mt-4 mb-2">Carpetas</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {folders.map((folder) => (
                                                <div 
                                                    key={folder.id} 
                                                    onDoubleClick={() => setCurrentFolder(folder)}
                                                    className="p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-primary/50 transition-all cursor-pointer group relative select-none"
                                                >
                                                    <div className="flex justify-between items-start mb-3">
                                                        <span className="material-symbols-outlined text-4xl text-amber-300">folder</span>
                                                        <div className="relative">
                                                            <button 
                                                                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 folder-menu-trigger" 
                                                                onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === folder.id ? null : folder.id); }}
                                                            >
                                                                <span className="material-symbols-outlined text-lg">more_vert</span>
                                                            </button>
                                                            {activeMenuId === folder.id && (
                                                                <div className="absolute right-0 top-8 bg-white shadow-card border border-gray-100 rounded-lg p-1 z-10 w-32 animate-in fade-in zoom-in-95 duration-100">
                                                                    <button className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-gray-50 rounded flex items-center gap-2 text-gray-700">
                                                                        <span className="material-symbols-outlined text-sm">edit</span> Renombrar
                                                                    </button>
                                                                    <button 
                                                                        className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-red-50 text-red-600 rounded flex items-center gap-2"
                                                                        onClick={(e) => { e.stopPropagation(); setItemToDelete({type: 'folder', id: folder.id, name: folder.name}); setActiveMenuId(null); }}
                                                                    >
                                                                        <span className="material-symbols-outlined text-sm">delete</span> Borrar
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <h3 className="font-bold text-gray-900 truncate text-sm">{folder.name}</h3>
                                                    <p className="text-xs text-gray-500 mt-1">{folder.filesCount} archivos</p>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}

                                {/* Recent Files View */}
                                <h3 className="text-xs font-bold text-gray-500 uppercase mt-4 mb-2">{currentFolder ? `Archivos en ${currentFolder.name}` : 'Archivos Recientes'}</h3>
                                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Nombre</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Tipo</th>
                                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {files.map((file) => (
                                                <tr key={file.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <span className="material-symbols-outlined text-gray-400">{getFileIcon(file.type)}</span>
                                                            <div>
                                                                <p className="font-medium text-sm text-gray-900">{file.name}</p>
                                                                <p className="text-[10px] text-gray-400">Subido por {file.uploader} • {file.date}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3 text-xs text-gray-500 uppercase">{file.type}</td>
                                                    <td className="px-6 py-3 text-right">
                                                        <div className="flex justify-end gap-1">
                                                            <button className="p-1.5 text-gray-400 hover:text-primary rounded hover:bg-gray-100" title="Descargar"><span className="material-symbols-outlined text-lg">download</span></button>
                                                            <button 
                                                                className="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50" 
                                                                title="Eliminar"
                                                                onClick={() => setItemToDelete({type: 'file', id: file.id, name: file.name})}
                                                            >
                                                                <span className="material-symbols-outlined text-lg">delete</span>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>

        {/* Delete Modal */}
        <Modal isOpen={!!itemToDelete} onClose={() => setItemToDelete(null)} title="Confirmar Eliminación">
            <div className="space-y-4">
                <p className="text-gray-600">
                    ¿Estás seguro que deseas eliminar <span className="font-bold text-gray-900">"{itemToDelete?.name}"</span>?
                    {itemToDelete?.type === 'folder' && ' Esta acción eliminará todo su contenido.'}
                </p>
                <div className="flex justify-end gap-3 pt-2">
                    <button onClick={() => setItemToDelete(null)} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg transition-colors">Cancelar</button>
                    <button onClick={() => setItemToDelete(null)} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors">Eliminar</button>
                </div>
            </div>
        </Modal>

        {/* Fund Release Modal */}
        <Modal isOpen={releaseModalOpen} onClose={() => setReleaseModalOpen(false)} title="Solicitar Liberación de Fondos">
            <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex gap-4 items-center">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-green-600 shadow-sm border border-green-100">
                        <span className="material-symbols-outlined text-2xl">payments</span>
                    </div>
                    <div>
                        <p className="text-sm text-green-800 font-bold uppercase">Monto a Liberar (Escrow)</p>
                        <p className="text-3xl font-black text-green-700">{milestoneForRelease?.amount}</p>
                        <p className="text-xs text-green-600">{milestoneForRelease?.name}</p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nota para el cliente</label>
                    <textarea 
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-gray-400 h-32 resize-none"
                        placeholder="Ej: Hola, hemos completado todos los entregables acordados para este hito. Adjunto los reportes finales..."
                        value={releaseNote}
                        onChange={(e) => setReleaseNote(e.target.value)}
                    ></textarea>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Evidencia Entregada</label>
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <div className="p-3 bg-gray-50 flex items-center gap-2 border-b border-gray-200">
                            <span className="material-symbols-outlined text-gray-400 text-sm">folder</span>
                            <span className="text-xs font-bold text-gray-500 uppercase">Seleccionar archivos vinculados</span>
                        </div>
                        <div className="p-2 space-y-1 max-h-40 overflow-y-auto">
                            <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                                <input type="checkbox" defaultChecked className="rounded text-green-600 focus:ring-green-500" />
                                <span className="material-symbols-outlined text-gray-400">description</span>
                                <span className="text-sm text-gray-700 truncate">Arquitectura_Backend_vFINAL.pdf</span>
                            </label>
                            <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                                <input type="checkbox" defaultChecked className="rounded text-green-600 focus:ring-green-500" />
                                <span className="material-symbols-outlined text-gray-400">code</span>
                                <span className="text-sm text-gray-700 truncate">Repo Link: api-core-v1</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="pt-2 flex gap-3">
                    <button onClick={() => setReleaseModalOpen(false)} className="flex-1 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50">Cancelar</button>
                    <button onClick={handleSendReleaseRequest} className="flex-1 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-100 flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined">send</span> Enviar Solicitud
                    </button>
                </div>
            </div>
        </Modal>
    </VendorLayout>
  );
};

export default VendorProjects;