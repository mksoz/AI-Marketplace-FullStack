import React, { useState, useEffect, useMemo } from 'react';
import { useToast } from '../../contexts/ToastContext';
import AdminLayout from '../../components/AdminLayout';
import Modal from '../../components/Modal';
import { DisputeFull, DisputeListItem, DisputeFilters, DisputeStats, ViewMode } from '../../types/dispute';
import {
    formatDisputeAmount,
    getStatusColor,
    getStatusText,
    getResolutionText,
    formatRelativeTime,
    formatEvidenceSize,
    getFileIcon
} from '../../utils/dispute.utils';

// API Configuration
const API_BASE_URL = 'http://localhost:8000';

const AdminDisputes: React.FC = () => {
    const { showToast } = useToast();

    // State
    const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
    const [selectedDispute, setSelectedDispute] = useState<DisputeFull | null>(null);
    const [resolutionType, setResolutionType] = useState<'REFUND_CLIENT' | 'RELEASE_VENDOR' | 'SPLIT_CUSTOM' | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('card');

    // Data State
    const [disputes, setDisputes] = useState<DisputeListItem[]>([]);
    const [stats, setStats] = useState<DisputeStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter State
    const [filters, setFilters] = useState<DisputeFilters>({
        status: 'all',
        sortBy: 'newest',
        page: 1,
        limit: 20
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [historyFilter, setHistoryFilter] = useState('all');

    // Active Disputes Filters
    const [statusFilter, setStatusFilter] = useState<'all' | 'OPEN' | 'IN_PROGRESS'>('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Split Logic State
    const [splitClient, setSplitClient] = useState(0);
    const [splitVendor, setSplitVendor] = useState(0);
    const [resolutionNotes, setResolutionNotes] = useState('');

    // Confirmation Modal State
    const [showReviewConfirm, setShowReviewConfirm] = useState(false);

    // Fetch disputes
    useEffect(() => {
        fetchDisputes();
        fetchStats();
    }, [filters, activeTab]);

    const fetchDisputes = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('token');
            const queryParams = new URLSearchParams();

            // Filter by active/history
            if (activeTab === 'active') {
                queryParams.append('status', 'OPEN,IN_PROGRESS,INVESTIGATING');
            } else {
                queryParams.append('status', 'RESOLVED,CANCELLED');
            }

            if (filters.search) queryParams.append('search', filters.search);
            if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
            if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom.toString());
            if (filters.dateTo) queryParams.append('dateTo', filters.dateTo.toString());
            if (filters.amountMin) queryParams.append('amountMin', filters.amountMin.toString());
            if (filters.amountMax) queryParams.append('amountMax', filters.amountMax.toString());
            queryParams.append('page', filters.page?.toString() || '1');
            queryParams.append('limit', filters.limit?.toString() || '20');

            const response = await fetch(`${API_BASE_URL}/api/admin/disputes?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Error al cargar disputas');

            const data = await response.json();
            setDisputes(data.disputes || []);
        } catch (err) {
            console.error('Error fetching disputes:', err);
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/admin/disputes/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Error al cargar estadísticas');

            const data = await response.json();
            setStats(data);
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    const fetchDisputeDetail = async (id: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/admin/disputes/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Error al cargar detalles');

            const data = await response.json();
            setSelectedDispute(data);
            setSplitClient(0);
            setSplitVendor(0);
            setResolutionType(null);
            setResolutionNotes('');
        } catch (err) {
            console.error('Error fetching dispute detail:', err);
            showToast('Error al cargar detalles de la disputa', 'error');
        }
    };

    const handleSplitChange = (who: 'client' | 'vendor', value: string) => {
        const val = parseInt(value) || 0;
        if (!selectedDispute) return;

        const max = Number(selectedDispute.amount);

        if (who === 'client') {
            const newClient = Math.min(val, max);
            setSplitClient(newClient);
            setSplitVendor(max - newClient);
        } else {
            const newVendor = Math.min(val, max);
            setSplitVendor(newVendor);
            setSplitClient(max - newVendor);
        }
    };

    const handleResolve = async () => {
        if (!selectedDispute || !resolutionType) return;

        try {
            const token = localStorage.getItem('token');
            const body: any = {
                resolution: resolutionType,
                resolutionNotes
            };

            if (resolutionType === 'SPLIT_CUSTOM') {
                body.splitClient = splitClient;
                body.splitVendor = splitVendor;
            }

            const response = await fetch(`${API_BASE_URL}/api/admin/disputes/${selectedDispute.id}/resolve`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) throw new Error('Error al resolver disputa');

            showToast('Disputa resuelta exitosamente', 'success');
            setSelectedDispute(null);
            setResolutionType(null);
            fetchDisputes();
            fetchStats();
        } catch (err) {
            console.error('Error resolving dispute:', err);
            showToast('Error al resolver la disputa', 'error');
        }
    };

    const handleStartReview = async () => {
        if (!selectedDispute) return;

        setShowReviewConfirm(true);
    };

    const confirmStartReview = async () => {
        if (!selectedDispute) return;

        setShowReviewConfirm(false);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/admin/disputes/${selectedDispute.id}/review`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            });

            if (!response.ok) throw new Error('Error al iniciar revisión');

            const data = await response.json();
            showToast(`Revisión iniciada. ${data.incidentsUpdated} incidencia(s) actualizada(s).`, 'success');

            // Reload dispute detail
            await fetchDisputeDetail(selectedDispute.id);
            fetchDisputes();
            fetchStats();
        } catch (err) {
            console.error('Error starting review:', err);
            showToast('Error al iniciar la revisión', 'error');
        }
    };


    // Filter active/resolved disputes with status and date filters
    const activeDisputes = useMemo(() => {
        let filtered = disputes.filter(d =>
            d.status === 'OPEN' || d.status === 'IN_PROGRESS' || d.status === 'INVESTIGATING'
        );

        // Apply status filter
        if (statusFilter !== 'all') {
            if (statusFilter === 'IN_PROGRESS') {
                filtered = filtered.filter(d => d.status === 'IN_PROGRESS' || d.status === 'INVESTIGATING');
            } else {
                filtered = filtered.filter(d => d.status === statusFilter);
            }
        }

        // Apply date range filter
        if (dateFrom) {
            const fromDate = new Date(dateFrom);
            fromDate.setHours(0, 0, 0, 0);
            filtered = filtered.filter(d => new Date(d.createdAt) >= fromDate);
        }
        if (dateTo) {
            const toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter(d => new Date(d.createdAt) <= toDate);
        }

        return filtered;
    }, [disputes, statusFilter, dateFrom, dateTo]);

    const resolvedDisputes = disputes.filter(d =>
        d.status === 'RESOLVED' || d.status === 'CANCELLED'
    );


    // Apply history filters
    const filteredHistory = useMemo(() => {
        return resolvedDisputes.filter(d => {
            const matchesSearch = searchQuery === '' ||
                d.project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                d.id.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter = historyFilter === 'all' || d.resolution === historyFilter;
            return matchesSearch && matchesFilter;
        });
    }, [resolvedDisputes, searchQuery, historyFilter]);

    return (
        <AdminLayout>
            <div className="space-y-8">
                {/* Header with Stats */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Centro de Resolución</h1>
                        <p className="text-gray-500 mt-1">Gestión de conflictos potenciada por IA.</p>
                    </div>

                    {/* Quick Stats */}
                    {stats && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-center">
                                <p className="text-2xl font-black text-red-600">{stats.totalActive}</p>
                                <p className="text-xs text-red-700 font-bold uppercase">Activas</p>
                            </div>
                            <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-center">
                                <p className="text-2xl font-black text-green-600">{stats.totalResolved}</p>
                                <p className="text-xs text-green-700 font-bold uppercase">Resueltas</p>
                            </div>
                            <div className="bg-orange-50 border border-orange-100 rounded-lg p-3 text-center">
                                <p className="text-lg font-black text-orange-600">{formatDisputeAmount(stats.totalAmountDisputed)}</p>
                                <p className="text-xs text-orange-700 font-bold uppercase">En Disputa</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Filters for Active Disputes */}
                {activeTab === 'active' && (
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Status Filter Buttons */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setStatusFilter('all')}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${statusFilter === 'all'
                                        ? 'bg-gray-900 text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    Todas
                                </button>
                                <button
                                    onClick={() => setStatusFilter('OPEN')}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${statusFilter === 'OPEN'
                                        ? 'bg-red-600 text-white shadow-sm'
                                        : 'bg-red-50 text-red-600 hover:bg-red-100'
                                        }`}
                                >
                                    Nuevas
                                </button>
                                <button
                                    onClick={() => setStatusFilter('IN_PROGRESS')}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${statusFilter === 'IN_PROGRESS'
                                        ? 'bg-blue-600 text-white shadow-sm'
                                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                        }`}
                                >
                                    En Revisión
                                </button>
                            </div>

                            {/* Date Range Filters */}
                            <div className="flex gap-2 items-center">
                                <label className="text-sm font-medium text-gray-600">Desde:</label>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                                <label className="text-sm font-medium text-gray-600">Hasta:</label>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                                {(dateFrom || dateTo) && (
                                    <button
                                        onClick={() => { setDateFrom(''); setDateTo(''); }}
                                        className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                                    >
                                        Limpiar
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabs and View Modes */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    {/* Tabs */}
                    <div className="bg-white p-1 rounded-lg border border-gray-200 flex">
                        <button
                            onClick={() => setActiveTab('active')}
                            className={`px-4 py-2 text-sm font-bold rounded-md transition-all flex items-center gap-2 ${activeTab === 'active' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            <span className="material-symbols-outlined text-lg">gavel</span>
                            Activas ({activeDisputes.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`px-4 py-2 text-sm font-bold rounded-md transition-all flex items-center gap-2 ${activeTab === 'history' ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            <span className="material-symbols-outlined text-lg">history</span>
                            Histórico
                        </button>
                    </div>

                    {/* View Mode Toggles (only for active) */}
                    {activeTab === 'active' && (
                        <div className="bg-white p-1 rounded-lg border border-gray-200 flex">
                            <button
                                onClick={() => setViewMode('card')}
                                className={`px-3 py-2 rounded-md transition-all ${viewMode === 'card' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                                title="Vista de Tarjetas"
                            >
                                <span className="material-symbols-outlined text-lg">view_agenda</span>
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-3 py-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                                title="Vista de Lista"
                            >
                                <span className="material-symbols-outlined text-lg">view_list</span>
                            </button>
                            <button
                                onClick={() => setViewMode('kanban')}
                                className={`px-3 py-2 rounded-md transition-all ${viewMode === 'kanban' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                                title="Vista Kanban"
                            >
                                <span className="material-symbols-outlined text-lg">view_kanban</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                        <p className="text-red-700 font-medium">{error}</p>
                        <button
                            onClick={fetchDisputes}
                            className="mt-2 text-sm text-red-600 hover:underline font-bold"
                        >
                            Reintentar
                        </button>
                    </div>
                )}

                {/* ACTIVE DISPUTES VIEW */}
                {!loading && activeTab === 'active' && (
                    <>
                        {activeDisputes.length === 0 ? (
                            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                                <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">check_circle</span>
                                <p className="text-gray-500 font-medium">No hay disputas activas</p>
                            </div>
                        ) : viewMode === 'card' ? (
                            <div className="grid grid-cols-1 gap-6 animate-in fade-in duration-300">
                                {activeDisputes.map(dispute => (
                                    <div key={dispute.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-card transition-shadow">
                                        <div className="p-6 flex flex-col md:flex-row gap-6">
                                            {/* Left Info */}
                                            <div className="flex-1 space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getStatusColor(dispute.status)}`}>
                                                        {getStatusText(dispute.status)}
                                                    </span>
                                                    <span className="text-sm text-gray-500 font-mono">{dispute.id}</span>
                                                    <span className="text-sm text-gray-400">• {formatRelativeTime(dispute.createdAt)}</span>
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900">Disputa #{dispute.id.substring(0, 8)}</h3>
                                                    <p className="text-sm text-gray-500 mt-1">Proyecto: <span className="font-medium text-gray-700">{dispute.project.title}</span></p>
                                                    <p className="text-sm text-gray-500">Milestone: <span className="font-medium text-gray-700">{dispute.milestoneTitle}</span></p>
                                                </div>
                                                <div className="flex items-center gap-8 text-sm">
                                                    <div>
                                                        <p className="text-xs text-gray-400 uppercase font-bold">Demandante</p>
                                                        <p className="font-bold text-gray-800">
                                                            {dispute.plaintiffUser?.email || 'Desconocido'}
                                                        </p>
                                                        <p className="text-xs text-gray-500">{dispute.plaintiffUser?.role}</p>
                                                    </div>
                                                    <div className="text-gray-300">vs</div>
                                                    <div>
                                                        <p className="text-xs text-gray-400 uppercase font-bold">Demandado</p>
                                                        <p className="font-bold text-gray-800">
                                                            {dispute.defendantUser?.email || 'Desconocido'}
                                                        </p>
                                                        <p className="text-xs text-gray-500">{dispute.defendantUser?.role}</p>
                                                    </div>
                                                </div>

                                                {/* AI Summary Box (Placeholder for future) */}
                                                {dispute.aiSentiment && (
                                                    <div className="flex items-start gap-3 bg-gradient-to-r from-purple-50 to-white p-3 rounded-lg border border-purple-100">
                                                        <span className="material-symbols-outlined text-purple-600 mt-0.5">smart_toy</span>
                                                        <div>
                                                            <p className="text-xs font-bold text-purple-700 uppercase mb-0.5">Sugerencia del Agente</p>
                                                            <p className="text-sm text-gray-700 leading-snug">{dispute.aiRecommendation || 'Análisis pendiente...'}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Right Actions & Amount */}
                                            <div className="flex flex-col justify-between items-end border-l border-gray-100 pl-6 min-w-[200px]">
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-500 uppercase font-bold mb-1">Monto en Disputa</p>
                                                    <p className="text-2xl font-black text-gray-900">{formatDisputeAmount(dispute.amount)}</p>
                                                    <p className="text-xs text-green-600 font-medium flex items-center justify-end gap-1">
                                                        <span className="material-symbols-outlined text-sm">lock</span> Protegido en Escrow
                                                    </p>
                                                    {dispute.evidenceFiles && dispute.evidenceFiles.length > 0 && (
                                                        <p className="text-xs text-gray-500 mt-2">
                                                            {dispute.evidenceFiles.length} archivo{dispute.evidenceFiles.length > 1 ? 's' : ''} de evidencia
                                                        </p>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => fetchDisputeDetail(dispute.id)}
                                                    className="bg-dark text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-black transition-colors shadow-lg shadow-gray-200 flex items-center gap-2 mt-4"
                                                >
                                                    Gestión de Caso <span className="material-symbols-outlined text-sm">gavel</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : viewMode === 'list' ? (
                            /* List View */
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Estado</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Caso</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Partes</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Monto</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Fecha</th>
                                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {activeDisputes.map(dispute => (
                                            <tr key={dispute.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getStatusColor(dispute.status)}`}>
                                                        {getStatusText(dispute.status)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-gray-900 text-sm">{dispute.project.title}</span>
                                                        <span className="text-xs text-gray-500">{dispute.id}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <div className="text-gray-700">
                                                        {dispute.plaintiffUser?.email?.split('@')[0]} vs {dispute.defendantUser?.email?.split('@')[0]}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-gray-900">{formatDisputeAmount(dispute.amount)}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">{formatRelativeTime(dispute.createdAt)}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => fetchDisputeDetail(dispute.id)}
                                                        className="text-primary hover:underline text-xs font-bold"
                                                    >
                                                        Gestionar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            /* Kanban View */
                            <div className="overflow-x-auto pb-4">
                                <div className="flex gap-6 min-w-max">
                                    {/* NUEVAS Column */}
                                    <div className="w-80 flex-shrink-0">
                                        <div className="bg-red-50 border border-red-200 rounded-t-xl p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-red-600">new_releases</span>
                                                <h3 className="font-bold text-red-900">Nuevas</h3>
                                            </div>
                                            <span className="px-2 py-1 bg-red-600 text-white rounded-full text-xs font-bold">
                                                {activeDisputes.filter(d => d.status === 'OPEN').length}
                                            </span>
                                        </div>
                                        <div className="bg-red-50/30 border-x border-b border-red-200 rounded-b-xl p-4 space-y-3 min-h-[400px]">
                                            {activeDisputes.filter(d => d.status === 'OPEN').length > 0 ? (
                                                activeDisputes.filter(d => d.status === 'OPEN').map(dispute => (
                                                    <div
                                                        key={dispute.id}
                                                        onClick={() => fetchDisputeDetail(dispute.id)}
                                                        className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-xs font-mono text-gray-500">#{dispute.id.substring(0, 8)}</span>
                                                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded">NUEVA</span>
                                                        </div>
                                                        <h4 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2">{dispute.project.title}</h4>
                                                        <p className="text-xs text-gray-500 mb-2">Milestone: {dispute.milestoneTitle}</p>
                                                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                                            <span className="text-xs text-gray-400">{formatRelativeTime(dispute.createdAt)}</span>
                                                            <span className="text-sm font-black text-gray-900">{formatDisputeAmount(dispute.amount)}</span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center text-gray-400 py-8">
                                                    <span className="material-symbols-outlined text-4xl mb-2">check_circle</span>
                                                    <p className="text-xs">Sin disputas nuevas</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* EN REVISIÓN Column */}
                                    <div className="w-80 flex-shrink-0">
                                        <div className="bg-blue-50 border border-blue-200 rounded-t-xl p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-blue-600">rate_review</span>
                                                <h3 className="font-bold text-blue-900">En Revisión</h3>
                                            </div>
                                            <span className="px-2 py-1 bg-blue-600 text-white rounded-full text-xs font-bold">
                                                {activeDisputes.filter(d => d.status === 'IN_PROGRESS' || d.status === 'INVESTIGATING').length}
                                            </span>
                                        </div>
                                        <div className="bg-blue-50/30 border-x border-b border-blue-200 rounded-b-xl p-4 space-y-3 min-h-[400px]">
                                            {activeDisputes.filter(d => d.status === 'IN_PROGRESS' || d.status === 'INVESTIGATING').length > 0 ? (
                                                activeDisputes.filter(d => d.status === 'IN_PROGRESS' || d.status === 'INVESTIGATING').map(dispute => (
                                                    <div
                                                        key={dispute.id}
                                                        onClick={() => fetchDisputeDetail(dispute.id)}
                                                        className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-xs font-mono text-gray-500">#{dispute.id.substring(0, 8)}</span>
                                                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded">
                                                                {dispute.status === 'IN_PROGRESS' ? 'REVISIÓN' : 'INVESTIGANDO'}
                                                            </span>
                                                        </div>
                                                        <h4 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2">{dispute.project.title}</h4>
                                                        <p className="text-xs text-gray-500 mb-2">Milestone: {dispute.milestoneTitle}</p>
                                                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                                            <span className="text-xs text-gray-400">{formatRelativeTime(dispute.createdAt)}</span>
                                                            <span className="text-sm font-black text-gray-900">{formatDisputeAmount(dispute.amount)}</span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center text-gray-400 py-8">
                                                    <span className="material-symbols-outlined text-4xl mb-2">pending</span>
                                                    <p className="text-xs">Sin disputas en revisión</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* FINALIZADAS Column */}
                                    <div className="w-80 flex-shrink-0">
                                        <div className="bg-green-50 border border-green-200 rounded-t-xl p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-green-600">task_alt</span>
                                                <h3 className="font-bold text-green-900">Finalizadas</h3>
                                            </div>
                                            <span className="px-2 py-1 bg-green-600 text-white rounded-full text-xs font-bold">
                                                {resolvedDisputes.filter(d => d.status === 'RESOLVED').length}
                                            </span>
                                        </div>
                                        <div className="bg-green-50/30 border-x border-b border-green-200 rounded-b-xl p-4 space-y-3 min-h-[400px]">
                                            {resolvedDisputes.filter(d => d.status === 'RESOLVED').length > 0 ? (
                                                resolvedDisputes.filter(d => d.status === 'RESOLVED').slice(0, 10).map(dispute => (
                                                    <div
                                                        key={dispute.id}
                                                        onClick={() => fetchDisputeDetail(dispute.id)}
                                                        className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-xs font-mono text-gray-500">#{dispute.id.substring(0, 8)}</span>
                                                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded">RESUELTA</span>
                                                        </div>
                                                        <h4 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2">{dispute.project.title}</h4>
                                                        <p className="text-xs text-gray-500 mb-2">
                                                            {dispute.resolution === 'REFUND_CLIENT' ? 'Reembolso' :
                                                                dispute.resolution === 'RELEASE_VENDOR' ? 'Liberación' : 'Split'}
                                                        </p>
                                                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                                            <span className="text-xs text-gray-400">{formatRelativeTime(dispute.resolvedAt || dispute.createdAt)}</span>
                                                            <span className="text-sm font-black text-gray-900">{formatDisputeAmount(dispute.amount)}</span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center text-gray-400 py-8">
                                                    <span className="material-symbols-outlined text-4xl mb-2">hourglass_empty</span>
                                                    <p className="text-xs">Sin disputas finalizadas</p>
                                                </div>
                                            )}
                                            {resolvedDisputes.filter(d => d.status === 'RESOLVED').length > 10 && (
                                                <div className="text-center">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveTab('history');
                                                        }}
                                                        className="text-xs text-green-600 hover:underline font-bold"
                                                    >
                                                        Ver todas ({resolvedDisputes.filter(d => d.status === 'RESOLVED').length})
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* CANCELADAS Column */}
                                    <div className="w-80 flex-shrink-0">
                                        <div className="bg-gray-50 border border-gray-200 rounded-t-xl p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-gray-600">cancel</span>
                                                <h3 className="font-bold text-gray-900">Canceladas</h3>
                                            </div>
                                            <span className="px-2 py-1 bg-gray-600 text-white rounded-full text-xs font-bold">
                                                {resolvedDisputes.filter(d => d.status === 'CANCELLED').length}
                                            </span>
                                        </div>
                                        <div className="bg-gray-50/30 border-x border-b border-gray-200 rounded-b-xl p-4 space-y-3 min-h-[400px]">
                                            {resolvedDisputes.filter(d => d.status === 'CANCELLED').length > 0 ? (
                                                resolvedDisputes.filter(d => d.status === 'CANCELLED').slice(0, 10).map(dispute => (
                                                    <div
                                                        key={dispute.id}
                                                        onClick={() => fetchDisputeDetail(dispute.id)}
                                                        className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
                                                    >
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-xs font-mono text-gray-500">#{dispute.id.substring(0, 8)}</span>
                                                            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-bold rounded">CANCELADA</span>
                                                        </div>
                                                        <h4 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2">{dispute.project.title}</h4>
                                                        <p className="text-xs text-gray-500 mb-2">Milestone: {dispute.milestoneTitle}</p>
                                                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                                            <span className="text-xs text-gray-400">{formatRelativeTime(dispute.createdAt)}</span>
                                                            <span className="text-sm font-black text-gray-900">{formatDisputeAmount(dispute.amount)}</span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center text-gray-400 py-8">
                                                    <span className="material-symbols-outlined text-4xl mb-2">check</span>
                                                    <p className="text-xs">Sin disputas canceladas</p>
                                                </div>
                                            )}
                                            {resolvedDisputes.filter(d => d.status === 'CANCELLED').length > 10 && (
                                                <div className="text-center">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveTab('history');
                                                        }}
                                                        className="text-xs text-gray-600 hover:underline font-bold"
                                                    >
                                                        Ver todas ({resolvedDisputes.filter(d => d.status === 'CANCELLED').length})
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* HISTORY VIEW */}
                {!loading && activeTab === 'history' && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        {/* History Filters */}
                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex gap-4">
                            <div className="relative flex-1">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                                <input
                                    type="text"
                                    placeholder="Buscar por ID, Proyecto..."
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <select
                                className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium outline-none cursor-pointer"
                                value={historyFilter}
                                onChange={(e) => setHistoryFilter(e.target.value)}
                            >
                                <option value="all">Todas las resoluciones</option>
                                <option value="REFUND_CLIENT">Reembolsos</option>
                                <option value="RELEASE_VENDOR">Liberaciones</option>
                                <option value="SPLIT_CUSTOM">Splits (Arbitraje)</option>
                            </select>
                        </div>

                        {/* History Table */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Caso</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Monto</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Resolución</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Fecha Cierre</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Detalles</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredHistory.length > 0 ? (
                                        filteredHistory.map(dispute => (
                                            <tr key={dispute.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-gray-900 text-sm">{dispute.project.title}</span>
                                                        <span className="text-xs text-gray-500">{dispute.id}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-gray-900">{formatDisputeAmount(dispute.amount)}</td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 rounded text-xs font-bold uppercase bg-gray-100 text-gray-700">
                                                        {getResolutionText(dispute.resolution)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {dispute.resolvedAt ? formatRelativeTime(dispute.resolvedAt) : '-'}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => fetchDisputeDetail(dispute.id)}
                                                        className="text-primary hover:underline text-xs font-bold"
                                                    >
                                                        Ver Archivo
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                                No se encontraron resoluciones.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* DETAILED RESOLUTION MODAL */}
            <Modal isOpen={!!selectedDispute} onClose={() => setSelectedDispute(null)} title={`Gestión de Disputa ${selectedDispute?.id}`} size="4xl">
                {selectedDispute && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* LEFT COLUMN: Case Details & Evidence */}
                        <div className="space-y-6">
                            {/* Case Header */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <h3 className="font-bold text-gray-900 text-lg mb-2">Disputa #{selectedDispute.id.substring(0, 12)}</h3>
                                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                                    Proyecto: {selectedDispute.project.title}<br />
                                    Milestone: {selectedDispute.milestoneTitle}<br />
                                    Monto: {formatDisputeAmount(selectedDispute.amount)}
                                </p>

                                <div className="flex gap-4">
                                    <div className="bg-white px-3 py-2 rounded-lg border border-gray-200 text-sm flex-1">
                                        <span className="block text-xs text-gray-400 font-bold uppercase">Demandante</span>
                                        <span className="font-bold text-gray-800">{selectedDispute.plaintiffUser?.email}</span>
                                    </div>
                                    <div className="bg-white px-3 py-2 rounded-lg border border-gray-200 text-sm flex-1">
                                        <span className="block text-xs text-gray-400 font-bold uppercase">Demandado</span>
                                        <span className="font-bold text-gray-800">{selectedDispute.defendantUser?.email}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Vendor Observation - Collapsible */}
                            {selectedDispute.vendorComment && (
                                <details className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                    <summary className="cursor-pointer px-4 py-3 font-medium text-gray-900 hover:bg-gray-50 flex items-center justify-between">
                                        <span className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-gray-400 text-sm">comment</span>
                                            Observaciones Adicionales
                                        </span>
                                        <span className="material-symbols-outlined text-gray-400 text-sm">expand_more</span>
                                    </summary>
                                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                                        <p className="text-sm text-gray-700 leading-relaxed">{selectedDispute.vendorComment}</p>
                                    </div>
                                </details>
                            )}

                            {/* Review History - Collapsible */}
                            {selectedDispute.milestone?.reviews && selectedDispute.milestone.reviews.length > 0 && (
                                <details className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                    <summary className="cursor-pointer px-4 py-3 font-medium text-gray-900 hover:bg-gray-50 flex items-center justify-between">
                                        <span className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-gray-400 text-sm">history</span>
                                            Historial de Revisiones ({selectedDispute.milestone.reviews.length})
                                        </span>
                                        <span className="material-symbols-outlined text-gray-400 text-sm">expand_more</span>
                                    </summary>
                                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 space-y-3">
                                        {selectedDispute.milestone.reviews.map((review: any, i: number) => (
                                            <div key={review.id || i} className="border-l-2 border-blue-300 pl-4 py-2">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs font-bold text-gray-900 uppercase">
                                                        {review.reviewer?.role === 'CLIENT' ? 'Cliente' : 'Vendor'}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(review.createdAt).toLocaleDateString('es-ES', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-700">{review.comment || 'Sin comentario'}</p>
                                                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold ${review.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                    review.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {review.status === 'APPROVED' ? 'Aprobado' : review.status === 'REJECTED' ? 'Rechazado' : 'Disputado'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </details>
                            )}

                            {/* Deliverables (Evidence) - Collapsible */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-900 uppercase mb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-gray-400">folder_open</span>
                                    Entregables del Hito
                                </h4>
                                <div className="space-y-2">
                                    {selectedDispute.milestone?.deliverableFolders && selectedDispute.milestone.deliverableFolders.length > 0 ? (
                                        selectedDispute.milestone.deliverableFolders.map((folder: any) => (
                                            <details key={folder.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                                <summary className="cursor-pointer bg-gray-50 px-3 py-2 hover:bg-gray-100 flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-blue-600 text-sm">folder</span>
                                                    <span className="font-bold text-sm text-gray-900 flex-1">{folder.name}</span>
                                                    <span className="text-xs text-gray-500 mr-2">
                                                        {folder.totalFiles || 0} archivo{(folder.totalFiles || 0) !== 1 ? 's' : ''}
                                                    </span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            // TODO: Implement ZIP download
                                                            showToast(`Descarga de ZIP para carpeta "${folder.name}" - Funcionalidad pendiente`, 'info');
                                                        }}
                                                        className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 flex items-center gap-1"
                                                        title="Descargar carpeta como ZIP"
                                                    >
                                                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>download</span>
                                                        ZIP
                                                    </button>
                                                    <span className="material-symbols-outlined text-gray-400 text-sm">expand_more</span>
                                                </summary>
                                                {folder.files && folder.files.length > 0 ? (
                                                    <div className="divide-y divide-gray-100 bg-white">
                                                        {folder.files.map((file: any) => (
                                                            <div key={file.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 cursor-pointer transition-colors group">
                                                                <div className="w-6 h-6 bg-blue-50 text-blue-600 rounded flex items-center justify-center group-hover:bg-blue-100">
                                                                    <span className="material-symbols-outlined text-sm">{getFileIcon(file.mimeType)}</span>
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs text-gray-700 font-medium truncate">{file.originalName || file.filename}</p>
                                                                    <p className="text-xs text-gray-400">{formatEvidenceSize(Number(file.fileSize))}</p>
                                                                </div>
                                                                <span className="material-symbols-outlined text-sm text-gray-300 group-hover:text-gray-500">download</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-gray-500 italic p-3 bg-white">Sin archivos</p>
                                                )}
                                            </details>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">No hay entregables en este hito</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: AI Analysis & Resolution */}
                        <div className="space-y-6">

                            {/* AI FORENSIC REPORT */}
                            <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-xl p-5 shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
                                        <span className="material-symbols-outlined text-xl">smart_toy</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-indigo-900">Análisis Forense IA</h4>
                                        <p className="text-xs text-indigo-600 font-medium">
                                            {selectedDispute.aiConfidence ? `Nivel de Confianza: ${selectedDispute.aiConfidence}%` : 'Análisis pendiente'}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4 text-sm">
                                    {selectedDispute.aiRecommendation ? (
                                        <>
                                            <div>
                                                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Recomendación</p>
                                                <p className="text-gray-700 leading-relaxed">{selectedDispute.aiRecommendation}</p>
                                            </div>
                                            <div className="flex items-center justify-between pt-2 border-t border-indigo-100">
                                                <span className="text-gray-500 font-medium">Sentimiento:</span>
                                                <span className="font-bold text-indigo-700 bg-indigo-100 px-3 py-1 rounded-full text-xs uppercase">
                                                    {selectedDispute.aiSentiment || 'N/A'}
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="text-gray-500 italic text-center py-4">
                                            El análisis de IA estará disponible próximamente
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Resolution Console */}
                            {selectedDispute.status === 'OPEN' ? (
                                <div className="border-t border-gray-200 pt-6">
                                    <h4 className="text-sm font-bold text-gray-900 uppercase mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-gray-400">visibility</span>
                                        Acción Requerida
                                    </h4>
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                                        <div className="flex items-start gap-3 mb-4">
                                            <span className="material-symbols-outlined text-blue-600 text-2xl">info</span>
                                            <div>
                                                <p className="font-bold text-blue-900">Disputa Nueva</p>
                                                <p className="text-sm text-blue-700 mt-1">
                                                    Esta disputa requiere revisión antes de poder aplicar resoluciones.
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleStartReview}
                                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-lg flex items-center justify-center gap-2"
                                        >
                                            <span className="material-symbols-outlined">play_arrow</span>
                                            Revisar Disputa
                                        </button>
                                    </div>
                                </div>
                            ) : selectedDispute.status === 'IN_PROGRESS' || selectedDispute.status === 'INVESTIGATING' ? (
                                <div className="border-t border-gray-200 pt-6">
                                    <h4 className="text-sm font-bold text-gray-900 uppercase mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-gray-400">balance</span>
                                        Consola de Resolución
                                    </h4>

                                    {!resolutionType ? (
                                        <div className="grid grid-cols-3 gap-3">
                                            <button
                                                onClick={() => {
                                                    setResolutionType('REFUND_CLIENT');
                                                    setSplitClient(Number(selectedDispute.amount));
                                                    setSplitVendor(0);
                                                }}
                                                className="p-3 border border-gray-200 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all text-center group"
                                            >
                                                <span className="material-symbols-outlined text-red-500 mb-1 group-hover:scale-110 transition-transform block text-2xl">undo</span>
                                                <p className="font-bold text-gray-900 text-xs">Reembolso</p>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setResolutionType('RELEASE_VENDOR');
                                                    setSplitVendor(Number(selectedDispute.amount));
                                                    setSplitClient(0);
                                                }}
                                                className="p-3 border border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all text-center group"
                                            >
                                                <span className="material-symbols-outlined text-green-500 mb-1 group-hover:scale-110 transition-transform block text-2xl">payments</span>
                                                <p className="font-bold text-gray-900 text-xs">Liberar</p>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setResolutionType('SPLIT_CUSTOM');
                                                    setSplitClient(Number(selectedDispute.amount) / 2);
                                                    setSplitVendor(Number(selectedDispute.amount) / 2);
                                                }}
                                                className="p-3 border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-center group"
                                            >
                                                <span className="material-symbols-outlined text-blue-500 mb-1 group-hover:scale-110 transition-transform block text-2xl">call_split</span>
                                                <p className="font-bold text-gray-900 text-xs">Split</p>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 animate-in fade-in zoom-in duration-200">
                                            <div className="flex justify-between items-center mb-4">
                                                <h5 className="font-bold text-gray-900 text-sm">
                                                    {resolutionType === 'SPLIT_CUSTOM' ? 'Arbitraje (Split)' : resolutionType === 'REFUND_CLIENT' ? 'Reembolso Total' : 'Liberación Total'}
                                                </h5>
                                                <button onClick={() => setResolutionType(null)} className="text-xs font-bold text-gray-500 hover:underline">Cancelar</button>
                                            </div>

                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="flex-1">
                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Cliente</label>
                                                    <div className="relative">
                                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">$</span>
                                                        <input
                                                            type="number"
                                                            value={splitClient}
                                                            onChange={(e) => handleSplitChange('client', e.target.value)}
                                                            className="w-full pl-4 pr-2 py-1.5 border border-gray-300 bg-white rounded text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                            disabled={resolutionType !== 'SPLIT_CUSTOM'}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Vendor</label>
                                                    <div className="relative">
                                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">$</span>
                                                        <input
                                                            type="number"
                                                            value={splitVendor}
                                                            onChange={(e) => handleSplitChange('vendor', e.target.value)}
                                                            className="w-full pl-4 pr-2 py-1.5 border border-gray-300 bg-white rounded text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                            disabled={resolutionType !== 'SPLIT_CUSTOM'}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mb-4">
                                                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Notas de Resolución</label>
                                                <textarea
                                                    value={resolutionNotes}
                                                    onChange={(e) => setResolutionNotes(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 bg-white rounded text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                    rows={3}
                                                    placeholder="Justificación de la resolución..."
                                                />
                                            </div>

                                            <div className="flex justify-between items-center text-xs border-t border-gray-200 pt-3 mb-4">
                                                <span className="font-medium text-gray-600">Total:</span>
                                                <span className={`font-bold ${splitClient + splitVendor === Number(selectedDispute.amount) ? 'text-green-600' : 'text-red-600'}`}>
                                                    ${(splitClient + splitVendor).toLocaleString()} / ${Number(selectedDispute.amount).toLocaleString()}
                                                </span>
                                            </div>

                                            <button
                                                onClick={handleResolve}
                                                disabled={splitClient + splitVendor !== Number(selectedDispute.amount)}
                                                className="w-full py-2.5 bg-dark text-white font-bold rounded-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-sm"
                                            >
                                                Ejecutar Resolución Final
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="border-t border-gray-200 pt-6">
                                    <div className={`p-5 rounded-xl border ${selectedDispute.status === 'RESOLVED'
                                        ? 'bg-green-50 border-green-200'
                                        : 'bg-gray-50 border-gray-200'
                                        }`}>
                                        <div className="flex items-center gap-3">
                                            <span className={`material-symbols-outlined text-2xl ${selectedDispute.status === 'RESOLVED' ? 'text-green-600' : 'text-gray-400'
                                                }`}>
                                                {selectedDispute.status === 'RESOLVED' ? 'check_circle' : 'cancel'}
                                            </span>
                                            <div>
                                                <p className={`font-bold ${selectedDispute.status === 'RESOLVED' ? 'text-green-900' : 'text-gray-700'
                                                    }`}>
                                                    Disputa {selectedDispute.status === 'RESOLVED' ? 'Finalizada' : 'Cancelada'}
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Esta disputa ya ha sido {selectedDispute.status === 'RESOLVED' ? 'resuelta' : 'cancelada'}.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            {/* CUSTOM CONFIRMATION MODAL FOR REVIEW */}
            <Modal
                isOpen={showReviewConfirm}
                onClose={() => setShowReviewConfirm(false)}
                title="Confirmar Revisión"
                size="md"
            >
                <div className="space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-blue-600 text-2xl">gavel</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-gray-700 leading-relaxed">
                                ¿Iniciar revisión de esta disputa? Esto cambiará su estado a <strong>"En Revisión"</strong> y notificará a las partes.
                            </p>
                            {selectedDispute && (
                                <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="text-sm text-gray-600">
                                        <strong>Disputa:</strong> #{selectedDispute.id.substring(0, 12)}<br />
                                        <strong>Proyecto:</strong> {selectedDispute.project.title}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={() => setShowReviewConfirm(false)}
                            className="px-6 py-2.5 border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={confirmStartReview}
                            className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg"
                        >
                            <span className="material-symbols-outlined text-lg">play_arrow</span>
                            Iniciar Revisión
                        </button>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
};

export default AdminDisputes;