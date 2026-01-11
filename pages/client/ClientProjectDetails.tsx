import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import ClientLayout from '../../components/ClientLayout';
import api from '../../services/api';
import ProjectFilesManager from '../../components/ProjectFilesManager';
import IncidentManager from '../../components/IncidentManager';
import FinancialsManager from '../../components/FinancialsManager';
import ClientProjectMilestones from './ClientProjectMilestonesV2';
import ClientProjectFiles from './ClientProjectFiles';


const ClientProjectDetails: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // State
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const activeTab = searchParams.get('tab') || 'dashboard';
    const [filesView, setFilesView] = useState<'documents' | 'repository'>('documents');

    // Incident Form State
    const [showIncidentModal, setShowIncidentModal] = useState(false);
    const [newIncident, setNewIncident] = useState({ title: '', description: '', priority: 'MEDIUM', file: null as File | null });

    // Rating State
    const [ratings, setRatings] = useState<Record<string, number>>({});
    const [feedbackComments, setFeedbackComments] = useState<Record<string, string>>({});
    const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

    const fetchProject = async (showLoading = true) => {
        if (!id) return;

        if (showLoading) setLoading(true);
        try {
            const res = await api.get(`/projects/${id}/tracking`);
            setProject(res.data);
        } catch (error) {
            console.error('Error fetching project:', error);
            if (showLoading) setProject(null);
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    useEffect(() => {
        fetchProject();
    }, [id]);

    const handleTabChange = (tab: string) => {
        setSearchParams({ tab });
    };

    const handleCreateIncident = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newIncident.title || !newIncident.description) return;

        try {
            console.log("Mocking incident creation:", { ...newIncident, projectId: id });
            if (newIncident.file) {
                console.log("Uploading file:", newIncident.file.name);
            }
            setShowIncidentModal(false);
            setNewIncident({ title: '', description: '', priority: 'MEDIUM', file: null });
            alert('Incidencia reportada correctamente');
        } catch (error) {
            console.error("Error creating incident", error);
        }
    };

    if (loading) return (
        <ClientLayout>
            <div className="flex items-center justify-center h-screen">
                <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
            </div>
        </ClientLayout>
    );

    if (!project) return (
        <ClientLayout>
            <div className="text-center py-20">
                <h2 className="text-xl font-bold text-gray-900">Proyecto no encontrado</h2>
                <button onClick={() => navigate('/client/projects')} className="text-primary hover:underline mt-4">Volver a mis proyectos</button>
            </div>
        </ClientLayout>
    );

    const getProgress = () => {
        if (!project.milestones || project.milestones.length === 0) return 0;
        const completed = project.milestones.filter((m: any) => m.status === 'COMPLETED' || m.status === 'PAID').length;
        return Math.round((completed / project.milestones.length) * 100);
    };

    const stats = {
        progress: getProgress(),
        paid: project.milestones?.filter((m: any) => m.isPaid).reduce((acc: number, m: any) => acc + (typeof m.amount === 'number' ? m.amount : 0), 0) || 0,
        escrow: project.milestones?.filter((m: any) => m.status === 'COMPLETED' && !m.isPaid).reduce((acc: number, m: any) => acc + (typeof m.amount === 'number' ? m.amount : 0), 0) || 0,
        total: project.budget || 0
    };

    return (
        <ClientLayout>
            <div className="space-y-6 pb-20">
                {/* Header */}
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <span onClick={() => navigate('/client/projects')} className="cursor-pointer hover:text-gray-900">Proyectos</span>
                        <span className="material-symbols-outlined text-xs">chevron_right</span>
                        <span className="font-medium text-gray-900">{project.title}</span>
                    </div>
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900">{project.title}</h1>
                            <p className="text-gray-500">Gestinado por <span className="font-bold text-primary">{project.vendor?.companyName || 'Vendor Asignado'}</span></p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleTabChange('feedback')}
                                className={`px-4 py-2 font-bold rounded-lg transition-colors flex items-center gap-2 shadow-sm ${activeTab === 'feedback'
                                    ? 'bg-yellow-400 text-yellow-900 ring-4 ring-yellow-100'
                                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                <span className={`material-symbols-outlined ${activeTab === 'feedback' ? 'fill-current' : ''}`}>star</span>
                                {activeTab === 'feedback' ? 'Calificando...' : 'Calificar Vendor'}
                            </button>
                        </div>
                    </div>

                    {/* Progress Bar in Header */}
                    <div className="mt-6 bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-bold text-gray-700">Progreso General</span>
                                <span className="text-sm font-black text-gray-900">{stats.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-primary to-blue-600 h-3 rounded-full transition-all duration-1000 shadow-lg shadow-primary/20"
                                    style={{ width: `${stats.progress}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="hidden md:flex flex-col items-end">
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${project.status === 'IN_PROGRESS' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                {project.status}
                            </span>
                        </div>
                    </div>
                </div>



                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8 overflow-x-auto">
                        {['dashboard', 'files', 'financials', 'incidents'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => handleTabChange(tab)}
                                className={`
                                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2
                                    ${activeTab === tab
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                                `}
                            >
                                <span className="material-symbols-outlined text-lg">
                                    {tab === 'dashboard' ? 'dashboard' :
                                        tab === 'files' ? 'folder' :
                                            tab === 'financials' ? 'payments' :
                                                tab === 'incidents' ? 'bug_report' : 'settings'}
                                </span>
                                {tab === 'dashboard' ? 'Visión General' :
                                    tab === 'files' ? 'Archivos' :
                                        tab === 'financials' ? 'Pagos' :
                                            tab === 'incidents' ? 'Incidencias' : 'Configuración'}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div className="min-h-[400px]">
                    {activeTab === 'dashboard' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-8">
                                {/* Stats Overview */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                                        <p className="text-gray-500 text-xs uppercase font-bold">Total</p>
                                        <p className="text-xl font-black text-gray-900">${stats.total}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                                        <p className="text-gray-500 text-xs uppercase font-bold">Pagado</p>
                                        <p className="text-xl font-black text-green-600">${stats.paid}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                                        <p className="text-gray-500 text-xs uppercase font-bold">Archivos</p>
                                        <p className="text-xl font-black text-blue-600">{project.files?.length || 0}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                                        <p className="text-gray-500 text-xs uppercase font-bold">Incidencias</p>
                                        <p className="text-xl font-black text-red-600">{project.incidents?.length || 0}</p>
                                    </div>
                                </div>

                                {/* Roadmap (Restored) */}
                                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                    <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">timeline</span> Roadmap del Proyecto
                                    </h3>
                                    <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                        <ClientProjectMilestones
                                            project={project}
                                            onUpdate={() => fetchProject(false)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Recent Activity Feed */}
                                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                                    <h3 className="font-bold text-gray-900 mb-4">Actividad Reciente</h3>
                                    <ul className="space-y-4">
                                        <li className="flex gap-3 items-start">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                                                <span className="material-symbols-outlined text-sm">update</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">Estado actualizado</p>
                                                <p className="text-xs text-gray-500">hace 2 horas</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-3 items-start">
                                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                                                <span className="material-symbols-outlined text-sm">upload_file</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">Nuevos archivos subidos</p>
                                                <p className="text-xs text-gray-500">hace 1 día</p>
                                            </div>
                                        </li>
                                    </ul>
                                </div>


                            </div>
                        </div>
                    )}

                    {activeTab === 'files' && (
                        <ClientProjectFiles
                            project={project}
                            userRole="CLIENT"
                            onUpdate={() => fetchProject(false)}
                            onGoToRoadmap={() => handleTabChange('dashboard')}
                        />
                    )}



                    {activeTab === 'financials' && (
                        <div className="space-y-8">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative">
                                    <p className="text-gray-500 text-sm font-medium uppercase">Presupuesto Total</p>
                                    <p className="text-3xl font-black text-gray-900 mt-2">${stats.total.toLocaleString()}</p>
                                    <button className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold" title="Depositar Fondos">
                                        <span className="material-symbols-outlined text-lg">add_circle</span> Depositar
                                    </button>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                    <p className="text-gray-500 text-sm font-medium uppercase">Liberado / Pagado</p>
                                    <p className="text-3xl font-black text-green-600 mt-2">${stats.paid.toLocaleString()}</p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                    <p className="text-gray-500 text-sm font-medium uppercase">En Garantía (Escrow)</p>
                                    <p className="text-3xl font-black text-blue-600 mt-2">${stats.escrow.toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Financials Manager */}
                            <FinancialsManager
                                milestones={project.milestones || []}
                                userRole="client"
                                onApproveRelease={async (requestId) => {
                                    try {
                                        await api.post(`/milestones/payment-requests/${requestId}/approve`);
                                        alert('Pago aprobado correctamente');
                                        const res = await api.get(`/projects/${id}/tracking`);
                                        setProject(res.data);
                                    } catch (error: any) {
                                        console.error('Error approving payment:', error);
                                        alert(error.response?.data?.message || 'Error al aprobar pago');
                                    }
                                }}
                                onRejectRelease={async (requestId, reason) => {
                                    try {
                                        await api.post(`/milestones/payment-requests/${requestId}/reject`, { rejectionReason: reason });
                                        alert('Solicitud rechazada');
                                        const res = await api.get(`/projects/${id}/tracking`);
                                        setProject(res.data);
                                    } catch (error: any) {
                                        console.error('Error rejecting payment:', error);
                                        alert(error.response?.data?.message || 'Error al rechazar');
                                    }
                                }}
                            />
                        </div>
                    )}

                    {activeTab === 'incidents' && (
                        <IncidentManager
                            incidents={project.incidents || []}
                            userRole="client"
                            onReport={(inc) => setShowIncidentModal(true)}
                        />
                    )}
                    {activeTab === 'feedback' && (
                        <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl border border-gray-200 mt-6 shadow-sm">
                            <div className="flex flex-col md:flex-row items-center justify-between border-b border-gray-100 pb-6 mb-6 gap-4">
                                <div className="flex items-center gap-4 text-center md:text-left">
                                    <div className="w-12 h-12 rounded-full bg-yellow-50 text-yellow-500 flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-2xl">workspace_premium</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Evaluación 360°</h3>
                                        <p className="text-sm text-gray-500">
                                            Califica a <span className="font-bold text-gray-900">{project.vendor?.companyName}</span>.
                                            <span className="text-xs text-gray-400 uppercase font-bold tracking-wider ml-2">Privado</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { id: 'technical', label: 'Calidad Técnica', desc: 'Calidad del código y soluciones.' },
                                    { id: 'communication', label: 'Comunicación', desc: 'Claridad y disponibilidad.' },
                                    { id: 'deadlines', label: 'Cumplimiento', desc: 'Entrega puntual de hitos.' },
                                    { id: 'proactivity', label: 'Resolución', desc: 'Capacidad para resolver bloqueos.' },
                                    { id: 'documentation', label: 'Documentación', desc: 'Calidad de la entrega final.' }
                                ].map((criterion) => (
                                    <div key={criterion.id} className="group border-b border-gray-50 pb-4 last:border-0 last:pb-0 transition-all hover:bg-gray-50/30 p-2 rounded-xl">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="md:w-1/3">
                                                <label className="font-bold text-gray-900 block">{criterion.label}</label>
                                                <p className="text-xs text-gray-500">{criterion.desc}</p>
                                            </div>

                                            <div className="flex-1 flex items-center justify-end gap-3">
                                                {/* Stars */}
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <button
                                                            key={star}
                                                            onClick={() => setRatings(prev => ({ ...prev, [criterion.id]: star }))}
                                                            className={`w-8 h-8 rounded hover:bg-gray-100 flex items-center justify-center text-2xl transition-all duration-150 ${(ratings[criterion.id] || 0) >= star
                                                                ? 'text-yellow-400 scale-110'
                                                                : 'text-gray-200 hover:text-yellow-200'
                                                                }`}
                                                        >
                                                            ★
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* Comment Toggle */}
                                                <div className="border-l border-gray-200 pl-3 ml-2">
                                                    <button
                                                        onClick={() => setExpandedComments(prev => ({ ...prev, [criterion.id]: !prev[criterion.id] }))}
                                                        className={`p-2 rounded-full transition-colors flex items-center gap-2 text-xs font-bold ${expandedComments[criterion.id] || feedbackComments[criterion.id]
                                                            ? 'bg-blue-50 text-blue-600'
                                                            : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                                                            }`}
                                                        title="Añadir comentario específico"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">chat_bubble</span>
                                                        <span className="hidden md:inline">{feedbackComments[criterion.id] ? 'Editar' : 'Comentar'}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Optional Comment Input */}
                                        {(expandedComments[criterion.id] || feedbackComments[criterion.id]) && (
                                            <div className="mt-3 pl-0 md:pl-[33%] animate-in slide-in-from-top-2 duration-200">
                                                <textarea
                                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                                                    rows={2}
                                                    placeholder={`Detalles sobre ${criterion.label.toLowerCase()}...`}
                                                    value={feedbackComments[criterion.id] || ''}
                                                    onChange={(e) => setFeedbackComments({ ...feedbackComments, [criterion.id]: e.target.value })}
                                                    autoFocus
                                                ></textarea>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 pt-8 border-t border-gray-100 mt-4">
                                <label className="block text-sm font-bold text-gray-900 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-gray-400">rate_review</span>
                                    Feedback General
                                </label>
                                <textarea
                                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none bg-white transition-all text-sm shadow-sm"
                                    rows={3}
                                    placeholder="Resumen general de tu experiencia..."
                                ></textarea>
                            </div>

                            <div className="pt-6 flex justify-end">
                                <button className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 hover:-translate-y-0.5">
                                    <span>Enviar Evaluación</span>
                                    <span className="material-symbols-outlined text-sm">send</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Incident Modal with File Attachment */}
                {showIncidentModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Reportar Incidencia</h3>
                            <form onSubmit={handleCreateIncident} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                        placeholder="Resumen del problema"
                                        value={newIncident.title}
                                        onChange={e => setNewIncident({ ...newIncident, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
                                    <select
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                        value={newIncident.priority}
                                        onChange={e => setNewIncident({ ...newIncident, priority: e.target.value })}
                                    >
                                        <option value="LOW">Baja</option>
                                        <option value="MEDIUM">Media</option>
                                        <option value="HIGH">Alta</option>
                                        <option value="CRITICAL">Crítica</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                    <textarea
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none h-32 resize-none"
                                        placeholder="Detalla lo ocurrido..."
                                        value={newIncident.description}
                                        onChange={e => setNewIncident({ ...newIncident, description: e.target.value })}
                                        required
                                    />
                                </div>

                                {/* Optional File Attachment */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Adjuntar Archivo (Opcional)</label>
                                    <div className="border border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors relative cursor-pointer">
                                        <input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    setNewIncident({ ...newIncident, file: e.target.files[0] });
                                                }
                                            }}
                                        />
                                        {newIncident.file ? (
                                            <div className="flex items-center justify-center gap-2 text-primary font-bold">
                                                <span className="material-symbols-outlined">attach_file</span>
                                                {newIncident.file.name}
                                            </div>
                                        ) : (
                                            <div className="text-gray-400 text-sm">
                                                <span className="material-symbols-outlined block text-2xl mb-1">cloud_upload</span>
                                                Haz clic o arrastra un archivo aquí
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button type="button" onClick={() => setShowIncidentModal(false)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-50 rounded-lg">Cancelar</button>
                                    <button type="submit" className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 shadow-lg shadow-red-200">Reportar</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </ClientLayout >
    );
};

export default ClientProjectDetails;
