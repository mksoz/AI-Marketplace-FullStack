import React, { useState, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import api from '../../services/api';

interface SecuritySettingsProps {
    user: any;
    onUserUpdate: () => void;
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({ user, onUserUpdate }) => {
    const { showToast } = useToast();
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [sessions, setSessions] = useState<any[]>([]);
    const [loadingSessions, setLoadingSessions] = useState(false);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            setLoadingSessions(true);
            const res = await api.get('/auth/me/sessions');
            setSessions(res.data);
        } catch (error) {
            console.error('Error fetching sessions:', error);
        } finally {
            setLoadingSessions(false);
        }
    };

    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showToast('Las contraseñas no coinciden', 'error');
            return;
        }

        if (passwordData.newPassword.length < 8) {
            showToast('La contraseña debe tener al menos 8 caracteres', 'error');
            return;
        }

        try {
            await api.post('/auth/me/password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            showToast('Contraseña cambiada exitosamente', 'success');
            setShowPasswordModal(false);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Error al cambiar contraseña', 'error');
        }
    };

    const handleRevokeSession = async (sessionId: string) => {
        if (!confirm('¿Cerrar esta sesión?')) return;

        try {
            await api.delete(`/auth/me/sessions/${sessionId}`);
            showToast('Sesión cerrada', 'success');
            fetchSessions();
        } catch (error) {
            showToast('Error al cerrar sesión', 'error');
        }
    };

    const toggleSimulationMode = async (value: boolean) => {
        try {
            await api.patch('/auth/me', { simulationMode: value });
            showToast(value ? 'Modo Simulación activado' : 'Modo Simulación desactivado', 'success');
            onUserUpdate();
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Error al actualizar', 'error');
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const parseUserAgent = (ua: string) => {
        // Simple parsing
        if (ua.includes('Chrome')) return { browser: 'Chrome', icon: 'web' };
        if (ua.includes('Safari')) return { browser: 'Safari', icon: 'web' };
        if (ua.includes('Firefox')) return { browser: 'Firefox', icon: 'web' };
        return { browser: 'Navegador', icon: 'devices' };
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Seguridad</h2>
                <p className="text-gray-500">Protege tu cuenta y gestiona el acceso</p>
            </div>

            {/* Password */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">lock</span>
                            Contraseña
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Última modificación: Hace 30 días
                        </p>
                    </div>
                    <button
                        onClick={() => setShowPasswordModal(true)}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                    >
                        Cambiar Contraseña
                    </button>
                </div>
            </div>

            {/* 2FA (Placeholder for future) */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">verified_user</span>
                            Autenticación de Dos Factores (2FA)
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {user?.twoFactorEnabled
                                ? 'Protección adicional activada con códigos de autenticación'
                                : 'Agrega una capa extra de seguridad a tu cuenta'}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {user?.twoFactorEnabled && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                Activado
                            </span>
                        )}
                        <button
                            disabled
                            className="px-4 py-2 bg-gray-100 text-gray-400 rounded-lg font-medium cursor-not-allowed"
                        >
                            Próximamente
                        </button>
                    </div>
                </div>
            </div>

            {/* Simulation Mode */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3 flex-1">
                        <span className="material-symbols-outlined text-purple-600 mt-1">science</span>
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-900">Modo Simulación de Pagos</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Permite aprobar pagos automáticamente simulando fondos suficientes. Útil para pruebas.
                            </p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={user?.simulationMode || false}
                            onChange={(e) => toggleSimulationMode(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>
            </div>

            {/* Active Sessions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">devices</span>
                    Sesiones Activas
                </h3>
                {loadingSessions ? (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                ) : sessions.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No hay sesiones activas</p>
                ) : (
                    <div className="space-y-3">
                        {sessions.map((session) => {
                            const { browser, icon } = parseUserAgent(session.userAgent);
                            return (
                                <div
                                    key={session.id}
                                    className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-gray-400">{icon}</span>
                                        <div>
                                            <p className="font-medium text-gray-900">{browser}</p>
                                            <p className="text-xs text-gray-500">
                                                {session.ipAddress} • {formatDate(session.lastActiveAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRevokeSession(session.id)}
                                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Password Change Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Cambiar Contraseña</h3>
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Contraseña Actual
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Nueva Contraseña
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none"
                                />
                                <p className="text-xs text-gray-500 mt-1">Mínimo 8 caracteres</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Confirmar Nueva Contraseña
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleChangePassword}
                                className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
                            >
                                Cambiar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SecuritySettings;
