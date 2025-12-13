import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');

  // Sparkline simulator
  const Sparkline = ({ color, data }: { color: string, data: number[] }) => (
      <div className="flex items-end gap-1 h-8 w-24">
          {data.map((h, i) => (
              <div key={i} className={`flex-1 rounded-t-sm ${color}`} style={{height: `${h}%`}}></div>
          ))}
      </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6 pb-12">
         {/* Command Center Header */}
         <div className="flex flex-col md:flex-row justify-between items-end gap-4 bg-gray-900 p-6 rounded-2xl text-white shadow-xl">
            <div>
               <div className="flex items-center gap-2 mb-1">
                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                   <span className="text-xs font-bold text-green-400 uppercase tracking-widest">Sistema Operativo</span>
               </div>
               <h1 className="text-2xl font-black tracking-tight">Centro de Mando</h1>
               <p className="text-gray-400 text-sm mt-1">Visión holística de operaciones, finanzas y riesgo.</p>
            </div>
            <div className="flex gap-4 text-right">
                <div>
                    <p className="text-xs text-gray-400 uppercase font-bold">Hora del Servidor</p>
                    <p className="font-mono font-bold text-lg">{new Date().toLocaleTimeString('es-ES', {hour: '2-digit', minute:'2-digit'})} UTC</p>
                </div>
                <div className="w-px bg-gray-700 h-10"></div>
                <div>
                    <p className="text-xs text-gray-400 uppercase font-bold">Usuarios Activos</p>
                    <p className="font-mono font-bold text-lg text-blue-400">842</p>
                </div>
            </div>
         </div>
         
         {/* 1. KEY PERFORMANCE INDICATORS (FINANCE & GROWTH) */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* GMV Card */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group" onClick={() => navigate('/admin/metrics')}>
                <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">GMV (Volumen)</p>
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <span className="material-symbols-outlined text-[10px]">arrow_upward</span> 12%
                    </span>
                </div>
                <div className="flex justify-between items-end">
                    <p className="text-2xl font-black text-gray-900">$142.5k</p>
                    <Sparkline color="bg-green-500" data={[20, 40, 30, 50, 40, 70, 60, 90]} />
                </div>
                <p className="text-[10px] text-gray-400 mt-2">Últimos 30 días</p>
            </div>

            {/* Net Revenue Card */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group" onClick={() => navigate('/admin/metrics')}>
                <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Net Revenue</p>
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <span className="material-symbols-outlined text-[10px]">arrow_upward</span> 8%
                    </span>
                </div>
                <div className="flex justify-between items-end">
                    <p className="text-2xl font-black text-gray-900">$21.3k</p>
                    <Sparkline color="bg-blue-500" data={[10, 20, 25, 20, 40, 45, 60, 55]} />
                </div>
                <p className="text-[10px] text-gray-400 mt-2">Take Rate Promedio: 15%</p>
            </div>

            {/* Liquidity/Matching Card */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group" onClick={() => navigate('/admin/metrics')}>
                <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Liquidez (Match)</p>
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                        Estable
                    </span>
                </div>
                <div className="flex justify-between items-end">
                    <p className="text-2xl font-black text-gray-900">4.2d</p>
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-500">Oferta: <span className="text-green-600">Alta</span></p>
                        <p className="text-[10px] font-bold text-gray-500">Demanda: <span className="text-blue-600">Media</span></p>
                    </div>
                </div>
                <p className="text-[10px] text-gray-400 mt-2">Tiempo promedio de contratación</p>
            </div>

            {/* Risk/Disputes Card */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-red-200" onClick={() => navigate('/admin/disputes')}>
                <div className="flex justify-between items-start mb-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Riesgo / Disputas</p>
                    {2 > 0 && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>}
                </div>
                <div className="flex justify-between items-end">
                    <p className="text-2xl font-black text-gray-900">2</p>
                    <span className="material-symbols-outlined text-3xl text-red-100 group-hover:text-red-500 transition-colors">gavel</span>
                </div>
                <p className="text-[10px] text-red-500 font-bold mt-2">Requieren atención inmediata</p>
            </div>
         </div>

         {/* 2. MAIN DASHBOARD CONTENT */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             
             {/* Left Col: Activity & Feed */}
             <div className="lg:col-span-2 space-y-6">
                 
                 {/* Live Market Activity Map Placeholder */}
                 <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden h-80 relative group">
                     <div className="absolute inset-0 bg-gray-100 bg-[url('https://upload.wikimedia.org/wikipedia/commons/e/ec/World_map_blank_without_borders.svg')] bg-cover bg-center opacity-30"></div>
                     <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
                     
                     <div className="relative z-10 p-6">
                         <div className="flex justify-between">
                             <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                 <span className="material-symbols-outlined text-blue-500">public</span>
                                 Actividad Global en Tiempo Real
                             </h3>
                             <button className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold shadow-sm hover:bg-white">Expandir Mapa</button>
                         </div>
                         
                         {/* Live Blips */}
                         <div className="absolute top-1/2 left-1/4">
                             <span className="absolute w-3 h-3 bg-blue-500 rounded-full animate-ping opacity-75"></span>
                             <span className="relative w-3 h-3 bg-blue-500 rounded-full border-2 border-white block"></span>
                             <div className="absolute mt-2 bg-black/80 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                 Nuevo Proyecto: FinTech (NY)
                             </div>
                         </div>
                         <div className="absolute top-1/3 right-1/3">
                             <span className="absolute w-3 h-3 bg-green-500 rounded-full animate-ping opacity-75 delay-300"></span>
                             <span className="relative w-3 h-3 bg-green-500 rounded-full border-2 border-white block"></span>
                             <div className="absolute mt-2 bg-black/80 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                 Pago Liberado: $5k (Berlin)
                             </div>
                         </div>
                     </div>
                 </div>

                 {/* Recent Transactions / Critical Actions */}
                 <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                     <div className="flex justify-between items-center mb-4">
                         <h3 className="font-bold text-gray-900">Movimientos Recientes</h3>
                         <button className="text-xs font-bold text-primary hover:underline">Ver registro completo</button>
                     </div>
                     <div className="space-y-4">
                         {[
                             { icon: 'payments', color: 'text-green-600 bg-green-50', text: 'Liberación de Fondos', details: 'Proyecto Alpha → QuantumLeap', amount: '$5,000', time: 'Hace 10 min' },
                             { icon: 'person_add', color: 'text-blue-600 bg-blue-50', text: 'Nuevo Vendor Registrado', details: 'AI Vision Labs (Verificación pendiente)', amount: '-', time: 'Hace 45 min' },
                             { icon: 'gavel', color: 'text-red-600 bg-red-50', text: 'Disputa Iniciada', details: 'Cliente Corp reportó retraso', amount: 'Escrow: $12k', time: 'Hace 2 horas' },
                         ].map((item, i) => (
                             <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                                 <div className="flex items-center gap-3">
                                     <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.color}`}>
                                         <span className="material-symbols-outlined text-lg">{item.icon}</span>
                                     </div>
                                     <div>
                                         <p className="text-sm font-bold text-gray-900">{item.text}</p>
                                         <p className="text-xs text-gray-500">{item.details}</p>
                                     </div>
                                 </div>
                                 <div className="text-right">
                                     <p className="text-sm font-bold text-gray-900">{item.amount}</p>
                                     <p className="text-[10px] text-gray-400">{item.time}</p>
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>
             </div>

             {/* Right Col: Health & Tasks */}
             <div className="space-y-6">
                 
                 {/* Platform Health Widget */}
                 <div className="bg-gray-900 text-white rounded-2xl p-6 shadow-lg border border-gray-800">
                     <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                         <span className="material-symbols-outlined text-green-400">dns</span>
                         Salud de Plataforma
                     </h3>
                     <div className="space-y-5">
                         <div>
                             <div className="flex justify-between text-xs text-gray-400 mb-1">
                                 <span>API Latency (Gemini)</span>
                                 <span className="text-green-400">45ms</span>
                             </div>
                             <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                                 <div className="bg-green-500 h-1.5 rounded-full" style={{width: '20%'}}></div>
                             </div>
                         </div>
                         <div>
                             <div className="flex justify-between text-xs text-gray-400 mb-1">
                                 <span>Token Usage (Quota)</span>
                                 <span className="text-yellow-400">78%</span>
                             </div>
                             <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                                 <div className="bg-yellow-500 h-1.5 rounded-full" style={{width: '78%'}}></div>
                             </div>
                         </div>
                         <div>
                             <div className="flex justify-between text-xs text-gray-400 mb-1">
                                 <span>Error Rate (5xx)</span>
                                 <span className="text-green-400">0.02%</span>
                             </div>
                             <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                                 <div className="bg-green-500 h-1.5 rounded-full" style={{width: '2%'}}></div>
                             </div>
                         </div>
                         <div>
                             <div className="flex justify-between text-xs text-gray-400 mb-1">
                                 <span>Live Streams (Concurrent)</span>
                                 <span className="text-blue-400">142</span>
                             </div>
                             <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                                 <div className="bg-blue-500 h-1.5 rounded-full" style={{width: '45%'}}></div>
                             </div>
                         </div>
                     </div>
                 </div>

                 {/* Action Queue */}
                 <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                     <div className="flex justify-between items-center mb-4">
                         <h3 className="font-bold text-gray-900">Cola de Moderación</h3>
                         <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-0.5 rounded-full">3</span>
                     </div>
                     <div className="space-y-2">
                         <div className="p-3 border border-gray-100 rounded-lg hover:border-gray-300 cursor-pointer bg-gray-50" onClick={() => navigate('/admin/users')}>
                             <div className="flex justify-between">
                                 <span className="text-xs font-bold text-gray-500 uppercase">Verificación</span>
                                 <span className="text-[10px] text-gray-400">Hace 2h</span>
                             </div>
                             <p className="font-bold text-sm text-gray-900 mt-1">TechNova Solutions</p>
                             <p className="text-xs text-gray-500">Documentación fiscal pendiente de revisión.</p>
                         </div>
                         <div className="p-3 border border-red-100 bg-red-50/50 rounded-lg hover:border-red-300 cursor-pointer" onClick={() => navigate('/admin/disputes')}>
                             <div className="flex justify-between">
                                 <span className="text-xs font-bold text-red-500 uppercase">Disputa</span>
                                 <span className="text-[10px] text-gray-400">Hace 4h</span>
                             </div>
                             <p className="font-bold text-sm text-gray-900 mt-1">Proyecto Beta</p>
                             <p className="text-xs text-gray-500">Cliente solicita arbitraje.</p>
                         </div>
                     </div>
                 </div>

             </div>
         </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;