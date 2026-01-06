import React, { useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import api from '../../services/api';

interface GeneralSettingsProps {
    profile: any;
    onUpdate: () => void;
}

const GeneralSettings: React.FC<GeneralSettingsProps> = ({ profile, onUpdate }) => {
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        companyName: profile?.companyName || '',
        description: profile?.description || '',
        industry: profile?.industry || '',
        website: profile?.website || '',
        country: profile?.country || '',
        city: profile?.city || ''
    });
    const [saving, setSaving] = useState(false);
    const [logoPreview, setLogoPreview] = useState(profile?.logoUrl || '');

    const industries = [
        'Tecnología',
        'Fintech',
        'E-commerce',
        'Salud',
        'Educación',
        'Marketing',
        'Consultoría',
        'Retail',
        'Manufactura',
        'Otro'
    ];

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await api.patch('/profile/client-profile', formData);
            showToast('Perfil actualizado correctamente', 'success');
            onUpdate();
        } catch (error: any) {
            console.error('Error updating profile:', error);
            showToast(error.response?.data?.message || 'Error al actualizar perfil', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleLogoUpload = async () => {
        // Simulated logo upload (in real app, would use file input)
        try {
            const logoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.companyName)}&size=200&background=random`;
            await api.post('/profile/client-profile/logo', { logoUrl, companyName: formData.companyName });
            setLogoPreview(logoUrl);
            showToast('Logo actualizado', 'success');
            onUpdate();
        } catch (error) {
            showToast('Error al actualizar logo', 'error');
        }
    };

    const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-gray-400";
    const labelClass = "block text-sm font-semibold text-gray-700 mb-2";

    return (
        <div className="space-y-6">
            {/* Section Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Información General</h2>
                <p className="text-gray-500">Información básica de tu empresa visible para los vendors</p>
            </div>

            {/* Logo */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <label className={labelClass}>Logo de Empresa</label>
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                        {logoPreview ? (
                            <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                            <span className="material-symbols-outlined text-4xl text-gray-400">business</span>
                        )}
                    </div>
                    <div className="flex-1">
                        <button
                            onClick={handleLogoUpload}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-sm">upload</span>
                            Generar Logo
                        </button>
                        <p className="text-xs text-gray-500 mt-2">Recomendado: 200x200px, PNG o JPG</p>
                    </div>
                </div>
            </div>

            {/* Company Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Nombre de la Empresa *</label>
                        <input
                            type="text"
                            value={formData.companyName}
                            onChange={(e) => handleChange('companyName', e.target.value)}
                            className={inputClass}
                            placeholder="Ej: Acme Corp"
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Industria</label>
                        <select
                            value={formData.industry}
                            onChange={(e) => handleChange('industry', e.target.value)}
                            className={inputClass}
                        >
                            <option value="">Seleccionar...</option>
                            {industries.map(ind => (
                                <option key={ind} value={ind}>{ind}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Descripción</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        className={inputClass}
                        rows={3}
                        placeholder="Describe brevemente tu empresa y sus objetivos..."
                    />
                    <p className="text-xs text-gray-500 mt-1">{formData.description.length}/500 caracteres</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Sitio Web</label>
                        <input
                            type="url"
                            value={formData.website}
                            onChange={(e) => handleChange('website', e.target.value)}
                            className={inputClass}
                            placeholder="https://www.ejemplo.com"
                        />
                    </div>
                    <div>
                        <label className={labelClass}>País</label>
                        <input
                            type="text"
                            value={formData.country}
                            onChange={(e) => handleChange('country', e.target.value)}
                            className={inputClass}
                            placeholder="Ej: España"
                        />
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Ciudad</label>
                    <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                        className={inputClass}
                        placeholder="Ej: Madrid"
                    />
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
                            Guardar Cambios
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default GeneralSettings;
