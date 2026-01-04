import React, { useState, useEffect } from 'react';
import VendorLayout from '../../components/VendorLayout';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

interface Client {
    id: string;
    companyName: string;
    industry?: string;
    website?: string;
    email: string;
    projectsCount: {
        active: number;
        completed: number;
        total: number;
    };
    ltv: number;
    lastContact: string | null;
    pendingPayments: number;
    hasActiveProject: boolean;
}

const VendorClients: React.FC = () => {
    const navigate = useNavigate();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

    // Search & Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [ltvRange, setLtvRange] = useState<string>('all');

    // Invite Modal
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteName, setInviteName] = useState('');
    const [inviteLoading, setInviteLoading] = useState(false);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            setLoading(true);
            const res = await api.get('/vendors/my-clients');
            setClients(res.data.clients || []);
        } catch (error) {
            console.error('Error fetching clients:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInviteClient = async () => {
        // Validate both fields are filled
        if (!inviteName.trim() || !inviteEmail.trim()) {
            alert('Por favor completa todos los campos');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(inviteEmail)) {
            alert('Por favor ingresa un email válido');
            return;
        }

        setInviteLoading(true);
        try {
            // TODO: Implement backend endpoint for sending invitations
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulated delay
            alert(`Invitación enviada a ${inviteEmail}`);
            setShowInviteModal(false);
            setInviteEmail('');
            setInviteName('');
        } catch (error) {
            console.error('Error sending invitation:', error);
            alert('Error al enviar la invitación');
        } finally {
            setInviteLoading(false);
        }
    };

    // Get unique industries for filter
    const industries = Array.from(new Set(clients.map(c => c.industry).filter(Boolean))) as string[];

    // Apply all filters
    const filteredClients = clients.filter(client => {
        // Search term filter
        const matchesSearch = searchTerm === '' ||
            client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.industry?.toLowerCase().includes(searchTerm.toLowerCase());

        // Industry filter
        const matchesIndustry = selectedIndustry === 'all' || client.industry === selectedIndustry;

        // Status filter
        const matchesStatus = selectedStatus === 'all' ||
            (selectedStatus === 'active' && client.hasActiveProject) ||
            (selectedStatus === 'inactive' && !client.hasActiveProject);

        // LTV range filter
        let matchesLTV = true;
        if (ltvRange === 'low') matchesLTV = client.ltv < 50000;
        else if (ltvRange === 'medium') matchesLTV = client.ltv >= 50000 && client.ltv < 100000;
        else if (ltvRange === 'high') matchesLTV = client.ltv >= 100000;

        return matchesSearch && matchesIndustry && matchesStatus && matchesLTV;
    });

    // Calculate overall metrics
    const totalClients = clients.length;
    const activeClients = clients.filter(c => c.hasActiveProject).length;
    const totalLTV = clients.reduce((sum, c) => sum + c.ltv, 0);
    const totalPendingPayments = clients.reduce((sum, c) => sum + c.pendingPayments, 0);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const formatTimeAgo = (dateStr: string | null) => {
        if (!dateStr) return 'Sin contacto';
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Hoy';
        if (diffDays === 1) return 'Ayer';
        if (diffDays < 7) return `Hace ${diffDays} días`;
        if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
        return `Hace ${Math.floor(diffDays / 30)} meses`;
    };

    const activeFiltersCount = [
        selectedIndustry !== 'all',
        selectedStatus !== 'all',
        ltvRange !== 'all'
    ].filter(Boolean).length;

    return (
        <VendorLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Cartera de Clientes</h1>
                        <p className="text-gray-500 mt-1">Gestiona tus relaciones comerciales</p>
                    </div>
                    <button
                        onClick={() => setShowInviteModal(true)}
                        className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary/90 flex items-center gap-2 shadow-lg shadow-primary/20"
                    >
                        <span className="material-symbols-outlined text-lg">person_add</span>
                        Invitar Cliente
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span className="material-symbols-outlined text-blue-600">group</span>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Total Clientes</p>
                                <p className="text-2xl font-black text-gray-900">{totalClients}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <span className="material-symbols-outlined text-green-600">trending_up</span>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Clientes Activos</p>
                                <p className="text-2xl font-black text-gray-900">{activeClients}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <span className="material-symbols-outlined text-purple-600">payments</span>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">LTV Total</p>
                                <p className="text-2xl font-black text-gray-900">${(totalLTV / 1000).toFixed(0)}k</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                <span className="material-symbols-outlined text-red-600">schedule</span>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Pagos Pendientes</p>
                                <p className="text-2xl font-black text-red-600">${(totalPendingPayments / 1000).toFixed(0)}k</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Bar and Controls */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex flex-col md:flex-row gap-3">
                        {/* Search Input with Dropdown */}
                        <div className="flex-1 relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                            <input
                                type="text"
                                placeholder="Buscar por nombre, email o industria..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={() => setShowSearchDropdown(true)}
                                onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
                            />

                            {/* Search Results Dropdown */}
                            {showSearchDropdown && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto">
                                    <div className="p-3 border-b border-gray-100">
                                        <p className="text-xs font-bold text-gray-500 uppercase">
                                            {filteredClients.length > 0 ? `${filteredClients.length} clientes encontrados` : 'No hay resultados'}
                                        </p>
                                    </div>
                                    {filteredClients.length > 0 ? (
                                        <div className="divide-y divide-gray-100">
                                            {filteredClients.slice(0, 5).map(client => (
                                                <div
                                                    key={client.id}
                                                    className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                                                    onClick={() => {
                                                        setSearchTerm(client.companyName);
                                                        setShowSearchDropdown(false);
                                                    }}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-bold text-gray-500">
                                                            {getInitials(client.companyName)}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-bold text-sm text-gray-900 truncate">{client.companyName}</p>
                                                            <p className="text-xs text-gray-500">{client.industry || 'Sin clasificar'} · {client.projectsCount.total} proyectos</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm font-bold text-gray-900">${(client.ltv / 1000).toFixed(0)}k</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {filteredClients.length > 5 && (
                                                <div className="p-3 text-center">
                                                    <p className="text-xs text-gray-500">Y {filteredClients.length - 5} clientes más...</p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center">
                                            <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">search_off</span>
                                            <p className="text-sm text-gray-500">No se encontraron clientes</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Filter Button */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-4 py-2 rounded-lg border-2 font-bold text-sm flex items-center gap-2 transition-colors ${showFilters || activeFiltersCount > 0
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                }`}
                        >
                            <span className="material-symbols-outlined text-lg">tune</span>
                            Filtros
                            {activeFiltersCount > 0 && (
                                <span className="bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                    {activeFiltersCount}
                                </span>
                            )}
                        </button>

                        {/* View Toggle */}
                        <div className="bg-gray-100 p-1 rounded-lg flex">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-md transition-all flex items-center ${viewMode === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-700'
                                    }`}
                                title="Vista de Fichas"
                            >
                                <span className="material-symbols-outlined">grid_view</span>
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`p-2 rounded-md transition-all flex items-center ${viewMode === 'table' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-700'
                                    }`}
                                title="Vista de Tabla"
                            >
                                <span className="material-symbols-outlined">table_rows</span>
                            </button>
                        </div>
                    </div>

                    {/* Advanced Filters Dropdown */}
                    {showFilters && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-in slide-in-from-top-2">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Industry Filter */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2">Industria</label>
                                    <select
                                        value={selectedIndustry}
                                        onChange={(e) => setSelectedIndustry(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
                                    >
                                        <option value="all">Todas las industrias</option>
                                        {industries.map(industry => (
                                            <option key={industry} value={industry}>{industry}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Status Filter */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2">Estado</label>
                                    <select
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
                                    >
                                        <option value="all">Todos los clientes</option>
                                        <option value="active">Activos</option>
                                        <option value="inactive">Inactivos</option>
                                    </select>
                                </div>

                                {/* LTV Range Filter */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2">Rango de LTV</label>
                                    <select
                                        value={ltvRange}
                                        onChange={(e) => setLtvRange(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm"
                                    >
                                        <option value="all">Todos los rangos</option>
                                        <option value="low">Menos de $50k</option>
                                        <option value="medium">$50k - $100k</option>
                                        <option value="high">Más de $100k</option>
                                    </select>
                                </div>
                            </div>

                            {/* Clear Filters */}
                            {activeFiltersCount > 0 && (
                                <button
                                    onClick={() => {
                                        setSelectedIndustry('all');
                                        setSelectedStatus('all');
                                        setLtvRange('all');
                                    }}
                                    className="mt-4 text-sm text-primary hover:text-primary/80 font-bold flex items-center gap-1"
                                >
                                    <span className="material-symbols-outlined text-sm">close</span>
                                    Limpiar filtros
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Results Count */}
                <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">
                        Mostrando <span className="font-bold text-gray-900">{filteredClients.length}</span> de {totalClients} clientes
                    </p>
                </div>

                {/* Clients Content */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
                    </div>
                ) : (
                    <>
                        {/* Grid View */}
                        {viewMode === 'grid' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredClients.map(client => (
                                    <div key={client.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl font-bold text-gray-500 group-hover:bg-primary group-hover:text-white transition-colors">
                                                    {getInitials(client.companyName)}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-gray-900">{client.companyName}</h3>
                                                    <p className="text-sm text-gray-500">{client.industry || 'Sin clasificar'}</p>
                                                </div>
                                            </div>
                                            <span
                                                className={`w-3 h-3 rounded-full border-2 border-white shadow-sm ${client.hasActiveProject ? 'bg-green-500' : 'bg-gray-300'}`}
                                                title={client.hasActiveProject ? 'Activo' : 'Inactivo'}
                                            />
                                        </div>

                                        <div className="bg-gray-50 rounded-lg p-3 mb-4 flex justify-between items-center">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-bold">LTV</p>
                                                <p className="font-black text-gray-900 text-lg">${(client.ltv / 1000).toFixed(0)}k</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500 uppercase font-bold">Proyectos</p>
                                                <p className="font-black text-gray-900 text-lg">{client.projectsCount.total}</p>
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-100 pt-4 space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Último contacto</span>
                                                <span className="font-medium text-gray-900">{formatTimeAgo(client.lastContact)}</span>
                                            </div>
                                            {client.pendingPayments > 0 && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Pagos pendientes</span>
                                                    <span className="font-bold text-red-500">${client.pendingPayments.toLocaleString()}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 mt-6">
                                            <button
                                                onClick={() => navigate(`/vendor/messages?clientId=${client.id}`)}
                                                className="py-2 border border-gray-200 text-gray-600 font-bold text-sm rounded-lg hover:bg-gray-50 flex items-center justify-center gap-1 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-sm">chat</span> Mensaje
                                            </button>
                                            <button className="py-2 bg-gray-900 text-white font-bold text-sm rounded-lg hover:bg-black transition-colors">
                                                Ver Perfil
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {/* Add Client Placeholder */}
                                <div
                                    onClick={() => setShowInviteModal(true)}
                                    className="border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center p-6 text-gray-400 hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors cursor-pointer min-h-[300px]"
                                >
                                    <span className="material-symbols-outlined text-4xl mb-2">person_add</span>
                                    <p className="font-bold">Invitar Nuevo Cliente</p>
                                </div>
                            </div>
                        )}

                        {/* Table View */}
                        {viewMode === 'table' && (
                            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-gray-200">
                                            <tr>
                                                <th className="text-left p-4 text-xs font-bold text-gray-600 uppercase">Cliente</th>
                                                <th className="text-left p-4 text-xs font-bold text-gray-600 uppercase">Industria</th>
                                                <th className="text-center p-4 text-xs font-bold text-gray-600 uppercase">Proyectos</th>
                                                <th className="text-right p-4 text-xs font-bold text-gray-600 uppercase">LTV</th>
                                                <th className="text-left p-4 text-xs font-bold text-gray-600 uppercase">Último Contacto</th>
                                                <th className="text-right p-4 text-xs font-bold text-gray-600 uppercase">Pagos Pend.</th>
                                                <th className="text-center p-4 text-xs font-bold text-gray-600 uppercase">Estado</th>
                                                <th className="text-right p-4 text-xs font-bold text-gray-600 uppercase">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {filteredClients.map(client => (
                                                <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold text-gray-500">
                                                                {getInitials(client.companyName)}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-gray-900">{client.companyName}</p>
                                                                <p className="text-xs text-gray-500">{client.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="text-sm text-gray-600">{client.industry || '-'}</span>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <span className="font-bold text-gray-900">{client.projectsCount.total}</span>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <span className="font-bold text-gray-900">${(client.ltv / 1000).toFixed(0)}k</span>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="text-sm text-gray-600">{formatTimeAgo(client.lastContact)}</span>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        {client.pendingPayments > 0 ? (
                                                            <span className="font-bold text-red-500">${(client.pendingPayments / 1000).toFixed(0)}k</span>
                                                        ) : (
                                                            <span className="text-gray-400">-</span>
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${client.hasActiveProject
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-gray-100 text-gray-600'
                                                            }`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${client.hasActiveProject ? 'bg-green-500' : 'bg-gray-400'}`} />
                                                            {client.hasActiveProject ? 'Activo' : 'Inactivo'}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => navigate(`/vendor/messages?clientId=${client.id}`)}
                                                                className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                                title="Enviar Mensaje"
                                                            >
                                                                <span className="material-symbols-outlined text-lg">chat</span>
                                                            </button>
                                                            <button
                                                                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                                                title="Ver Perfil"
                                                            >
                                                                <span className="material-symbols-outlined text-lg">person</span>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {filteredClients.length === 0 && !loading && (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="material-symbols-outlined text-4xl text-gray-300">search_off</span>
                        </div>
                        <p className="text-gray-900 font-bold mb-1">No se encontraron clientes</p>
                        <p className="text-gray-500 text-sm">Intenta ajustar los filtros de búsqueda</p>
                    </div>
                )}
            </div>

            {/* Invite Client Modal */}
            <Modal
                isOpen={showInviteModal}
                onClose={() => {
                    setShowInviteModal(false);
                    setInviteEmail('');
                    setInviteName('');
                }}
                title="Invitar Nuevo Cliente"
                size="md"
            >
                <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                        <span className="material-symbols-outlined text-blue-600">info</span>
                        <div>
                            <p className="font-bold text-blue-900 text-sm">Enviar invitación</p>
                            <p className="text-blue-700 text-xs mt-1">
                                Se enviará un email con una invitación para unirse a la plataforma como cliente.
                            </p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Nombre del Cliente <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={inviteName}
                            onChange={(e) => setInviteName(e.target.value)}
                            placeholder="Ej. Juan Pérez"
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            placeholder="cliente@ejemplo.com"
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="ghost"
                            className="flex-1"
                            onClick={() => {
                                setShowInviteModal(false);
                                setInviteEmail('');
                                setInviteName('');
                            }}
                            disabled={inviteLoading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            className="flex-[2] bg-primary hover:bg-primary/90 gap-3"
                            onClick={handleInviteClient}
                            disabled={inviteLoading || !inviteName.trim() || !inviteEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteEmail)}
                        >
                            {inviteLoading ? (
                                <>
                                    Enviando...
                                    <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                                </>
                            ) : (
                                <>
                                    Enviar Invitación
                                    <span className="material-symbols-outlined text-xl">send</span>
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </Modal>
        </VendorLayout>
    );
};

export default VendorClients;