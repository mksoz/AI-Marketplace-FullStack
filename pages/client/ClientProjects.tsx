import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ClientLayout from '../../components/ClientLayout';
import NewProjectModal from '../../components/NewProjectModal';
import api from '../../services/api';

const ClientProjects: React.FC = () => {
    const navigate = useNavigate();

    // State
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedContext, setSelectedContext] = useState({
        id: 'all',
        name: 'Todos los Proyectos',
        vendor: 'Vista General'
    });
    const searchRef = useRef<HTMLDivElement>(null);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const res = await api.get('/projects/my-projects');

            const mappedProjects = res.data.map((p: any) => {
                const activeIncidents = p.incidents?.filter((i: any) => i.status !== 'RESOLVED' && i.status !== 'CLOSED') || [];
                const criticalIncidents = activeIncidents.filter((i: any) => i.priority === 'CRITICAL' || i.priority === 'HIGH');

                return {
                    ...p,
                    name: p.title,
                    vendor: p.vendor?.companyName || 'Pendiente de Asignación',
                    image: `https://ui-avatars.com/api/?name=${p.title}&background=0D8ABC&color=fff`,
                    tracking: { phase: 'En Desarrollo', nextEvent: 'Revisión Semanal', date: 'Mañana' },
                    deliverables: { current: 'Hito 2', pendingReview: p.milestones?.some((m: any) => m.status === 'COMPLETED' && !m.isPaid), nextPayment: '15 Feb' },
                    files: { count: p.files?.length || 0, lastUpload: 'Hace 2 días', time: '10:30 AM' },
                    incidentsStats: {
                        count: activeIncidents.length,
                        critical: criticalIncidents.length,
                        latest: activeIncidents.length > 0 ? activeIncidents[0].title : 'Sin incidencias activas'
                    }
                };
            });
            setProjects(mappedProjects);
        } catch (error) {
            console.error("Error fetching projects", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    // Logic for filtering projects based on selection or dropdown search
    const filteredProjects = projects.filter(p => {
        if (selectedContext.id !== 'all') {
            return p.id === selectedContext.id;
        }
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

    const getTotalInvestment = () => {
        return projects.reduce((acc, p) => acc + (p.amount || 15000), 0); // Mock amount if missing
    };

    return (
        <ClientLayout>
            <div className="space-y-8 pb-12 max-w-7xl mx-auto">
                <NewProjectModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onProjectCreated={fetchProjects}
                />

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Mis Proyectos</h1>
                        <p className="text-gray-500 mt-2 text-lg">Visión unificada de tus desarrollos activos.</p>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black shadow-lg shadow-gray-200 flex items-center gap-2 transition-transform hover:-translate-y-0.5"
                    >
                        <span className="material-symbols-outlined">add_circle</span>
                        Nuevo Proyecto
                    </button>
                </div>

                {/* Search & Global Stats Bar */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                    {/* Advanced Search */}
                    <div className="lg:col-span-8 bg-white p-2 rounded-2xl border border-gray-200 shadow-sm relative z-20" ref={searchRef}>
                        <div className="relative">
                            <button
                                onClick={() => setIsSearchOpen(!isSearchOpen)}
                                className="w-full flex items-center justify-between bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 text-gray-900 text-left rounded-xl px-4 py-3 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                                        <span className="material-symbols-outlined text-primary">search</span>
                                    </div>
                                    <div>
                                        <span className="block font-bold text-sm text-gray-400 uppercase tracking-wider mb-0.5">Filtrar Vista</span>
                                        <span className="block font-bold text-lg leading-none">{selectedContext.name}</span>
                                    </div>
                                </div>
                                <span className={`material-symbols-outlined text-gray-400 transition-transform duration-300 ${isSearchOpen ? 'rotate-180' : ''}`}>expand_more</span>
                            </button>

                            {isSearchOpen && (
                                <div className="absolute top-full left-0 w-full bg-white rounded-xl shadow-2xl border border-gray-100 mt-2 p-2 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                                    <div className="relative mb-2 px-2 pt-2">
                                        <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                                        <input
                                            type="text"
                                            placeholder="Escribe para buscar..."
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            autoFocus
                                        />
                                    </div>
                                    <div className="max-h-60 overflow-y-auto space-y-1 p-2 custom-scrollbar">
                                        <button
                                            onClick={() => {
                                                setSelectedContext({ name: 'Todos los Proyectos', vendor: 'Vista General', id: 'all' });
                                                setIsSearchOpen(false);
                                                setSearchQuery('');
                                            }}
                                            className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                                <span className="material-symbols-outlined text-lg">dashboard</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-gray-900">Todos los Proyectos</p>
                                                <p className="text-xs text-gray-500">Mostrar lista completa</p>
                                            </div>
                                        </button>

                                        <div className="border-t border-gray-50 my-2"></div>

                                        {dropdownSuggestions.length > 0 ? (
                                            dropdownSuggestions.map(p => (
                                                <button
                                                    key={p.id}
                                                    onClick={() => {
                                                        setSelectedContext({ name: p.name, vendor: p.vendor, id: p.id });
                                                        setIsSearchOpen(false);
                                                        setSearchQuery('');
                                                    }}
                                                    className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 hover:bg-gray-50 group transition-colors"
                                                >
                                                    <img src={p.image} alt={p.name} className="w-8 h-8 rounded-lg bg-gray-100 object-cover" />
                                                    <div className="flex-1">
                                                        <p className="font-bold text-sm text-gray-900 group-hover:text-primary transition-colors">{p.name}</p>
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

                    {/* Quick Stats */}
                    <div className="lg:col-span-4 grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Activos</p>
                            <p className="text-2xl font-black text-gray-900 mt-1">{projects.length}</p>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-center">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Inversión Total</p>
                            <p className="text-2xl font-black text-gray-900 mt-1">${(getTotalInvestment() / 1000).toFixed(0)}k</p>
                        </div>
                    </div>
                </div>

                {/* Project Cards Grid - PREMIUM LAYOUT */}
                <div className="space-y-8">
                    {loading ? (
                        <div className="text-center py-32">
                            <span className="material-symbols-outlined text-5xl text-gray-200 animate-spin mb-4">sync</span>
                            <p className="text-gray-400 font-medium">Sincronizando sus proyectos...</p>
                        </div>
                    ) : filteredProjects.length === 0 ? (
                        <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-gray-200">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="material-symbols-outlined text-4xl text-gray-300">folder_off</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Sin Proyectos Activos</h3>
                            <p className="text-gray-500 mb-8 max-w-md mx-auto">No se encontraron proyectos con los filtros actuales. Comienza uno nuevo para ver la magia.</p>
                            <button onClick={() => setIsModalOpen(true)} className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100">
                                Crear Proyecto
                            </button>
                        </div>
                    ) : (
                        filteredProjects.map(project => (
                            <div key={project.id} className="bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden">

                                {/* 1. HEADER: Branding & Status */}
                                <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="relative">
                                            <img src={project.image} alt="Logo" className="w-16 h-16 rounded-2xl object-cover shadow-md group-hover:scale-105 transition-transform duration-300" />
                                            {project.incidentsStats.critical > 0 && (
                                                <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center">
                                                    <span className="text-[10px] text-white font-bold">!</span>
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-1 group-hover:text-primary transition-colors cursor-pointer" onClick={() => navigate(`/client/projects/${project.id}`)}>
                                                {project.name}
                                            </h2>
                                            <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                                                <span className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded-md">
                                                    <span className="material-symbols-outlined text-sm">business</span>
                                                    {project.vendor}
                                                </span>
                                                <span>•</span>
                                                <span className="text-gray-400">ID: {project.id}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {/* Rated Logic: Mocking based on ID being even/odd for demo purposes */}
                                        {parseInt(project.id.split('-')[1] || '0') % 2 === 0 ? (
                                            <span className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full bg-yellow-50 text-yellow-700 text-xs font-bold border border-yellow-100">
                                                <span className="material-symbols-outlined text-sm fill-current">star</span>
                                                Calificado
                                            </span>
                                        ) : (
                                            <span className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-50 text-gray-400 text-xs font-bold border border-gray-100 group-hover:bg-white transition-colors">
                                                <span className="material-symbols-outlined text-sm">star_outline</span>
                                                Sin Calificar
                                            </span>
                                        )}

                                        <span className={`px-4 py-2 rounded-full text-sm font-bold border ${project.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-100' :
                                            project.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                'bg-gray-50 text-gray-600 border-gray-100'
                                            }`}>
                                            {project.status === 'IN_PROGRESS' ? '• En Progreso' : project.status}
                                        </span>
                                        <button
                                            onClick={() => navigate(`/client/projects/${project.id}`)}
                                            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:border-gray-900 transition-all bg-white"
                                        >
                                            <span className="material-symbols-outlined">arrow_forward</span>
                                        </button>
                                    </div>
                                </div>

                                {/* 2. DASHBOARD GRID: 4 Key Pillars */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100">

                                    {/* SEGUIMIENTO */}
                                    <div className="p-6 hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => navigate(`/client/projects/${project.id}?tab=dashboard`)}>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Seguimiento
                                        </p>

                                        <div className="mb-4">
                                            <div className="flex justify-between items-end mb-2">
                                                <span className="text-3xl font-black text-gray-900">{project.progress}%</span>
                                                <span className="text-sm font-medium text-blue-600 mb-1">Fase {project.deliverables.current.split(' ')[1]}</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${project.progress}%` }}></div>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                                <span className="material-symbols-outlined text-lg">event</span>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-gray-900">Próximo: {project.tracking.nextEvent}</p>
                                                <p className="text-xs text-gray-500">Fecha: {project.tracking.date}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* HITOS & PAGOS */}
                                    <div className="p-6 hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => navigate(`/client/projects/${project.id}?tab=financials`)}>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Finanzas
                                        </p>

                                        {project.deliverables.pendingReview ? (
                                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-2">
                                                <div className="flex items-center gap-2 text-amber-800 font-bold text-sm mb-1">
                                                    <span className="material-symbols-outlined text-lg">warning</span> Acción Requerida
                                                </div>
                                                <p className="text-xs text-amber-700">Revisión pendiente para liberar pago.</p>
                                            </div>
                                        ) : (
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-500 mb-1">Próximo Pago</p>
                                                <p className="text-2xl font-black text-gray-900">{project.deliverables.nextPayment}</p>
                                            </div>
                                        )}

                                        <p className="text-xs text-green-600 font-bold flex items-center gap-1 mt-auto">
                                            Ir a Pagos <span className="material-symbols-outlined text-xs">arrow_forward</span>
                                        </p>
                                    </div>

                                    {/* INCIDENCIAS - NEW */}
                                    <div className="p-6 hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => navigate(`/client/projects/${project.id}?tab=incidents`)}>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <span className={`w-1.5 h-1.5 rounded-full ${project.incidentsStats.count > 0 ? 'bg-red-500' : 'bg-gray-300'}`}></span> Incidencias
                                        </p>

                                        <div className="mb-4">
                                            <div className="flex items-baseline gap-2">
                                                <span className={`text-3xl font-black ${project.incidentsStats.count > 0 ? 'text-gray-900' : 'text-gray-300'}`}>
                                                    {project.incidentsStats.count}
                                                </span>
                                                <span className="text-sm text-gray-500 font-medium">Activas</span>
                                            </div>
                                            {project.incidentsStats.critical > 0 && (
                                                <div className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-md text-[10px] font-bold mt-2">
                                                    <span className="material-symbols-outlined text-[12px]">error</span>
                                                    {project.incidentsStats.critical} Críticas
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-start gap-2 max-w-full">
                                            <span className="material-symbols-outlined text-gray-400 text-sm mt-0.5 shrink-0">info</span>
                                            <p className="text-xs text-gray-500 truncate leading-snug">
                                                {project.incidentsStats.latest}
                                            </p>
                                        </div>
                                    </div>

                                    {/* ARCHIVOS */}
                                    <div className="p-6 hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => navigate(`/client/projects/${project.id}?tab=files`)}>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> Archivos
                                        </p>

                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <span className="text-3xl font-black text-gray-900">{project.files.count}</span>
                                                <p className="text-xs text-gray-500 mt-1">Total Archivos</p>
                                            </div>
                                            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                                <span className="material-symbols-outlined">folder_open</span>
                                            </div>
                                        </div>

                                        <p className="text-xs text-gray-400 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">history</span>
                                            Actualizado {project.files.lastUpload}
                                        </p>
                                    </div>

                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </ClientLayout>
    );
};

export default ClientProjects;