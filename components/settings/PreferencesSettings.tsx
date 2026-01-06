import React, { useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import api from '../../services/api';

interface PreferencesSettingsProps {
    user: any;
    onUpdate: () => void;
}

const PreferencesSettings: React.FC<PreferencesSettingsProps> = ({ user, onUpdate }) => {
    const { showToast } = useToast();
    const [preferences, setPreferences] = useState({
        language: user?.language || 'es',
        timezone: user?.timezone || 'Europe/Madrid',
        currency: user?.currency || 'USD',
        dateFormat: user?.dateFormat || 'DD/MM/YYYY',
        theme: user?.theme || 'auto'
    });
    const [saving, setSaving] = useState(false);

    const languages = [
        { code: 'es', label: 'Español', flag: '🇪🇸' },
        { code: 'en', label: 'English', flag: '🇬🇧' }
    ];

    const timezones = [
        'Europe/Madrid',
        'Europe/London',
        'America/New_York',
        'America/Los_Angeles',
        'America/Mexico_City',
        'America/Sao_Paulo',
        'Asia/Tokyo',
        'Australia/Sydney'
    ];

    const currencies = [
        { code: 'USD', symbol: '$', name: 'Dólar (US)' },
        { code: 'EUR', symbol: '€', name: 'Euro' },
        { code: 'GBP', symbol: '£', name: 'Libra' },
        { code: 'MXN', symbol: '$', name: 'Peso Mexicano' },
        { code: 'BRL', symbol: 'R$', name: 'Real Brasileño' }
    ];

    const dateFormats = [
        { value: 'DD/MM/YYYY', example: '31/12/2026' },
        { value: 'MM/DD/YYYY', example: '12/31/2026' },
        { value: 'YYYY-MM-DD', example: '2026-12-31' }
    ];

    const themes = [
        { value: 'auto', label: 'Automático', icon: 'contrast', description: 'Según sistema' },
        { value: 'light', label: 'Claro', icon: 'light_mode', description: 'Siempre claro' },
        { value: 'dark', label: 'Oscuro', icon: 'dark_mode', description: 'Siempre oscuro' }
    ];

    const handleChange = (field: string, value: string) => {
        setPreferences(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await api.patch('/auth/me', preferences);
            showToast('Preferencias actualizadas', 'success');
            onUpdate();
        } catch (error: any) {
            console.error('Error updating preferences:', error);
            showToast(error.response?.data?.message || 'Error al actualizar', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Preferencias</h2>
                <p className="text-gray-500">Personaliza tu experiencia en la plataforma</p>
            </div>

            {/* Language */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">language</span>
                    Idioma de la Interfaz
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    {languages.map(lang => (
                        <button
                            key={lang.code}
                            onClick={() => handleChange('language', lang.code)}
                            className={`p-4 rounded-xl border-2 transition-all ${preferences.language === lang.code
                                    ? 'border-primary bg-primary/5'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className="text-3xl mb-2">{lang.flag}</div>
                            <div className="font-semibold text-gray-900">{lang.label}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Timezone */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">schedule</span>
                    Zona Horaria
                </h3>
                <select
                    value={preferences.timezone}
                    onChange={(e) => handleChange('timezone', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-primary outline-none"
                >
                    {timezones.map(tz => (
                        <option key={tz} value={tz}>{tz}</option>
                    ))}
                </select>
                <p className="text-xs text-gray-500 mt-2">
                    Todas las fechas y horas se mostrarán según esta zona horaria
                </p>
            </div>

            {/* Currency */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">attach_money</span>
                    Moneda Preferida
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {currencies.map(curr => (
                        <button
                            key={curr.code}
                            onClick={() => handleChange('currency', curr.code)}
                            className={`p-4 rounded-xl border-2 transition-all text-left ${preferences.currency === curr.code
                                    ? 'border-primary bg-primary/5'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className="text-2xl font-bold text-gray-900 mb-1">{curr.symbol}</div>
                            <div className="font-semibold text-sm text-gray-900">{curr.code}</div>
                            <div className="text-xs text-gray-500">{curr.name}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Date Format */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">event</span>
                    Formato de Fecha
                </h3>
                <div className="space-y-2">
                    {dateFormats.map(format => (
                        <label
                            key={format.value}
                            className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${preferences.dateFormat === format.value
                                    ? 'border-primary bg-primary/5'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <input
                                    type="radio"
                                    name="dateFormat"
                                    checked={preferences.dateFormat === format.value}
                                    onChange={() => handleChange('dateFormat', format.value)}
                                    className="w-4 h-4 text-primary"
                                />
                                <span className="font-semibold text-gray-900">{format.value}</span>
                            </div>
                            <span className="text-gray-500">{format.example}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Theme */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">palette</span>
                    Tema Visual
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {themes.map(theme => (
                        <button
                            key={theme.value}
                            onClick={() => handleChange('theme', theme.value)}
                            className={`p-4 rounded-xl border-2 transition-all ${preferences.theme === theme.value
                                    ? 'border-primary bg-primary/5'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <span className="material-symbols-outlined text-4xl text-gray-400 mb-2 block">
                                {theme.icon}
                            </span>
                            <div className="font-semibold text-gray-900">{theme.label}</div>
                            <div className="text-xs text-gray-500 mt-1">{theme.description}</div>
                        </button>
                    ))}
                </div>
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-800 flex items-start gap-2">
                        <span className="material-symbols-outlined text-sm">info</span>
                        El tema oscuro estará disponible próximamente
                    </p>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Guardando...
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-sm">save</span>
                            Guardar Preferencias
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default PreferencesSettings;
