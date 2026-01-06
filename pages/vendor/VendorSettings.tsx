import React, { useState, useEffect } from 'react';
import VendorLayout from '../../components/VendorLayout';
import { useToast } from '../../contexts/ToastContext';
import api from '../../services/api';

// Section Components
import VendorGeneralSettings from '../../components/settings/VendorGeneralSettings';
import NotificationSettings from '../../components/settings/NotificationSettings';
import SecuritySettings from '../../components/settings/SecuritySettings';
import PreferencesSettings from '../../components/settings/PreferencesSettings';
import AIAgentSettings from '../../components/settings/AIAgentSettings';

type Section = 'general' | 'notifications' | 'security' | 'preferences' | 'ai-agent';

interface Tab {
    id: Section;
    label: string;
    icon: string;
}

const VendorSettings: React.FC = () => {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<Section>('general');
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const tabs: Tab[] = [
        { id: 'general', label: 'General', icon: 'person' },
        { id: 'ai-agent', label: 'Agentes IA', icon: 'smart_toy' },
        { id: 'notifications', label: 'Notificaciones', icon: 'notifications' },
        { id: 'security', label: 'Seguridad', icon: 'shield' },
        { id: 'preferences', label: 'Preferencias', icon: 'tune' }
    ];

    useEffect(() => {
        fetchUserAndProfile();
    }, []);

    const fetchUserAndProfile = async () => {
        try {
            setLoading(true);

            const userRes = await api.get('/auth/me');
            setUser(userRes.data);

            try {
                const profileRes = await api.get('/profile/vendor-profile');
                setProfile(profileRes.data);
            } catch (profileError: any) {
                console.log('Profile not found, will create on save');
                setProfile({
                    companyName: '',
                    bio: '',
                    hourlyRate: null,
                    skills: [],
                    industry: '',
                    website: '',
                    country: '',
                    city: '',
                    languages: [],
                    yearsOfExperience: null,
                    portfolioUrl: '',
                    linkedinUrl: '',
                    githubUrl: '',
                    logoUrl: '',
                    aiAgentEnabled: false,
                    aiAgentConfig: null
                });
            }
        } catch (error: any) {
            console.error('Error fetching data:', error);
            if (error.response?.status === 401) {
                showToast('Sesión expirada. Por favor inicia sesión nuevamente', 'error');
            } else {
                showToast('Error al cargar configuración', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const refreshUser = async () => {
        try {
            const res = await api.get('/auth/me');
            setUser(res.data);
        } catch (error) {
            console.error('Error refreshing user:', error);
        }
    };

    const refreshProfile = async () => {
        try {
            const res = await api.get('/profile/vendor-profile');
            setProfile(res.data);
        } catch (error) {
            console.error('Error refreshing profile:', error);
        }
    };

    return (
        <VendorLayout>
            <div className="max-w-7xl mx-auto pb-20">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900">Configuración</h1>
                    <p className="text-gray-500 mt-2">Gestiona tu perfil profesional, agentes IA y preferencias</p>
                </div>

                {/* Horizontal Tabs */}
                <div className="border-b border-gray-200 mb-8">
                    <nav className="flex gap-1 overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-4 font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                        ? 'text-primary border-b-2 border-primary'
                                        : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-xl">
                                    {tab.icon}
                                </span>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p className="text-gray-500 mt-4">Cargando configuración...</p>
                    </div>
                ) : (
                    <>
                        {activeTab === 'general' && (
                            <VendorGeneralSettings
                                profile={profile}
                                onUpdate={refreshProfile}
                            />
                        )}
                        {activeTab === 'ai-agent' && (
                            <AIAgentSettings
                                profile={profile}
                                onUpdate={refreshProfile}
                            />
                        )}
                        {activeTab === 'notifications' && (
                            <NotificationSettings user={user} />
                        )}
                        {activeTab === 'security' && (
                            <SecuritySettings
                                user={user}
                                onUserUpdate={refreshUser}
                            />
                        )}
                        {activeTab === 'preferences' && (
                            <PreferencesSettings
                                user={user}
                                onUpdate={refreshUser}
                            />
                        )}
                    </>
                )}
            </div>
        </VendorLayout>
    );
};

export default VendorSettings;