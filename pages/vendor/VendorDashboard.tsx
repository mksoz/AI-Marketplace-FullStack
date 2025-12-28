import React from 'react';
import { useNavigate } from 'react-router-dom';
import VendorLayout from '../../components/VendorLayout';

const VendorDashboard: React.FC = () => {
    const navigate = useNavigate();

    const activeProjects = [
        { id: '1', name: 'Motor de Recomendación', client: 'Cliente Corp', progress: 65, status: 'En Progreso', nextMilestone: 'Entrenamiento Modelo', revenue: '$10k' },
        { id: '2', name: 'Visión Computarizada Retail', client: 'SuperMart S.A.', progress: 90, status: 'Revisión Final', nextMilestone: 'Entrega Código', revenue: '$25k' },
    ];

    return (
        <VendorLayout>
            <div className="space-y-8 pb-12">
                {/* Hero */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Hola, QuantumLeap AI</h1>
                        <p className="text-gray-500 mt-1">Tu rendimiento y proyectos activos al día de hoy.</p>
                    </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div onClick={() => navigate('/vendor/finance')} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-card transition-all cursor-pointer group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="p-2 bg-green-50 text-green-600 rounded-lg material-symbols-outlined">payments</span>
                                <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">Ingresos este mes</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-gray-900">$18.5k</span>
                                <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+12% vs mes anterior</span>
                            </div>
                        </div>
                    </div>

                    <div onClick={() => navigate('/vendor/proposals')} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-card transition-all cursor-pointer group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="p-2 bg-blue-50 text-blue-600 rounded-lg material-symbols-outlined">description</span>
                                <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">Propuestas Activas</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-gray-900">5</span>
                                <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">2 requieren atención</span>
                            </div>
                        </div>
                    </div>

                    <div onClick={() => navigate('/vendor/profile')} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-card transition-all cursor-pointer group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="p-2 bg-amber-50 text-amber-600 rounded-lg material-symbols-outlined">visibility</span>
                                <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">Vistas del Perfil</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-gray-900">142</span>
                                <span className="text-xs text-gray-400">Últimos 7 días</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Active Projects */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Entregas en Curso</h2>
                            <button onClick={() => navigate('/vendor/projects')} className="text-sm font-bold text-gray-400 hover:text-primary flex items-center gap-1 transition-colors">
                                Ver todos <span className="material-symbols-outlined text-lg">arrow_forward</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {activeProjects.map(project => (
                                <div key={project.id} onClick={() => navigate('/vendor/projects')} className="bg-white p-6 rounded-2xl border border-gray-200 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary transition-colors">{project.name}</h3>
                                            <p className="text-sm text-gray-500">Cliente: <span className="font-medium text-gray-700">{project.client}</span></p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-gray-900">{project.revenue}</p>
                                            <span className="text-xs text-gray-400">Valor Hito Actual</span>
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
                                            <span>Completado</span>
                                            <span>{project.progress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                            <div className="bg-primary h-2.5 rounded-full" style={{ width: `${project.progress}%` }}></div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-gray-50 rounded text-gray-500">
                                                <span className="material-symbols-outlined text-sm">flag</span>
                                            </div>
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-gray-400">Próxima Entrega</p>
                                                <p className="text-sm font-bold text-gray-800">{project.nextMilestone}</p>
                                            </div>
                                        </div>
                                        <button className="text-xs font-bold bg-gray-900 text-white px-3 py-1.5 rounded-lg hover:bg-black transition-colors">
                                            Subir Entregable
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">

                        {/* Quick Actions */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4">Herramientas</h3>
                            <button
                                onClick={() => navigate('/vendor/templates')}
                                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                        <span className="material-symbols-outlined">edit_note</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 group-hover:text-primary transition-colors">Editor de Plantillas</p>
                                        <p className="text-xs text-gray-500">Configura tus requisitos</p>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                            </button>

                            <button
                                onClick={() => navigate('/vendor/proposals')} // Pipeline
                                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left mt-3 group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                        <span className="material-symbols-outlined">view_kanban</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 group-hover:text-primary transition-colors">Pipeline de Ventas</p>
                                        <p className="text-xs text-gray-500">Gestiona tus leads</p>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                            </button>
                        </div>

                        {/* Pending Actions */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-6">Acciones Requeridas</h3>
                            <div className="space-y-4">
                                <div className="flex gap-3 items-start p-3 bg-amber-50 rounded-lg border border-amber-100">
                                    <span className="material-symbols-outlined text-amber-600">rate_review</span>
                                    <div>
                                        <p className="text-sm font-bold text-amber-800">Firmar NDA - Cliente Corp</p>
                                        <p className="text-xs text-amber-700 mt-1">Pendiente hace 2 días</p>
                                    </div>
                                </div>
                                <div className="flex gap-3 items-start p-3 bg-blue-50 rounded-lg border border-blue-100">
                                    <span className="material-symbols-outlined text-blue-600">edit_document</span>
                                    <div>
                                        <p className="text-sm font-bold text-blue-800">Responder Propuesta</p>
                                        <p className="text-xs text-blue-700 mt-1">Fintech AI Project</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </VendorLayout>
    );
};

export default VendorDashboard;