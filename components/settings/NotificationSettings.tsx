import React, { useState, useEffect } from 'react';
import { useToast } from '../../contexts/ToastContext';
import api from '../../services/api';

interface NotificationSettingsProps {
    user: any;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ user }) => {
    const { showToast } = useToast();
    const [preferences, setPreferences] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPreferences();
    }, []);

    const fetchPreferences = async () => {
        try {
            setLoading(true);
            const res = await api.get('/notifications/preferences');
            setPreferences(res.data);
        } catch (error) {
            console.error('Error fetching preferences:', error);
            showToast('Error al cargar preferencias', 'error');
        } finally {
            setLoading(false);
        }
    };

    const updatePreference = async (field: string, value: any) => {
        try {
            const updatedPrefs = { ...preferences, [field]: value };
            setPreferences(updatedPrefs);

            await api.patch('/notifications/preferences', { [field]: value });
            showToast('Preferencia actualizada', 'success');
        } catch (error: any) {
            console.error('Error updating preference:', error);
            showToast(error.response?.data?.message || 'Error al actualizar', 'error');
            // Revert on error
            fetchPreferences();
        }
    };

    const updateCategoryChannel = async (category: string, channel: string, enabled: boolean) => {
        try {
            const currentCat = JSON.parse(preferences[category] || '{}');
            currentCat[channel] = enabled;

            await updatePreference(category, currentCat);
        } catch (error) {
            console.error('Error updating category channel:', error);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    const getCategoryValue = (category: string, channel: string): boolean => {
        try {
            const cat = JSON.parse(preferences[category] || '{}');
            return cat[channel] || false;
        } catch {
            return false;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Notificaciones</h2>
                <p className="text-gray-500">Controla cómo y cuándo recibes notificaciones</p>
            </div>

            {/* Global Channels */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Canales Globales</h3>
                <div className="space-y-4">
                    <ToggleRow
                        label="Notificaciones por Email"
                        description="Recibe actualizaciones en tu correo electrónico"
                        icon="email"
                        checked={preferences?.emailEnabled}
                        onChange={(value) => updatePreference('emailEnabled', value)}
                    />
                    <ToggleRow
                        label="Notificaciones en la App"
                        description="Muestra alertas cuando estés usando la plataforma"
                        icon="notifications_active"
                        checked={preferences?.inAppEnabled}
                        onChange={(value) => updatePreference('inAppEnabled', value)}
                    />
                    <ToggleRow
                        label="Notificaciones por SMS"
                        description="Para eventos críticos (requiere teléfono verificado)"
                        icon="sms"
                        checked={preferences?.smsEnabled}
                        onChange={(value) => updatePreference('smsEnabled', value)}
                    />
                </div>
            </div>

            {/* Category Preferences */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Preferencias por Categoría</h3>
                <div className="space-y-6">
                    {/* Projects */}
                    <CategorySection
                        title="Proyectos"
                        description="Nuevas propuestas, cambios de estado, entregas"
                        icon="work"
                        emailChecked={getCategoryValue('projectNotifications', 'email')}
                        inAppChecked={getCategoryValue('projectNotifications', 'inApp')}
                        onEmailChange={(val) => updateCategoryChannel('projectNotifications', 'email', val)}
                        onInAppChange={(val) => updateCategoryChannel('projectNotifications', 'inApp', val)}
                    />

                    {/* Messages */}
                    <CategorySection
                        title="Mensajes"
                        description="Nuevos mensajes de vendors, menciones"
                        icon="chat"
                        emailChecked={getCategoryValue('messageNotifications', 'email')}
                        inAppChecked={getCategoryValue('messageNotifications', 'inApp')}
                        onEmailChange={(val) => updateCategoryChannel('messageNotifications', 'email', val)}
                        onInAppChange={(val) => updateCategoryChannel('messageNotifications', 'inApp', val)}
                    />

                    {/* Payments */}
                    <CategorySection
                        title="Pagos"
                        description="Solicitudes de pago, confirmaciones, facturas"
                        icon="payments"
                        emailChecked={getCategoryValue('paymentNotifications', 'email')}
                        inAppChecked={getCategoryValue('paymentNotifications', 'inApp')}
                        onEmailChange={(val) => updateCategoryChannel('paymentNotifications', 'email', val)}
                        onInAppChange={(val) => updateCategoryChannel('paymentNotifications', 'inApp', val)}
                    />

                    {/* System */}
                    <CategorySection
                        title="Sistema"
                        description="Mantenimiento, nuevas características, actualizaciones"
                        icon="settings_suggest"
                        emailChecked={getCategoryValue('systemNotifications', 'email')}
                        inAppChecked={getCategoryValue('systemNotifications', 'inApp')}
                        onEmailChange={(val) => updateCategoryChannel('systemNotifications', 'email', val)}
                        onInAppChange={(val) => updateCategoryChannel('systemNotifications', 'inApp', val)}
                    />
                </div>
            </div>

            {/* Digest Options */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Resúmenes Periódicos</h3>
                <div className="space-y-4">
                    <ToggleRow
                        label="Resumen Diario"
                        description="Recibe un email diario con todas las actualizaciones"
                        icon="today"
                        checked={preferences?.dailyDigest}
                        onChange={(value) => updatePreference('dailyDigest', value)}
                    />
                    <ToggleRow
                        label="Resumen Semanal"
                        description="Recibe un email semanal con resumen de actividad"
                        icon="date_range"
                        checked={preferences?.weeklyDigest}
                        onChange={(value) => updatePreference('weeklyDigest', value)}
                    />
                </div>
            </div>

            {/* Quiet Hours */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Horario de Silencio</h3>
                <p className="text-sm text-gray-500 mb-4">
                    No recibirás notificaciones push durante estas horas
                </p>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Desde</label>
                        <input
                            type="time"
                            value={preferences?.quietHoursStart || ''}
                            onChange={(e) => updatePreference('quietHoursStart', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Hasta</label>
                        <input
                            type="time"
                            value={preferences?.quietHoursEnd || ''}
                            onChange={(e) => updatePreference('quietHoursEnd', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper Components
const ToggleRow: React.FC<{
    label: string;
    description: string;
    icon: string;
    checked: boolean;
    onChange: (value: boolean) => void;
}> = ({ label, description, icon, checked, onChange }) => (
    <div className="flex items-start justify-between gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
        <div className="flex gap-3 flex-1">
            <span className="material-symbols-outlined text-gray-400 mt-1">{icon}</span>
            <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{label}</h4>
                <p className="text-sm text-gray-500 mt-1">{description}</p>
            </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
    </div>
);

const CategorySection: React.FC<{
    title: string;
    description: string;
    icon: string;
    emailChecked: boolean;
    inAppChecked: boolean;
    onEmailChange: (value: boolean) => void;
    onInAppChange: (value: boolean) => void;
}> = ({ title, description, icon, emailChecked, inAppChecked, onEmailChange, onInAppChange }) => (
    <div className="border border-gray-100 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-3">
            <span className="material-symbols-outlined text-primary">{icon}</span>
            <div>
                <h4 className="font-semibold text-gray-900">{title}</h4>
                <p className="text-xs text-gray-500">{description}</p>
            </div>
        </div>
        <div className="flex gap-4 ml-9">
            <label className="flex items-center gap-2 text-sm">
                <input
                    type="checkbox"
                    checked={emailChecked}
                    onChange={(e) => onEmailChange(e.target.checked)}
                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                />
                Email
            </label>
            <label className="flex items-center gap-2 text-sm">
                <input
                    type="checkbox"
                    checked={inAppChecked}
                    onChange={(e) => onInAppChange(e.target.checked)}
                    className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                />
                In-App
            </label>
        </div>
    </div>
);

export default NotificationSettings;
