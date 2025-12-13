import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';

const AdminDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '1y'>('30d');

  // Mock Data for Charts (CSS based)
  const chartData = [35, 45, 30, 60, 75, 50, 80, 70, 90, 85, 100, 95]; // Heights in %

  return (
    <AdminLayout>
      <div className="space-y-8 pb-12">
         {/* Header & Controls */}
         <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
               <h1 className="text-3xl font-black text-gray-900 tracking-tight">Resumen Ejecutivo</h1>
               <p className="text-gray-500 mt-1">Visión global del rendimiento de la plataforma.</p>
            </div>
            <div className="bg-white border border-gray-200 p-1 rounded-lg flex shadow-sm">
                <button 
                    onClick={() => setTimeRange('7d')}
                    className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors ${timeRange === '7d' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    7 Días
                </button>
                <button 
                    onClick={() => setTimeRange('30d')}
                    className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors ${timeRange === '30d' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    30 Días
                </button>
                <button 
                    onClick={() => setTimeRange('1y')}
                    className={`px-4 py-1.5 text-sm font-bold rounded-md transition-colors ${timeRange === '1y' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    Anual
                </button>
            </div>
         </div>
         
         {/* Key Metrics */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-card transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-green-50 rounded-xl text-green-600">
                        <span className="material-symbols-outlined">payments</span>
                    </div>
                    <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        +12.5%
                    </span>
                </div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Ingresos (GMV)</p>
                <p className="text-3xl font-black text-gray-900 mt-1">$45,200</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-card transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                        <span className="material-symbols-outlined">group_add</span>
                    </div>
                    <span className="flex items-center text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        +8.2%
                    </span>
                </div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Nuevos Usuarios</p>
                <p className="text-3xl font-black text-gray-900 mt-1">1,240</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-card transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
                        <span className="material-symbols-outlined">rocket_launch</span>
                    </div>
                    <span className="flex items-center text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        0%
                    </span>
                </div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Proyectos Activos</p>
                <p className="text-3xl font-black text-gray-900 mt-1">85</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-card transition-shadow">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-red-50 rounded-xl text-red-600">
                        <span className="material-symbols-outlined">gavel</span>
                    </div>
                    <span className="flex items-center text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-full">
                        +1
                    </span>
                </div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Disputas Abiertas</p>
                <p className="text-3xl font-black text-gray-900 mt-1">2</p>
            </div>
         </div>

         {/* Main Chart Section */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                 <div className="flex justify-between items-center mb-8">
                     <h3 className="font-bold text-xl text-gray-900">Tendencia de Ingresos</h3>
                     <button className="text-primary text-sm font-bold hover:underline">Ver reporte detallado</button>
                 </div>
                 
                 {/* CSS Bar Chart */}
                 <div className="h-64 flex items-end justify-between gap-2 md:gap-4">
                     {chartData.map((height, i) => (
                         <div key={i} className="flex-1 flex flex-col justify-end group cursor-pointer">
                             <div 
                                className="w-full bg-gray-100 rounded-t-lg transition-all duration-500 group-hover:bg-primary relative" 
                                style={{ height: `${height}%` }}
                             >
                                 <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-dark text-white text-xs font-bold px-2 py-1 rounded pointer-events-none transition-opacity">
                                     ${height}k
                                 </div>
                             </div>
                             <p className="text-center text-xs text-gray-400 mt-2 font-medium">{i + 1} Ago</p>
                         </div>
                     ))}
                 </div>
             </div>

             {/* Actionable Sidebar */}
             <div className="space-y-6">
                 {/* Verification Queue */}
                 <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                     <div className="flex justify-between items-center mb-4">
                         <h3 className="font-bold text-gray-900">Atención Requerida</h3>
                         <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full">3 Tareas</span>
                     </div>
                     <div className="space-y-3">
                         <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-300 transition-colors bg-gray-50 cursor-pointer">
                             <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                 TN
                             </div>
                             <div className="flex-1">
                                 <p className="text-sm font-bold text-gray-900">TechNova Solutions</p>
                                 <p className="text-xs text-gray-500">Solicitud de Vendor</p>
                             </div>
                             <button className="text-primary text-xs font-bold hover:underline">Revisar</button>
                         </div>
                         <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-300 transition-colors bg-gray-50 cursor-pointer">
                             <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs">
                                 <span className="material-symbols-outlined text-sm">warning</span>
                             </div>
                             <div className="flex-1">
                                 <p className="text-sm font-bold text-gray-900">Disputa #992</p>
                                 <p className="text-xs text-gray-500">Cliente Corp vs DevStudio</p>
                             </div>
                             <button className="text-primary text-xs font-bold hover:underline">Ver</button>
                         </div>
                     </div>
                 </div>

                 {/* System Health */}
                 <div className="bg-gray-900 p-6 rounded-2xl text-white shadow-lg">
                     <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                         <span className="material-symbols-outlined text-green-400">check_circle</span> 
                         Sistema Operativo
                     </h3>
                     <div className="space-y-4">
                         <div>
                             <div className="flex justify-between text-xs text-gray-400 mb-1">
                                 <span>Uso de API (Gemini)</span>
                                 <span>85%</span>
                             </div>
                             <div className="w-full bg-gray-800 rounded-full h-1.5">
                                 <div className="bg-blue-500 h-1.5 rounded-full" style={{width: '85%'}}></div>
                             </div>
                         </div>
                         <div>
                             <div className="flex justify-between text-xs text-gray-400 mb-1">
                                 <span>Almacenamiento</span>
                                 <span>42%</span>
                             </div>
                             <div className="w-full bg-gray-800 rounded-full h-1.5">
                                 <div className="bg-purple-500 h-1.5 rounded-full" style={{width: '42%'}}></div>
                             </div>
                         </div>
                     </div>
                 </div>
             </div>
         </div>

         {/* Recent Activity Feed */}
         <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
             <div className="flex justify-between items-center mb-6">
                 <h3 className="font-bold text-gray-900">Actividad del Sistema</h3>
                 <button className="text-gray-400 hover:text-gray-900"><span className="material-symbols-outlined">more_horiz</span></button>
             </div>
             <div className="space-y-6 relative pl-4 border-l border-gray-100">
                 <div className="relative">
                     <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white"></div>
                     <p className="text-sm text-gray-900"><span className="font-bold">Pago completado</span>: Proyecto Alpha liberó $5,000 a QuantumLeap AI.</p>
                     <p className="text-xs text-gray-400 mt-0.5">Hace 15 min</p>
                 </div>
                 <div className="relative">
                     <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white"></div>
                     <p className="text-sm text-gray-900"><span className="font-bold">Nuevo usuario</span>: Retail X se registró como Cliente.</p>
                     <p className="text-xs text-gray-400 mt-0.5">Hace 1 hora</p>
                 </div>
                 <div className="relative">
                     <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-gray-300 border-2 border-white"></div>
                     <p className="text-sm text-gray-900"><span className="font-bold">Login fallido</span>: Múltiples intentos desde IP sospechosa (bloqueada).</p>
                     <p className="text-xs text-gray-400 mt-0.5">Hace 3 horas</p>
                 </div>
             </div>
         </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;