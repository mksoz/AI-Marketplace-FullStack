import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ClientLayout from '../../components/ClientLayout';
import api from '../../services/api';

const ClientProjectTracking: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const searchRef = useRef<HTMLDivElement>(null);

    // State
    const [projects, setProjects] = useState<any[]>([]);
    const [selectedProject, setSelectedProject] = useState<any>(null);
    const [projectDetails, setProjectDetails] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'overview' | 'deliverables' | 'files'>('overview');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        if (tab && ['overview', 'deliverables', 'files'].includes(tab)) {
            setActiveTab(tab as any);
        }
    }, [location.search]);

    // File State
    const [currentFolder, setCurrentFolder] = useState<any>(null);
    const [repoView, setRepoView] = useState(false);

    // Fetch Projects List
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await api.get('/projects/my-projects');
                setProjects(res.data);
                if (res.data.length > 0 && !selectedProject) {
                    setSelectedProject(res.data[0]);
                }
            } catch (error) {
                console.error("Error fetching projects", error);
            }
        };
        fetchProjects();
    }, []);

    // Fetch Project Tracking Details
    useEffect(() => {
        if (!selectedProject) return;
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/projects/${selectedProject.id}/tracking`);
                setProjectDetails(res.data);
            } catch (error) {
                console.error("Error fetching tracking details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [selectedProject]);

    const filteredProjects = projects.filter(p =>
        p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.vendor?.companyName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Helper to calculate progress
    const getProgress = () => {
        if (!projectDetails?.milestones) return 0;
        const total = projectDetails.milestones.length;
        const completed = projectDetails.milestones.filter((m: any) => m.status === 'COMPLETED' || m.status === 'PAID').length;
        return total > 0 ? Math.round((completed / total) * 100) : 0;
    };

    // Helper to get total budget and paid
    const getFinancials = () => {
        const total = projectDetails?.budget || 0;
        // Assuming milestones track payments. If not, use some other logic.
        // For now, let's assume we sum up paid milestones
        const paid = projectDetails?.milestones
            ?.filter((m: any) => m.isPaid)
            .reduce((acc: number, m: any) => acc + (m.amount || 0), 0) || 0;

        const escrow = projectDetails?.milestones
            ?.filter((m: any) => m.status === 'COMPLETED' && !m.isPaid)
            .reduce((acc: number, m: any) => acc + (m.amount || 0), 0) || 0;

        return { total, paid, escrow, pending: total - paid - escrow };
    };

    const financials = getFinancials();

    return (
        <ClientLayout>
            <div className="space-y-8 pb-20">
                {/* Header & Project Selector */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">
                            {selectedProject ? selectedProject.title : 'Mis Proyectos'}
                        </h1>
                        <p className="text-gray-500 mt-1">
                            {selectedProject?.vendor ? `Vendor: ${selectedProject.vendor.companyName}` : 'Seguimiento de proyectos'}
                        </p>
                    </div>

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
                                        {selectedProject ? selectedProject.title : 'Seleccionar Proyecto'}
                                    </span>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-gray-400 group-hover:text-gray-600">expand_more</span>
                        </button>

                        {isSearchOpen && (
                            <div className="absolute top-full right-0 w-full bg-white rounded-xl shadow-floating border border-gray-100 mt-2 p-2 animate-in fade-in zoom-in-95 duration-200 z-50">
                                <div className="max-h-60 overflow-y-auto space-y-1">
                                    {filteredProjects.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => {
                                                setSelectedProject(p);
                                                setIsSearchOpen(false);
                                            }}
                                            className={`w-full text-left px-3 py-2 rounded-lg flex justify-between items-center group transition-colors ${selectedProject?.id === p.id ? 'bg-primary/5' : 'hover:bg-gray-50'}`}
                                        >
                                            <div>
                                                <p className={`font-bold text-sm ${selectedProject?.id === p.id ? 'text-primary' : 'text-gray-900'}`}>{p.title}</p>
                                            </div>
                                            {selectedProject?.id === p.id && <span className="material-symbols-outlined text-primary text-sm">check</span>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {!selectedProject ? (
                    <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <span className="material-symbols-outlined text-4xl text-gray-300">folder_off</span>
                        <p className="text-gray-500 mt-2">Selecciona un proyecto para ver el seguimiento.</p>
                    </div>
                ) : loading ? (
                    <div className="flex justify-center py-20">
                        <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Navigation Tabs */}
                        <div className="border-b border-gray-200">
                            <nav className="flex gap-6">
                                <button onClick={() => setActiveTab('overview')} className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
                                    Seguimiento
                                </button>
                                <button onClick={() => setActiveTab('deliverables')} className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'deliverables' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
                                    Hitos y Entregables
                                </button>
                                <button onClick={() => setActiveTab('files')} className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'files' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
                                    Archivos y Repo
                                </button>
                            </nav>
                        </div>

                        {/* TAB: OVERVIEW */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                {/* Roadmap */}
                                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm overflow-x-auto">
                                    <h3 className="font-bold text-gray-900 mb-6">Roadmap del Proyecto</h3>
                                    {(!projectDetails?.milestones || projectDetails.milestones.length === 0) ? (
                                        <p className="text-gray-500 text-sm">El vendor aún no ha configurado los hitos del proyecto.</p>
                                    ) : (
                                        <div className="relative min-w-[600px] flex justify-between items-center py-4 px-8">
                                            {/* Line */}
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 -z-0"></div>

                                            {projectDetails.milestones.map((m: any, idx: number) => {
                                                const isCompleted = m.status === 'COMPLETED' || m.status === 'PAID';
                                                const isPending = m.status === 'PENDING';
                                                return (
                                                    <div key={m.id} className="relative z-10 flex flex-col items-center group">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${isCompleted ? 'bg-green-500 border-green-100 text-white' : 'bg-white border-gray-200 text-gray-400'}`}>
                                                            <span className="material-symbols-outlined text-sm">{isCompleted ? 'check' : 'radio_button_unchecked'}</span>
                                                        </div>
                                                        <div className="absolute top-12 w-32 text-center">
                                                            <p className="text-xs font-bold text-gray-900 mb-0.5 truncate">{m.title}</p>
                                                            <p className="text-[10px] text-gray-500">{new Date(m.dueDate).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Financials & Repo Stats */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-gray-400">payments</span> Finanzas
                                        </h3>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-500">Total</span>
                                                <span className="font-bold text-gray-900">${financials.total.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-500">Pagado</span>
                                                <span className="font-bold text-green-600">${financials.paid.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
                                                <span className="text-sm text-gray-500">En Escrow</span>
                                                <span className="font-bold text-blue-600">${financials.escrow.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB: DELIVERABLES (MILESTONES) */}
                        {activeTab === 'deliverables' && (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                {projectDetails?.milestones?.map((m: any) => (
                                    <div key={m.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-bold text-lg text-gray-900">{m.title}</h3>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${m.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                        {m.status}
                                                    </span>
                                                </div>
                                                <p className="text-gray-600 text-sm">{m.description || "Sin descripción"}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-gray-900">${m.amount.toLocaleString()}</p>
                                                <p className="text-xs text-gray-400">Entrega: {new Date(m.dueDate).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        {/* Deliverables section can be expanded here if we have a specific Deliverable model linked, 
                                            for now assuming files in folders represent deliverables */}
                                        <div className="bg-gray-50 p-3 rounded-lg flex items-center gap-3">
                                            <span className="material-symbols-outlined text-gray-400">folder</span>
                                            <p className="text-sm text-gray-500 italic">Los archivos entregables estarán en la pestaña "Archivos".</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* TAB: FILES */}
                        {activeTab === 'files' && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="flex gap-4 mb-4">
                                    <button onClick={() => setRepoView(false)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold ${!repoView ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                                        <span className="material-symbols-outlined text-sm">folder</span> Archivos del Proyecto
                                    </button>
                                    {projectDetails?.repoUrl && (
                                        <button onClick={() => setRepoView(true)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold ${repoView ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                                            <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" className={`w-4 h-4 ${repoView ? 'invert' : ''}`} alt="GitHub" />
                                            Repositorio en Vivo
                                        </button>
                                    )}
                                </div>

                                {!repoView ? (
                                    <div className="bg-white rounded-xl border border-gray-200 p-6 min-h-[300px]">
                                        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-amber-500">folder</span>
                                            Archivos Compartidos
                                        </h4>
                                        {/* Simple File List for now using root files from backend logic */}
                                        <div className="space-y-2">
                                            {projectDetails?.folders?.map((f: any) => (
                                                <div key={f.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-transparent hover:border-gray-100 transition-colors">
                                                    <span className="material-symbols-outlined text-amber-400">folder</span>
                                                    <span className="text-sm font-bold text-gray-700">{f.name}</span>
                                                    <span className="text-xs text-gray-400 ml-auto">Carpeta</span>
                                                </div>
                                            ))}
                                            {projectDetails?.files?.map((f: any) => (
                                                <div key={f.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-transparent hover:border-gray-100 transition-colors">
                                                    <span className="material-symbols-outlined text-blue-400">description</span>
                                                    <span className="text-sm font-bold text-gray-700">{f.name}</span>
                                                    <div className="ml-auto text-right">
                                                        <p className="text-[10px] text-gray-400">{new Date(f.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                    <button className="p-1 hover:bg-gray-200 rounded text-gray-500">
                                                        <span className="material-symbols-outlined text-sm">download</span>
                                                    </button>
                                                </div>
                                            ))}
                                            {projectDetails?.folders?.length === 0 && projectDetails?.files?.length === 0 && (
                                                <p className="text-gray-400 text-sm italic">No hay archivos compartidos aún.</p>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-gray-900 text-white rounded-xl p-6">
                                        <div className="flex justify-between items-center mb-6">
                                            <div>
                                                <h3 className="font-mono font-bold text-lg">{projectDetails.repoName || 'Repositorio Privado'}</h3>
                                                <p className="text-gray-400 text-xs">{projectDetails.repoUrl}</p>
                                            </div>
                                            <a href={projectDetails.repoUrl} target="_blank" rel="noreferrer" className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                                                Ver en GitHub
                                            </a>
                                        </div>
                                        <div className="border border-gray-700 rounded-lg p-8 text-center bg-black/20">
                                            <p className="text-gray-400">La integración completa con la API de GitHub para ver commits en tiempo real se implementará próximamente.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </ClientLayout>
    );
};

export default ClientProjectTracking;