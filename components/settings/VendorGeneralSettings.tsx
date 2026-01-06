import React, { useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import api from '../../services/api';

interface VendorGeneralSettingsProps {
    profile: any;
    onUpdate: () => void;
}

const VendorGeneralSettings: React.FC<VendorGeneralSettingsProps> = ({ profile, onUpdate }) => {
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        companyName: profile?.companyName || '',
        bio: profile?.bio || '',
        industry: profile?.industry || '',
        website: profile?.website || '',
        country: profile?.country || '',
        city: profile?.city || '',
        hourlyRate: profile?.hourlyRate || '',
        yearsOfExperience: profile?.yearsOfExperience || '',
        portfolioUrl: profile?.portfolioUrl || '',
        linkedinUrl: profile?.linkedinUrl || '',
        githubUrl: profile?.githubUrl || '',
        skills: profile?.skills || [],
        languages: profile?.languages || []
    });
    const [saving, setSaving] = useState(false);
    const [logoPreview, setLogoPreview] = useState(profile?.logoUrl || '');
    const [skillInput, setSkillInput] = useState('');
    const [languageInput, setLanguageInput] = useState('');

    const industries = [
        'Desarrollo de Software',
        'Diseño UX/UI',
        'Marketing Digital',
        'Data Science',
        'DevOps',
        'Cyberseguridad',
        'IA/Machine Learning',
        'Blockchain',
        'Mobile Development',
        'Otro'
    ];

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const addSkill = () => {
        if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
            setFormData(prev => ({
                ...prev,
                skills: [...prev.skills, skillInput.trim()]
            }));
            setSkillInput('');
        }
    };

    const removeSkill = (skill: string) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter(s => s !== skill)
        }));
    };

    const addLanguage = () => {
        if (languageInput.trim() && !formData.languages.includes(languageInput.trim())) {
            setFormData(prev => ({
                ...prev,
                languages: [...prev.languages, languageInput.trim()]
            }));
            setLanguageInput('');
        }
    };

    const removeLanguage = (lang: string) => {
        setFormData(prev => ({
            ...prev,
            languages: prev.languages.filter(l => l !== lang)
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await api.patch('/profile/vendor-profile', formData);
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
        try {
            const logoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.companyName)}&size=200&background=random`;
            await api.post('/profile/vendor-profile/logo', { logoUrl, companyName: formData.companyName });
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
            {/* Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Perfil Profesional</h2>
                <p className="text-gray-500">Información que verán los clientes al buscar vendors</p>
            </div>

            {/* Logo & Basic Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <label className={labelClass}>Foto de Perfil</label>
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                        {logoPreview ? (
                            <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                            <span className="material-symbols-outlined text-4xl text-gray-400">person</span>
                        )}
                    </div>
                    <div className="flex-1">
                        <button
                            onClick={handleLogoUpload}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-sm">upload</span>
                            Generar Foto
                        </button>
                        <p className="text-xs text-gray-500 mt-2">Recomendado: 200x200px, PNG o JPG</p>
                    </div>
                </div>
            </div>

            {/* Professional Info */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Nombre / Empresa *</label>
                        <input
                            type="text"
                            value={formData.companyName}
                            onChange={(e) => handleChange('companyName', e.target.value)}
                            className={inputClass}
                            placeholder="Ej: Juan Pérez"
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Industria / Especialidad</label>
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
                    <label className={labelClass}>Bio / Descripción Profesional</label>
                    <textarea
                        value={formData.bio}
                        onChange={(e) => handleChange('bio', e.target.value)}
                        className={inputClass}
                        rows={4}
                        placeholder="Describe tu experiencia, especialización y propuesta de valor..."
                    />
                    <p className="text-xs text-gray-500 mt-1">{formData.bio.length}/1000 caracteres</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Tarifa por Hora (USD)</label>
                        <input
                            type="number"
                            value={formData.hourlyRate}
                            onChange={(e) => handleChange('hourlyRate', parseFloat(e.target.value))}
                            className={inputClass}
                            placeholder="50"
                            min="0"
                            step="5"
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Años de Experiencia</label>
                        <input
                            type="number"
                            value={formData.yearsOfExperience}
                            onChange={(e) => handleChange('yearsOfExperience', parseInt(e.target.value))}
                            className={inputClass}
                            placeholder="5"
                            min="0"
                        />
                    </div>
                </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <label className={labelClass}>Habilidades Técnicas</label>
                <div className="flex gap-2 mb-3">
                    <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                        className={inputClass}
                        placeholder="Ej: React, Python, Figma..."
                    />
                    <button
                        onClick={addSkill}
                        className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-1"
                    >
                        <span className="material-symbols-outlined text-sm">add</span>
                        Agregar
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, idx) => (
                        <span
                            key={idx}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1"
                        >
                            {skill}
                            <button
                                onClick={() => removeSkill(skill)}
                                className="hover:text-blue-900"
                            >
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </span>
                    ))}
                </div>
            </div>

            {/* Languages */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <label className={labelClass}>Idiomas</label>
                <div className="flex gap-2 mb-3">
                    <input
                        type="text"
                        value={languageInput}
                        onChange={(e) => setLanguageInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
                        className={inputClass}
                        placeholder="Ej: Español, Inglés, Francés..."
                    />
                    <button
                        onClick={addLanguage}
                        className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-1"
                    >
                        <span className="material-symbols-outlined text-sm">add</span>
                        Agregar
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {formData.languages.map((lang, idx) => (
                        <span
                            key={idx}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-1"
                        >
                            {lang}
                            <button
                                onClick={() => removeLanguage(lang)}
                                className="hover:text-green-900"
                            >
                                <span className="material-symbols-outlined text-sm">close</span>
                            </button>
                        </span>
                    ))}
                </div>
            </div>

            {/* Links */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                <h3 className="font-bold text-gray-900">Enlaces Profesionales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Sitio Web / Portfolio</label>
                        <input
                            type="url"
                            value={formData.portfolioUrl}
                            onChange={(e) => handleChange('portfolioUrl', e.target.value)}
                            className={inputClass}
                            placeholder="https://miportfolio.com"
                        />
                    </div>
                    <div>
                        <label className={labelClass}>LinkedIn</label>
                        <input
                            type="url"
                            value={formData.linkedinUrl}
                            onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                            className={inputClass}
                            placeholder="https://linkedin.com/in/usuario"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>GitHub</label>
                        <input
                            type="url"
                            value={formData.githubUrl}
                            onChange={(e) => handleChange('githubUrl', e.target.value)}
                            className={inputClass}
                            placeholder="https://github.com/usuario"
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Otro Website</label>
                        <input
                            type="url"
                            value={formData.website}
                            onChange={(e) => handleChange('website', e.target.value)}
                            className={inputClass}
                            placeholder="https://ejemplo.com"
                        />
                    </div>
                </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                <h3 className="font-bold text-gray-900">Ubicación</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <div>
                        <label className={labelClass}>Ciudad</label>
                        <input
                            type="text"
                            value={formData.city}
                            onChange={(e) => handleChange('city', e.target.value)}
                            className={inputClass}
                            placeholder="Ej: Barcelona"
                        />
                    </div>
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

export default VendorGeneralSettings;
