import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClientLayout from '../../components/ClientLayout';
import { projectService, Project } from '../../services/projectService';
import Button from '../../components/Button';

const ClientDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const data = await projectService.getMyProjects();
            setProjects(data);
        } catch (error) {
            console.error("Error fetching projects", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const upcomingEvents = [
        { id: '1', title: 'Demo de Prototipo', time: 'Hoy, 16:30', type: 'meeting' },
        { id: '2', title: 'Vencimiento Factura #003', time: 'Mañana', type: 'payment' },
        { id: '3', title: 'Entrega Final Fase 1', time: 'Viernes', type: 'milestone' },
    ];

    return (
        <ClientLayout>
            <div className="space-y-8 pb-12">


                {/* 1. Hero / Welcome Section */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Hola, Cliente</h1>
                        <p className="text-gray-500 mt-1">Gestión de proyectos de IA.</p>
                    </div>
                </div>

                {/* 2. Key Metrics Cards (Top Level Overview) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div onClick={() => navigate('/client/proposals')} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-card transition-all cursor-pointer group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="p-2 bg-orange-50 text-orange-600 rounded-lg material-symbols-outlined">assignment</span>
                                <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">Proyectos</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-gray-900">{projects.length}</span>
                                <span className="text-sm font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">Activos</span>
                            </div>
                        </div>
                    </div>

                    <div onClick={() => navigate('/client/funds')} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-card transition-all cursor-pointer group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="p-2 bg-green-50 text-green-600 rounded-lg material-symbols-outlined">lock</span>
                                <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">En Garantía (Escrow)</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-gray-900">$125k</span>
                                <span className="text-xs text-gray-400">USD</span>
                            </div>
                        </div>
                    </div>

                    <div onClick={() => navigate('/client/messages')} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-card transition-all cursor-pointer group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="p-2 bg-blue-50 text-blue-600 rounded-lg material-symbols-outlined">chat</span>
                                <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">Mensajes</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-gray-900">8</span>
                                <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">2 nuevos</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* 3. Active Projects Overview (Main Focus) */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Mis Proyectos</h2>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {loading ? (
                                <div className="text-center py-10 text-gray-400">Cargando proyectos...</div>
                            ) : projects.length === 0 ? (
                                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                                    <p className="text-gray-500 mb-4">No tienes proyectos activos.</p>
                                    <Button onClick={() => navigate('/client/projects')}>Ir a Proyectos</Button>
                                </div>
                            ) : (
                                projects.map(project => (
                                    <div key={project.id} className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary transition-colors">{project.title}</h3>
                                                <p className="text-sm text-gray-500 line-clamp-1">{project.description}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-1 bg-blue-50 text-blue-700`}>
                                                    {project.status}
                                                </span>
                                                <p className="text-xs text-gray-400">{new Date(project.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                            <div className="font-bold text-gray-700">${project.budget.toLocaleString()} USD</div>
                                            <div className="text-sm font-medium text-gray-500">{project._count?.proposals || 0} Propuestas</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Financial Summary Widget */}
                        <div className="bg-blue-500 rounded-2xl p-6 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <span className="material-symbols-outlined text-9xl">account_balance_wallet</span>
                            </div>
                            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-end gap-6">
                                <div>
                                    <h3 className="font-bold text-lg mb-1">Estado Financiero Global</h3>
                                    <p className="text-blue-100 text-sm mb-6">Resumen de presupuesto asignado vs. liberado.</p>

                                    <div className="flex gap-8">
                                        <div>
                                            <p className="text-xs text-blue-100 uppercase font-bold">Total Asignado</p>
                                            <p className="text-2xl font-bold">$245,000</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-blue-100 uppercase font-bold">Liberado</p>
                                            <p className="text-2xl font-bold text-green-300">$120,000</p>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => navigate('/client/funds')} className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-50 transition-colors w-full sm:w-auto">
                                    Gestionar Fondos
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 4. Sidebar: Agenda & Activity */}
                    <div className="space-y-8">

                        {/* Agenda Widget */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-gray-900">Agenda Próxima</h3>
                                <button onClick={() => navigate('/client/calendar')} className="p-2 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined">calendar_month</span>
                                </button>
                            </div>
                            <div className="space-y-4">
                                {upcomingEvents.map(event => (
                                    <div key={event.id} className="flex gap-4 items-center">
                                        <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center border text-xs font-bold
                                    ${event.type === 'meeting' ? 'bg-blue-50 border-blue-100 text-blue-700' :
                                                event.type === 'payment' ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-green-50 border-green-100 text-green-700'}
                                `}>
                                            <span className="material-symbols-outlined text-lg mb-0.5">
                                                {event.type === 'meeting' ? 'videocam' : event.type === 'payment' ? 'receipt' : 'flag'}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">{event.title}</p>
                                            <p className="text-xs text-gray-500 font-medium">{event.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button onClick={() => navigate('/client/calendar')} className="w-full mt-6 py-2 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                                Ver Calendario Completo
                            </button>
                        </div>

                        {/* Notifications / Activity Feed */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-gray-900">Actividad Reciente</h3>
                                <button onClick={() => navigate('/client/notifications')} className="text-xs font-bold text-primary hover:underline">Ver todo</button>
                            </div>
                            <div className="relative pl-4 border-l border-gray-100 space-y-6">
                                <div className="relative">
                                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white"></div>
                                    <p className="text-sm font-medium text-gray-900">Nuevo mensaje de <span className="font-bold">QuantumLeap</span></p>
                                    <p className="text-xs text-gray-400 mt-0.5">Hace 10 min</p>
                                </div>
                                <div className="relative">
                                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white"></div>
                                    <p className="text-sm font-medium text-gray-900">Fondos liberados para Hito 1</p>
                                    <p className="text-xs text-gray-400 mt-0.5">Ayer, 14:00</p>
                                </div>
                                <div className="relative">
                                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-gray-300 border-2 border-white"></div>
                                    <p className="text-sm font-medium text-gray-900">Propuesta rechazada: Logística</p>
                                    <p className="text-xs text-gray-400 mt-0.5">20 Ago</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </ClientLayout>
    );
};

export default ClientDashboard;