import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import VendorLayout from '../../components/VendorLayout';
import Modal from '../../components/Modal';
import api from '../../services/api';
import ProjectFilesManager from '../../components/ProjectFilesManager';
import IncidentManager from '../../components/IncidentManager';
import FinancialsManager from '../../components/FinancialsManager';
import ClientProjectMilestones from '../client/ClientProjectMilestones'; // Reusing visual component based on request
import VendorRoadmapEditor from '../../components/VendorRoadmapEditor';
import { getMockProject } from '../../services/mockData';
import ClientProjectFiles from '../client/ClientProjectFiles';

const VendorProjectDetails: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const activeTab = searchParams.get('tab') || 'dashboard';

    // Incident Form State
    const [showIncidentModal, setShowIncidentModal] = useState(false);
    const [newIncident, setNewIncident] = useState({ title: '', description: '', priority: 'MEDIUM', file: null as File | null });

    // Roadmap Edit State
    const [isRoadmapEditing, setIsRoadmapEditing] = useState(false);
    const roadmapEditorRef = React.useRef<any>(null);

    useEffect(() => {
        const fetchProject = async () => {
            if (!id) return;

            setLoading(true);
            try {
                const res = await api.get(`/projects/${id}/tracking`);
                setProject(res.data);
            } catch (error) {
                console.error('Error fetching project:', error);
                setProject(null);
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [id]);

    const handleTabChange = (tab: string) => {
        setSearchParams({ tab });
    };

    const handleCreateIncident = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            console.log("Mocking incident creation:", { ...newIncident, projectId: id });
            setShowIncidentModal(false);
            setNewIncident({ title: '', description: '', priority: 'MEDIUM', file: null });
            alert('Incidencia reportada correctamente');
        } catch (error) {
            console.error("Error creating incident", error);
        }
    };

    if (loading) return (
        <VendorLayout>
            <div className="flex items-center justify-center h-screen">
                <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
            </div>
        </VendorLayout>
    );

    if (!project) return (
        <VendorLayout>
            <div className="text-center py-20">
                <h2 className="text-xl font-bold text-gray-900">Proyecto no encontrado</h2>
                <button onClick={() => navigate('/vendor/dashboard')} className="text-primary hover:underline mt-4">Volver al Inicio</button>
            </div>
        </VendorLayout>
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
        <VendorLayout>
            <div className="space-y-6 pb-20">
                {/* Header */}
                <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <span onClick={() => navigate('/vendor/projects')} className="cursor-pointer hover:text-gray-900">Proyectos</span>
                        <span className="material-symbols-outlined text-xs">chevron_right</span>
                        <span className="font-medium text-gray-900">{project.title}</span>
                    </div>
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900">{project.title}</h1>
                            <p className="text-gray-500">Cliente: <span className="font-bold text-primary">{project.client?.companyName || 'Cliente Asignado'}</span></p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => navigate('/vendor/messages')}
                                className="px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">chat</span> Contactar Cliente
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
                                            tab === 'financials' ? 'payments' : 'bug_report'}
                                </span>
                                {tab === 'dashboard' ? 'Visión General' :
                                    tab === 'files' ? 'Archivos y Repositorio' :
                                        tab === 'financials' ? 'Finanzas' : 'Incidencias'}
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

                                {/* Roadmap */}
                                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative">
                                    <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 pb-2 border-b border-transparent">
                                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary">timeline</span> Roadmap del Proyecto
                                        </h3>
                                        {activeTab === 'dashboard' && (
                                            <div className="flex gap-2">
                                                {isRoadmapEditing ? (
                                                    <>
                                                        <button
                                                            onClick={() => setIsRoadmapEditing(false)}
                                                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                            title="Cancelar Edición"
                                                        >
                                                            <span className="material-symbols-outlined">close</span>
                                                        </button>
                                                        <button
                                                            onClick={() => roadmapEditorRef.current?.openNotifyModal()}
                                                            className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-lg shadow-green-200 transition-colors"
                                                            title="Guardar Cambios"
                                                        >
                                                            <span className="material-symbols-outlined">save</span>
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => setIsRoadmapEditing(true)}
                                                        className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                                        title="Editar Roadmap"
                                                    >
                                                        <span className="material-symbols-outlined">edit</span>
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar p-1">
                                        <VendorRoadmapEditor
                                            ref={roadmapEditorRef}
                                            project={project}
                                            isEditing={isRoadmapEditing}
                                            onCancel={() => setIsRoadmapEditing(false)}
                                            onSave={async (newMilestones, note) => {
                                                try {
                                                    console.log('Updating roadmap:', newMilestones, 'Note:', note);

                                                    // Make API call to persist changes
                                                    await api.post(`/projects/${project.id}/setup`, {
                                                        milestones: newMilestones,
                                                        startDate: project.startDate,
                                                        endDate: project.endDate,
                                                        repoUrl: project.repoUrl,
                                                        repoName: project.repoName
                                                    });

                                                    // Update local state after successful API call
                                                    setProject({ ...project, milestones: newMilestones });
                                                    setIsRoadmapEditing(false);

                                                    // Optionally send notification to client if note provided
                                                    if (note?.trim()) {
                                                        // TODO: Send notification via messaging system
                                                        console.log('Notification to client:', note);
                                                    }
                                                } catch (error) {
                                                    console.error('Error updating roadmap:', error);
                                                    alert('Error al actualizar el roadmap. Por favor intenta de nuevo.');
                                                    throw error; // Prevent modal from showing success
                                                }
                                            }}
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
                        <ClientProjectFiles project={project} userRole="VENDOR" />
                    )}

                    {activeTab === 'financials' && (
                        <div className="space-y-8">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative">
                                    <p className="text-gray-500 text-sm font-medium uppercase">Presupuesto Total</p>
                                    <p className="text-3xl font-black text-gray-900 mt-2">${stats.total.toLocaleString()}</p>
                                    {/* Action button removed for Vendor per instructions */}
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

                            {/* Financials Manager - Vendor Role */}
                            <FinancialsManager
                                milestones={project.milestones || []}
                                userRole="vendor"
                                onRequestRelease={async (mId, note) => {
                                    try {
                                        await api.post(`/milestones/${mId}/request-payment`, {
                                            vendorNote: note
                                        });
                                        alert('Solicitud de pago enviada correctamente');
                                        // Reload project data
                                        const response = await api.get(`/projects/${projectId}`);
                                        setProject(response.data);
                                    } catch (error: any) {
                                        console.error('Error requesting payment:', error);
                                        alert(error.response?.data?.message || 'Error al solicitar pago');
                                    }
                                }}
                            />
                        </div>
                    )}

                    {activeTab === 'incidents' && (
                        <IncidentManager
                            incidents={project.incidents || []}
                            userRole="vendor"
                            onReport={(inc) => setShowIncidentModal(true)}
                        />
                    )}
                </div>

                {/* Incident Modal - Same as Client */}
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
        </VendorLayout>
    );
};

export default VendorProjectDetails;
