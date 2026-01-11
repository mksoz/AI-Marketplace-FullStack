import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { adminUsersService } from '../../services/adminService';
import toast from 'react-hot-toast';

interface User {
    id: string;
    email: string;
    role: string;
    status: string;
    createdAt: string;
    lastLoginAt?: string;
    companyName?: string;
    logoUrl?: string;
    location?: string;
    hourlyRate?: number;
    permissions?: string[];
}

const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        role: 'all',
        status: 'all',
        search: ''
    });
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showCreateModal, setShowCreateModal] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [filters, page]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = {
                role: filters.role !== 'all' ? filters.role : undefined,
                status: filters.status !== 'all' ? filters.status : undefined,
                search: filters.search || undefined,
                page,
                limit: 20
            };

            const response = await adminUsersService.getUsers(params);
            console.log('API Response:', response.data); // Debug
            setUsers(response.data.users);
            setTotalPages(response.data.totalPages);
        } catch (error: any) {
            console.error('Error fetching users:', error);
            toast.error(error.response?.data?.message || 'Error cargando usuarios');
        } finally {
            setLoading(false);
        }
    };

    const handleSuspend = async (userId: string) => {
        if (!confirm('¿Estás seguro de suspender este usuario?')) return;

        try {
            const reason = prompt('Motivo de suspensión:');
            if (!reason) return;

            await adminUsersService.suspendUser(userId, reason);
            toast.success('Usuario suspendido');
            fetchUsers();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error suspendiendo usuario');
        }
    };

    const handleActivate = async (userId: string) => {
        try {
            await adminUsersService.activateUser(userId);
            toast.success('Usuario activado');
            fetchUsers();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error activando usuario');
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm('⚠️ ¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) return;

        try {
            await adminUsersService.deleteUser(userId);
            toast.success('Usuario eliminado');
            fetchUsers();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error eliminando usuario');
        }
    };

    const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        try {
            await adminUsersService.createUser({
                email: formData.get('email') as string,
                password: formData.get('password') as string,
                role: formData.get('role') as string,
                companyName: formData.get('companyName') as string
            });

            toast.success('Usuario creado exitosamente');
            setShowCreateModal(false);
            fetchUsers();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error creando usuario');
        }
    };

    const getRoleBadge = (role: string) => {
        const styles = {
            CLIENT: 'bg-blue-100 text-blue-700',
            VENDOR: 'bg-purple-100 text-purple-700',
            ADMIN: 'bg-red-100 text-red-700'
        };
        return styles[role as keyof typeof styles] || 'bg-gray-100 text-gray-700';
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            active: 'bg-green-100 text-green-700',
            pending: 'bg-yellow-100 text-yellow-700',
            suspended: 'bg-red-100 text-red-700'
        };
        return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700';
    };

    if (loading && users.length === 0) {
        return (
            <AdminLayout>
                <div className="animate-pulse space-y-4">
                    <div className="h-12 bg-gray-200 rounded"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
                        <p className="text-sm text-gray-500 mt-1">Administra clientes, vendors y permisos del sistema.</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined">person_add</span>
                        Nuevo Usuario
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 flex flex-wrap gap-4">
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <select
                        value={filters.role}
                        onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                        <option value="all">Todos los Roles</option>
                        <option value="CLIENT">Cliente</option>
                        <option value="VENDOR">Vendor</option>
                        <option value="ADMIN">Admin</option>
                    </select>
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                        <option value="all">Todos los Estados</option>
                        <option value="active">Activo</option>
                        <option value="pending">Pendiente</option>
                        <option value="suspended">Suspendido</option>
                    </select>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Usuario</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Rol</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Registro</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Último Login</th>
                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No se encontraron usuarios
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={user.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}&background=random`}
                                                    alt={user.email}
                                                    className="w-10 h-10 rounded-full"
                                                />
                                                <div>
                                                    <p className="font-medium text-gray-900">{user.companyName || user.email}</p>
                                                    <p className="text-sm text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${getRoleBadge(user.role)}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusBadge(user.status)}`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(user.createdAt).toLocaleDateString('es-ES')}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('es-ES') : 'Nunca'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleActivate(user.id)}
                                                    className="text-green-600 hover:text-green-700 p-1"
                                                    title="Activar"
                                                >
                                                    <span className="material-symbols-outlined text-sm">check_circle</span>
                                                </button>
                                                <button
                                                    onClick={() => handleSuspend(user.id)}
                                                    className="text-orange-600 hover:text-orange-700 p-1"
                                                    title="Suspender"
                                                >
                                                    <span className="material-symbols-outlined text-sm">block</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.id)}
                                                    className="text-red-600 hover:text-red-700 p-1"
                                                    title="Eliminar"
                                                >
                                                    <span className="material-symbols-outlined text-sm">delete</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Anterior
                        </button>
                        <span className="text-sm text-gray-600">
                            Página {page} de {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Siguiente
                        </button>
                    </div>
                )}

                {/* Create User Modal - Enhanced */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl max-h-[85vh] overflow-y-auto">
                            {/* Header */}
                            <div className="sticky top-0 bg-gradient-to-r from-primary to-red-600 p-4 rounded-t-2xl">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                            <span className="material-symbols-outlined">person_add</span>
                                            Crear Nuevo Usuario
                                        </h2>
                                        <p className="text-red-100 text-sm mt-1">Complete los datos para crear una nueva cuenta</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                                    >
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleCreateUser} className="p-5 space-y-4">
                                {/* Role Selection */}
                                <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
                                    <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">badge</span>
                                        Tipo de Usuario
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { value: 'CLIENT', icon: 'business', label: 'Cliente' },
                                            { value: 'VENDOR', icon: 'code', label: 'Vendor' },
                                            { value: 'ADMIN', icon: 'admin_panel_settings', label: 'Admin' }
                                        ].map((role) => (
                                            <label key={role.value} className="cursor-pointer group">
                                                <input
                                                    type="radio"
                                                    name="role"
                                                    value={role.value}
                                                    required
                                                    className="peer sr-only"
                                                    defaultChecked={role.value === 'CLIENT'}
                                                />
                                                <div className="p-4 rounded-lg border-2 transition-all text-center border-gray-200 bg-white peer-checked:border-primary peer-checked:bg-primary/5 hover:border-primary/50 hover:shadow-md">
                                                    <span className="material-symbols-outlined text-3xl mb-2 block text-gray-400 peer-checked:text-primary transition-colors">
                                                        {role.icon}
                                                    </span>
                                                    <p className="text-sm font-bold text-gray-700">{role.label}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Credentials */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lg">lock</span>
                                        Credenciales de Acceso
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">email</span>
                                                <input type="email"
                                                    name="email"
                                                    required
                                                    placeholder="usuario@ejemplo.com"
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="text-sm font-medium text-gray-700">
                                                    Contraseña <span className="text-red-500">*</span>
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        const pwd = Math.random().toString(36).slice(-8) + Math.random().toString(36).toUpperCase().slice(-4);
                                                        const form = (e.target as HTMLElement).closest('form');
                                                        const input = form?.querySelector('input[name="password"]') as HTMLInputElement;
                                                        if (input) {
                                                            input.value = pwd;
                                                            input.type = 'text';
                                                            toast.success(`Contraseña generada: ${pwd}`);
                                                        }
                                                    }}
                                                    className="text-xs text-primary hover:underline font-bold flex items-center gap-1"
                                                >
                                                    <span className="material-symbols-outlined text-sm">password</span>
                                                    Generar
                                                </button>
                                            </div>
                                            <div className="relative">
                                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">key</span>
                                                <input
                                                    type="password"
                                                    name="password"
                                                    required
                                                    minLength={6}
                                                    placeholder="Mínimo 6 caracteres"
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Profile Info */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lg">corporate_fare</span>
                                        Información del Perfil
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Nombre de Empresa
                                                <span className="text-gray-400 text-xs ml-2">(Recomendado)</span>
                                            </label>
                                            <div className="relative">
                                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">business</span>
                                                <input
                                                    type="text"
                                                    name="companyName"
                                                    placeholder="Ej: TechCorp Solutions"
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                País <span className="text-gray-400 text-xs">(Opcional)</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="country"
                                                placeholder="Ej: España"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Ciudad <span className="text-gray-400 text-xs">(Opcional)</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="city"
                                                placeholder="Ej: Madrid"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Info Banner */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                                    <span className="material-symbols-outlined text-blue-600 flex-shrink-0">info</span>
                                    <div className="text-sm text-blue-800">
                                        <p className="font-medium">El usuario recibirá un email de bienvenida</p>
                                        <p className="text-blue-700 mt-1">Puede cambiar la contraseña en su primer acceso</p>
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-3 pt-4 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined">close</span>
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-red-600 transition-all hover:shadow-lg flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined">check_circle</span>
                                        Crear Usuario
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminUsers;
