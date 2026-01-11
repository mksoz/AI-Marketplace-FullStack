import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { adminDashboardService } from '../../services/adminService';
import toast from 'react-hot-toast';

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();

    // State
    const [stats, setStats] = useState<any>(null);
    const [activity, setActivity] = useState<any[]>([]);
    const [health, setHealth] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Fetch data on mount
    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            const [statsRes, activityRes, healthRes] = await Promise.all([
                adminDashboardService.getStats(),
                adminDashboardService.getActivity(),
                adminDashboardService.getHealth()
            ]);

            setStats(statsRes.data);
            setActivity(activityRes.data);
            setHealth(healthRes.data);
        } catch (error: any) {
            console.error('Error fetching dashboard data:', error);
            toast.error(error.response?.data?.message || 'Error cargando datos del dashboard');
        } finally {
            setLoading(false);
        }
    };

    // Sparkline component
    const Sparkline = ({ color, data }: { color: string, data: number[] }) => (
        <div className="flex items-end gap-1 h-8 w-24">
            {data.map((h, i) => (
                <div key={i} className={`flex-1 rounded-t-sm ${color}`} style={{ height: `${h}%` }}></div>
            ))}
        </div>
    );

    // Loading skeleton
    if (loading) {
        return (
            <AdminLayout>
                <div className="space-y-6 pb-12 animate-pulse">
                    <div className="h-32 bg-gray-200 rounded-2xl"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </AdminLayout>
        );
    }

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
                            <p className="font-mono font-bold text-lg">{new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} UTC</p>
                        </div>
                        <div className="w-px bg-gray-700 h-10"></div>
                        <div>
                            <p className="text-xs text-gray-400 uppercase font-bold">Usuarios Activos</p>
                            <p className="font-mono font-bold text-lg text-blue-400">{stats?.activeUsers || 0}</p>
                        </div>
                    </div>
                </div>

                {/* KEY PERFORMANCE INDICATORS */}
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
                            <p className="text-2xl font-black text-gray-900">
                                ${stats?.gmv ? (stats.gmv / 1000).toFixed(1) : 0}k
                            </p>
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
                            <p className="text-2xl font-black text-gray-900">
                                ${stats?.netRevenue ? (stats.netRevenue / 1000).toFixed(1) : 0}k
                            </p>
                            <Sparkline color="bg-blue-500" data={[10, 20, 25, 20, 40, 45, 60, 55]} />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2">Take Rate Promedio: 15%</p>
                    </div>

                    {/* Liquidity Card */}
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group" onClick={() => navigate('/admin/metrics')}>
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Liquidez (Match)</p>
                            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                Estable
                            </span>
                        </div>
                        <div className="flex justify-between items-end">
                            <p className="text-2xl font-black text-gray-900">
                                {stats?.liquidity ? stats.liquidity.toFixed(1) : 0}d
                            </p>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-gray-500">Oferta: <span className="text-green-600">Alta</span></p>
                                <p className="text-[10px] font-bold text-gray-500">Demanda: <span className="text-blue-600">Media</span></p>
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2">Tiempo promedio de contratación</p>
                    </div>

                    {/* Risk/Disputes Card */}
                    <div
                        className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:border-red-200"
                        onClick={() => navigate('/admin/disputes')}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Riesgo / Disputas</p>
                            {(stats?.openDisputes || 0) > 0 && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>}
                        </div>
                        <div className="flex justify-between items-end">
                            <p className="text-2xl font-black text-gray-900">{stats?.openDisputes || 0}</p>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-gray-500">Críticas: <span className="text-red-600">0</span></p>
                                <p className="text-[10px] font-bold text-gray-500">Moderadas: <span className="text-orange-500">{stats?.openDisputes || 0}</span></p>
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2">Disputas abiertas o pendientes</p>
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Activity */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-blue-600">history</span>
                                    Actividad Reciente
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">Acciones administrativas últimas 24h</p>
                            </div>
                            <button
                                onClick={() => navigate('/admin/settings')}
                                className="text-xs text-primary hover:underline font-bold"
                            >
                                Ver Todo
                            </button>
                        </div>

                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {activity.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-8">No hay actividad reciente</p>
                            ) : (
                                activity.slice(0, 10).map((action: any, i: number) => (
                                    <div key={i} className="flex gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                            <span className="material-symbols-outlined text-sm text-gray-600">
                                                {action.type.includes('USER') ? 'person' :
                                                    action.type.includes('PROJECT') ? 'folder' :
                                                        action.type.includes('DISPUTE') ? 'gavel' : 'settings'}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-gray-900 truncate">{action.details}</p>
                                            <p className="text-[10px] text-gray-500">
                                                Por: {action.admin?.user?.email || 'Admin'} • {new Date(action.createdAt).toLocaleString('es-ES')}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Platform Health */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="material-symbols-outlined text-green-600">check_circle</span>
                            <h3 className="font-bold text-gray-900">Salud de la Plataforma</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <p className="text-xs font-bold text-gray-600">API Latency</p>
                                    <p className="text-xs font-mono text-green-600">{health?.apiLatency?.toFixed(0) || 0}ms</p>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <p className="text-xs font-bold text-gray-600">Error Rate</p>
                                    <p className="text-xs font-mono text-green-600">{health?.errorRate?.toFixed(2) || 0}%</p>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '5%' }}></div>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <p className="text-xs font-bold text-gray-600">Database Status</p>
                                    <p className="text-xs font-bold text-green-600">● Healthy</p>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <p className="text-xs font-bold text-gray-600">Active Connections</p>
                                    <p className="text-xs font-mono text-blue-600">{health?.activeConnections || 0}</p>
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