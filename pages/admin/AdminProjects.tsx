import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import toast from 'react-hot-toast';
import { adminProjectsService } from '../../services/adminService';

interface Project {
    id: string;
    title: string;
    description: string;
    budget: number;
    status: string;
    createdAt: string;
    client: {
        companyName: string | null;
        user: { email: string };
    };
    vendor?: {
        companyName: string | null;
        user: { email: string };
    } | null;
    milestones: Array<{
        id: string;
        status: string;
        isPaid: boolean;
    }>;
    proposals: Array<{
        id: string;
        status: string;
    }>;
    contract?: {
        status: string;
        clientSigned: boolean;
        vendorSigned: boolean;
    } | null;
}

const AdminProjects: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const limit = 20;

    // Filters
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Modals
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const params: any = { page, limit };
            if (statusFilter !== 'all') params.status = statusFilter;
            if (searchQuery) params.search = searchQuery;

            const response = await adminProjectsService.getProjects(params);
            setProjects(response.data.projects);
            setTotal(response.data.total);
        } catch (error: any) {
            console.error('Error loading projects:', error);
            toast.error(error.response?.data?.message || 'Error al cargar proyectos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, [page, statusFilter, searchQuery]);

    const handleStatusChange = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const status = formData.get('status') as string;
        const reason = formData.get('reason') as string;

        if (!selectedProject) return;

        try {
            await adminProjectsService.updateStatus(selectedProject.id, { status, reason });
            toast.success('Estado actualizado exitosamente');
            setShowStatusModal(false);
            setSelectedProject(null);
            fetchProjects();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al actualizar estado');
        }
    };

    const handleCancelProject = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const reason = formData.get('reason') as string;
        const refundPercentage = parseInt(formData.get('refundPercentage') as string);

        if (!selectedProject) return;

        try {
            await adminProjectsService.cancelProject(selectedProject.id, { reason, refundPercentage });
            toast.success('Proyecto cancelado exitosamente');
            setShowCancelModal(false);
            setSelectedProject(null);
            fetchProjects();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al cancelar proyecto');
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
            OPEN: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Abierto' },
            PROPOSED: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Propuesto' },
            IN_NEGOTIATION: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Negociación' },
            ACCEPTED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Aceptado' },
            IN_PROGRESS: { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'En Progreso' },
            COMPLETED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completado' },
            CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelado' },
            DECLINED: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Rechazado' },
        };

        const config = statusConfig[status] || statusConfig.OPEN;
        return (
            <span className={`px-2 py-1 text-xs font-bold rounded-full ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    const getHealthIndicator = (project: Project) => {
        const hasContract = project.contract;
        const hasVendor = project.vendor;
        const milestonePaid = project.milestones.filter(m => m.isPaid).length;
        const milestoneTotal = project.milestones.length;

        if (project.status === 'IN_PROGRESS') {
            if (!hasContract || !hasVendor) return '🔴';
            if (milestoneTotal > 0 && milestonePaid / milestoneTotal < 0.3) return '🟡';
        }

        return '🟢';
    };

    return (
        <AdminLayout>
            <div>
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Gestión de Proyectos</h1>
                    <p className="text-gray-600 mt-1">Administra todo el ciclo de vida de los proyectos</p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
                            <input
                                type="text"
                                placeholder="Título, descripción..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="all">Todos</option>
                                <option value="OPEN">Abierto</option>
                                <option value="PROPOSED">Propuesto</option>
                                <option value="IN_NEGOTIATION">Negociación</option>
                                <option value="ACCEPTED">Aceptado</option>
                                <option value="IN_PROGRESS">En Progreso</option>
                                <option value="COMPLETED">Completado</option>
                                <option value="CANCELLED">Cancelado</option>
                            </select>
                        </div>

                        {/* Stats */}
                        <div className="flex items-end justify-end">
                            <div className="text-right">
                                <p className="text-sm text-gray-600">Total Proyectos</p>
                                <p className="text-2xl font-bold text-gray-900">{total}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Projects Table */}
                {loading ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="text-gray-600 mt-4">Cargando proyectos...</p>
                    </div>
                ) : projects.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <p className="text-gray-600">No se encontraron proyectos</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proyecto</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Presupuesto</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progreso</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {projects.map((project) => (
                                    <tr key={project.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                <span>{getHealthIndicator(project)}</span>
                                                {getStatusBadge(project.status)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{project.title}</p>
                                                <p className="text-xs text-gray-500 truncate max-w-xs">{project.description}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <p className="text-sm text-gray-900">{project.client.companyName || 'Sin empresa'}</p>
                                            <p className="text-xs text-gray-500">{project.client.user.email}</p>
                                        </td>
                                        <td className="px-4 py-4">
                                            {project.vendor ? (
                                                <>
                                                    <p className="text-sm text-gray-900">{project.vendor.companyName || 'Sin empresa'}</p>
                                                    <p className="text-xs text-gray-500">{project.vendor.user.email}</p>
                                                </>
                                            ) : (
                                                <span className="text-xs text-gray-400">Sin asignar</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4">
                                            <p className="text-sm font-bold text-gray-900">${project.budget.toLocaleString()}</p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div>
                                                <p className="text-xs text-gray-600">
                                                    {project.milestones.filter(m => m.isPaid).length} / {project.milestones.length} pagados
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {project.proposals.length} propuestas
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    onClick={() => {
                                                        setSelectedProject(project);
                                                        setShowDetailModal(true);
                                                    }}
                                                    className="text-blue-600 hover:text-blue-800 text-sm font-bold"
                                                >
                                                    Ver
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedProject(project);
                                                        setShowStatusModal(true);
                                                    }}
                                                    className="text-primary hover:text-red-700 text-sm font-bold"
                                                >
                                                    Estado
                                                </button>
                                                {project.status !== 'CANCELLED' && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedProject(project);
                                                            setShowCancelModal(true);
                                                        }}
                                                        className="text-red-600 hover:text-red-800 text-sm font-bold"
                                                    >
                                                        Cancelar
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
                            <div className="text-sm text-gray-700">
                                Mostrando {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} de {total}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-100"
                                >
                                    Anterior
                                </button>
                                <button
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={page * limit >= total}
                                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-100"
                                >
                                    Siguiente
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Status Change Modal */}
                {showStatusModal && selectedProject && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-md w-full p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Cambiar Estado del Proyecto</h3>
                            <p className="text-sm text-gray-600 mb-4">Proyecto: <span className="font-bold">{selectedProject.title}</span></p>

                            <form onSubmit={handleStatusChange} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Nuevo Estado</label>
                                    <select
                                        name="status"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        defaultValue={selectedProject.status}
                                    >
                                        <option value="OPEN">Abierto</option>
                                        <option value="PROPOSED">Propuesto</option>
                                        <option value="IN_NEGOTIATION">Negociación</option>
                                        <option value="ACCEPTED">Aceptado</option>
                                        <option value="IN_PROGRESS">En Progreso</option>
                                        <option value="COMPLETED">Completado</option>
                                        <option value="CANCELLED">Cancelado</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Razón del Cambio *</label>
                                    <textarea
                                        name="reason"
                                        required
                                        rows={3}
                                        placeholder="Explica por qué cambias el estado..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowStatusModal(false);
                                            setSelectedProject(null);
                                        }}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-red-600"
                                    >
                                        Cambiar Estado
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Cancel Project Modal */}
                {showCancelModal && selectedProject && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-md w-full p-6">
                            <h3 className="text-lg font-bold text-red-600 mb-4">⚠️ Cancelar Proyecto</h3>
                            <p className="text-sm text-gray-600 mb-4">Proyecto: <span className="font-bold">{selectedProject.title}</span></p>

                            <form onSubmit={handleCancelProject} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Porcentaje de Reembolso</label>
                                    <input
                                        type="number"
                                        name="refundPercentage"
                                        min="0"
                                        max="100"
                                        defaultValue="100"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">0% = sin reembolso, 100% = reembolso completo</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Razón de Cancelación *</label>
                                    <textarea
                                        name="reason"
                                        required
                                        rows={3}
                                        placeholder="Explica por qué cancelas el proyecto..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                    <p className="text-xs text-yellow-800">
                                        Esta acción cambiará el estado del proyecto a CANCELADO y procesará el reembolso según el porcentaje indicado.
                                    </p>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCancelModal(false);
                                            setSelectedProject(null);
                                        }}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Volver
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                    >
                                        Cancelar Proyecto
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Detail Modal */}
                {showDetailModal && selectedProject && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{selectedProject.title}</h3>
                                    <p className="text-sm text-gray-600 mt-1">{selectedProject.description}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowDetailModal(false);
                                        setSelectedProject(null);
                                    }}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <p className="text-xs text-gray-500">Estado</p>
                                    {getStatusBadge(selectedProject.status)}
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Presupuesto</p>
                                    <p className="text-lg font-bold text-gray-900">${selectedProject.budget.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Cliente</p>
                                    <p className="text-sm font-bold text-gray-900">{selectedProject.client.companyName || 'Sin empresa'}</p>
                                    <p className="text-xs text-gray-600">{selectedProject.client.user.email}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Vendor</p>
                                    {selectedProject.vendor ? (
                                        <>
                                            <p className="text-sm font-bold text-gray-900">{selectedProject.vendor.companyName || 'Sin empresa'}</p>
                                            <p className="text-xs text-gray-600">{selectedProject.vendor.user.email}</p>
                                        </>
                                    ) : (
                                        <p className="text-sm text-gray-400">No asignado</p>
                                    )}
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <h4 className="font-bold text-gray-900 mb-3">Milestones</h4>
                                <div className="space-y-2">
                                    {selectedProject.milestones.map((milestone, index) => (
                                        <div key={milestone.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                            <span className="text-sm text-gray-700">Milestone #{index + 1}</span>
                                            <div className="flex gap-2">
                                                <span className={`text-xs px-2 py-1 rounded ${milestone.isPaid ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
                                                    }`}>
                                                    {milestone.isPaid ? 'Pagado' : 'Pendiente'}
                                                </span>
                                                <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                                                    {milestone.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {selectedProject.milestones.length === 0 && (
                                        <p className="text-sm text-gray-500">Sin milestones</p>
                                    )}
                                </div>
                            </div>

                            <div className="border-t pt-4 mt-4">
                                <h4 className="font-bold text-gray-900 mb-3">Propuestas</h4>
                                <p className="text-sm text-gray-700">{selectedProject.proposals.length} propuestas recibidas</p>
                            </div>

                            {selectedProject.contract && (
                                <div className="border-t pt-4 mt-4">
                                    <h4 className="font-bold text-gray-900 mb-3">Contrato</h4>
                                    <div className="flex gap-4">
                                        <span className={`text-xs px-2 py-1 rounded ${selectedProject.contract.clientSigned ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
                                            }`}>
                                            Cliente: {selectedProject.contract.clientSigned ? 'Firmado' : 'Pendiente'}
                                        </span>
                                        <span className={`text-xs px-2 py-1 rounded ${selectedProject.contract.vendorSigned ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
                                            }`}>
                                            Vendor: {selectedProject.contract.vendorSigned ? 'Firmado' : 'Pendiente'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminProjects;
