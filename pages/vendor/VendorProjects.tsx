import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import VendorLayout from '../../components/VendorLayout';
import VendorProposalDetailsModal from '../../components/VendorProposalDetailsModal';
import api from '../../services/api';

// import { mockProjects } from '../../services/mockData';

// Helper to deduce project dates if missing
const getProjectDates = (project: any) => {
    // Try to find dates from milestones if top level is missing
    let start = project.startDate ? new Date(project.startDate) : null;
    let end = project.endDate ? new Date(project.endDate) : null;

    if (!end && project.milestones && project.milestones.length > 0) {
        // Find last due date
        const dates = project.milestones
            .map((m: any) => m.dueDate ? new Date(m.dueDate).getTime() : 0)
            .filter((d: number) => d > 0);
        if (dates.length > 0) {
            end = new Date(Math.max(...dates));
        }
    }
    // Mock start date if missing for demo
    if (!start && project.createdAt) start = new Date(project.createdAt);
    if (!start) start = new Date('2023-01-01'); // Fallback

    return { start, end };
};

const VendorProjects: React.FC = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Filters State
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('Todos');
    const [dateFilter, setDateFilter] = useState({ start: '', end: '' });

    // View State
    const [viewMode, setViewMode] = useState<'board' | 'list'>('board');

    // Proposal Modal State
    const [selectedProposal, setSelectedProposal] = useState<any>(null);
    const [showProposalModal, setShowProposalModal] = useState(false);

    // Autocomplete State
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const res = await api.get('/projects/my-projects');
            const data = res.data.map((p: any) => {
                // Calculate progress
                let progress = 0;
                if (p.milestones && p.milestones.length > 0) {
                    const completed = p.milestones.filter((m: any) => m.status === 'COMPLETED' || m.status === 'PAID').length;
                    progress = Math.round((completed / p.milestones.length) * 100);
                } else if (p.status === 'COMPLETED') {
                    progress = 100;
                }

                return {
                    ...p,
                    client: p.client || { companyName: 'Cliente' },
                    progress // Add progress to object
                };
            });
            setProjects(data);
        } catch (error) {
            console.error("Error fetching projects", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();

        // Click outside to close suggestions
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter Logic
    const filteredProjects = projects.filter(p => {
        const query = searchQuery.toLowerCase();
        const matchesSearch = (p.title || p.name).toLowerCase().includes(query) ||
            (p.client?.companyName || '').toLowerCase().includes(query) ||
            p.id.toLowerCase().includes(query);

        const matchesStatus = statusFilter === 'Todos' || p.status === statusFilter;

        // Date Filter
        let matchesDate = true;
        const { start, end } = getProjectDates(p);

        if (dateFilter.start) {
            const filterStart = new Date(dateFilter.start);
            // If project ends before filter start, it's out (assuming filtering by active range or deadline)
            // Let's filter by: Project must overlap with the range provided
            // Or simpler: Project Start >= Filter Start
            if (start && start < filterStart) matchesDate = false; // Strictly starting after? Or active?
            // Let's go with: Deadline must be after Filter Start
            if (end && end < filterStart) matchesDate = false;
        }
        if (dateFilter.end) {
            const filterEnd = new Date(dateFilter.end);
            // Project Start must be before Filter End
            if (start && start > filterEnd) matchesDate = false;
        }

        return matchesSearch && matchesStatus && matchesDate;
    });

    // Stats
    const activeCount = projects.filter(p => p.status === 'IN_PROGRESS').length;

    // Kanban Columns
    const columns = [
        { id: 'ACCEPTED', label: 'Por Configurar', color: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700' },
        { id: 'IN_PROGRESS', label: 'En Curso', color: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
        { id: 'COMPLETED', label: 'Finalizados', color: 'bg-green-50 border-green-200', text: 'text-green-700' }
    ];

    const getColumnProjects = (statusId: string) => {
        return filteredProjects.filter(p => {
            if (statusId === 'ACCEPTED') return p.status === 'ACCEPTED' || p.status === 'PENDING_SETUP';
            if (statusId === 'IN_PROGRESS') return p.status === 'IN_PROGRESS';
            if (statusId === 'COMPLETED') return p.status === 'COMPLETED' || p.status === 'CLOSED';
            return false;
        });
    };

    // Handle click on project card
    const handleProjectClick = (project: any) => {
        if (project.status === 'ACCEPTED') {
            // Transform project data to match lead structure
            const leadData = {
                id: project.id,
                project: project.title || project.name,
                client: project.client?.companyName || 'Cliente',
                budget: `$${project.budget?.toLocaleString() || '0'}`,
                budgetVal: project.budget || 0,
                status: project.status, // For initialTab prop
                rawStatus: project.status,
                templateData: project.templateData,
                description: project.description
            };

            setSelectedProposal(leadData);
            setShowProposalModal(true);
        } else {
            // Navigate to project details
            navigate(`/vendor/projects/${project.id}`);
        }
    };

    return (
        <VendorLayout>
            <div className="space-y-6 h-full flex flex-col">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 shrink-0">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Mis Proyectos</h1>
                        <p className="text-gray-500 mt-1">Gestiona tus entregas y colaboraciones activas.</p>
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

                {/* Advanced Search & Filters Control Panel */}
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col xl:flex-row gap-4 shrink-0 z-20">

                    {/* Autocomplete Search */}
                    <div className="flex-1 relative" ref={searchRef}>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                            <input
                                type="text"
                                placeholder="Buscar proyecto, cliente o ID..."
                                className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-gray-700"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => setShowSuggestions(true)}
                            />
                        </div>

                        {/* Suggestions Dropdown */}
                        {showSuggestions && searchQuery.trim() !== '' && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden z-50">
                                {filteredProjects.length > 0 ? (
                                    <>
                                        <div className="px-4 py-2 bg-gray-50 text-xs font-bold text-gray-500 uppercase">Proyectos Encontrados</div>
                                        {filteredProjects.slice(0, 5).map(p => (
                                            <div
                                                key={p.id}
                                                onClick={() => handleProjectClick(p)}
                                                className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex justify-between items-center group border-b border-gray-50 last:border-0"
                                            >
                                                <div>
                                                    <p className="font-bold text-gray-900 group-hover:text-primary transition-colors">{p.title}</p>
                                                    <p className="text-xs text-gray-500">{p.client?.companyName}</p>
                                                </div>
                                                <span className="material-symbols-outlined text-gray-300 group-hover:text-primary">arrow_forward</span>
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <div className="p-4 text-center text-gray-500 text-sm">No se encontraron resultados</div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Filters Group */}
                    <div className="flex flex-wrap gap-4 items-center">
                        {/* Status Filter */}
                        <div className="relative">
                            <select
                                className="appearance-none pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-bold text-gray-700 cursor-pointer text-sm min-w-[180px]"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="Todos">Todos los Estados</option>
                                <option value="IN_PROGRESS">En Progreso</option>
                                <option value="COMPLETED">Finalizados</option>
                                <option value="ACCEPTED">Por Configurar</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-xl">arrow_drop_down</span>
                        </div>

                        {/* Date Range Filter */}
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
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Proyecto</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Cliente</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Entrega</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Progreso</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredProjects.map((project) => {
                                            const { end } = getProjectDates(project);
                                            return (
                                                <tr
                                                    key={project.id}
                                                    onClick={() => handleProjectClick(project)}
                                                    className="hover:bg-gray-50/80 transition-colors cursor-pointer group"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-gray-600 group-hover:bg-primary group-hover:text-white transition-colors">
                                                                {(project.title || project.name).charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1 max-w-[200px]">{project.title}</p>
                                                                <p className="text-xs text-gray-500 font-mono">{project.id}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm font-medium text-gray-700">{project.client?.companyName}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5
                                                        ${project.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                                                                project.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                                    'bg-gray-100 text-gray-600'}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${project.status === 'IN_PROGRESS' ? 'bg-blue-600' : project.status === 'COMPLETED' ? 'bg-green-600' : 'bg-gray-500'}`}></span>
                                                            {project.status === 'IN_PROGRESS' ? 'En Progreso' : project.status === 'COMPLETED' ? 'Completado' : 'Pendiente'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {end ? (
                                                            <span className={`text-sm font-bold ${end < new Date() && project.status !== 'COMPLETED' ? 'text-red-600' : 'text-gray-700'}`}>
                                                                {end.toLocaleDateString()}
                                                            </span>
                                                        ) : (
                                                            <span className="text-sm text-gray-400 italic">TBD</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 w-48">
                                                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                                            <div
                                                                className="bg-primary h-full rounded-full"
                                                                style={{ width: `${project.progress || 0}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-xs font-medium text-gray-500 mt-1 block text-right">{project.progress || 0}%</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button className="text-gray-400 hover:text-primary p-2 hover:bg-white rounded-full transition-colors shadow-sm border border-transparent hover:border-gray-200">
                                                            <span className="material-symbols-outlined">chevron_right</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                        {filteredProjects.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                                    <div className="flex flex-col items-center justify-center">
                                                        <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">filter_list_off</span>
                                                        <p>No se encontraron proyectos con los filtros actuales.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        // Board / Kanban View (Preserved but integrated with new Filters)
                        <div className="h-full overflow-x-auto pb-4">
                            <div className="flex gap-6 h-full min-w-[1000px]">
                                {columns.map(col => {
                                    const colProjects = getColumnProjects(col.id);
                                    return (
                                        <div key={col.id} className="flex-1 flex flex-col bg-gray-50 rounded-2xl border border-gray-200 min-w-[320px]">
                                            <div className={`p-4 border-b border-gray-200 rounded-t-2xl flex justify-between items-center ${col.color.replace('border', 'bg').replace('50', '100/50')}`}>
                                                <h3 className={`font-bold ${col.text}`}>{col.label}</h3>
                                                <span className="bg-white text-gray-800 font-bold px-2.5 py-0.5 rounded-lg text-xs shadow-sm border border-gray-100">
                                                    {colProjects.length}
                                                </span>
                                            </div>
                                            <div className="p-4 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
                                                {colProjects.map(project => {
                                                    const { end } = getProjectDates(project);
                                                    return (
                                                        <div
                                                            key={project.id}
                                                            onClick={() => handleProjectClick(project)}
                                                            className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-lg cursor-pointer hover:border-primary/50 transition-all group relative overflow-hidden"
                                                        >
                                                            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-gray-100 to-transparent opacity-50 rounded-bl-full pointer-events-none group-hover:from-primary/10 transition-all"></div>

                                                            <div className="flex justify-between items-start mb-3 relative z-10">
                                                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-gray-700 text-lg group-hover:bg-primary group-hover:text-white transition-colors shadow-sm">
                                                                    {(project.title || project.name).charAt(0)}
                                                                </div>
                                                                <button className="text-gray-300 hover:text-gray-600"><span className="material-symbols-outlined">more_horiz</span></button>
                                                            </div>

                                                            <h4 className="font-bold text-gray-900 mb-1 line-clamp-2 leading-tight group-hover:text-primary transition-colors">{project.title || project.name}</h4>
                                                            <p className="text-xs font-bold uppercase text-gray-400 mb-4 tracking-wide">{project.client?.companyName || 'Cliente'}</p>

                                                            <div className="space-y-3">
                                                                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                                    <div
                                                                        className={`h-full rounded-full ${project.status === 'COMPLETED' ? 'bg-green-500' : 'bg-primary'}`}
                                                                        style={{ width: `${project.progress || 0}%` }}
                                                                    ></div>
                                                                </div>

                                                                <div className="flex items-center justify-between text-xs">
                                                                    <div className="flex items-center gap-1 text-gray-500">
                                                                        <span className="material-symbols-outlined text-[14px]">event</span>
                                                                        <span>{end ? end.toLocaleDateString() : 'TBD'}</span>
                                                                    </div>
                                                                    <span className="font-bold text-gray-700">{project.progress || 0}%</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                                {colProjects.length === 0 && (
                                                    <div className="py-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                                                        <span className="material-symbols-outlined text-3xl mb-2 opacity-50">inbox</span>
                                                        <p className="text-xs font-medium">Vacío</p>
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

            {/* Proposal Configuration Modal */}
            {selectedProposal && (
                <VendorProposalDetailsModal
                    isOpen={showProposalModal}
                    onClose={() => {
                        setShowProposalModal(false);
                        setSelectedProposal(null);
                    }}
                    lead={selectedProposal}
                    onStatusUpdate={() => {
                        fetchProjects();
                        setShowProposalModal(false);
                        setSelectedProposal(null);
                    }}
                    initialTab={selectedProposal.status === 'ACCEPTED' ? 'configuracion' : 'proposal'}
                />
            )}
        </VendorLayout>
    );
};

export default VendorProjects;