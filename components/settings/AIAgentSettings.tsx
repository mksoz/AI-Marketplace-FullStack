import React, { useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import api from '../../services/api';

interface AIAgentSettingsProps {
    profile: any;
    onUpdate: () => void;
}

const AIAgentSettings: React.FC<AIAgentSettingsProps> = ({ profile, onUpdate }) => {
    const { showToast } = useToast();
    const [agentEnabled, setAgentEnabled] = useState(profile?.aiAgentEnabled || false);
    const [config, setConfig] = useState(profile?.aiAgentConfig || {
        autoRespond: false,
        responseDelay: 0,
        workingHours: { start: '09:00', end: '18:00' },
        autoAcceptProposals: false,
        maxProjectsPerMonth: 5
    });

    const handleToggleAgent = async (enabled: boolean) => {
        try {
            await api.patch('/profile/vendor-profile', { aiAgentEnabled: enabled });
            setAgentEnabled(enabled);
            showToast(enabled ? 'Agente IA activado' : 'Agente IA desactivado', 'success');
            onUpdate();
        } catch (error) {
            showToast('Error al actualizar configuración', 'error');
        }
    };

    const handleSaveConfig = async () => {
        try {
            await api.patch('/profile/vendor-profile', { aiAgentConfig: config });
            showToast('Configuración guardada', 'success');
            onUpdate();
        } catch (error) {
            showToast('Error al guardar configuración', 'error');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200 p-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-100 rounded-xl">
                        <span className="material-symbols-outlined text-3xl text-purple-600">smart_toy</span>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Agente de IA Personal</h2>
                        <p className="text-gray-700">
                            Automatiza respuestas a clientes, gestiona propuestas y optimiza tu workflow con IA
                        </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={agentEnabled}
                            onChange={(e) => handleToggleAgent(e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
                    </label>
                </div>
            </div>

            {/* Coming Soon Notice */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <div className="max-w-2xl mx-auto">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-5xl text-gray-400">construction</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Próximamente</h3>
                    <p className="text-gray-500 mb-6">
                        Estamos desarrollando poderosas funcionalidades de IA para automatizar tu trabajo como vendor
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mt-8">
                        <FeatureCard
                            icon="chat"
                            title="Respuestas Automáticas"
                            description="El agente responderá a mensajes de clientes según tu estilo"
                        />
                        <FeatureCard
                            icon="assignment"
                            title="Gestión de Propuestas"
                            description="Sugiere y crea propuestas basadas en tu historial"
                        />
                        <FeatureCard
                            icon="schedule"
                            title="Programación Inteligente"
                            description="Optimiza tu calendario y prioriza proyectos"
                        />
                        <FeatureCard
                            icon="analytics"
                            title="Insights Predictivos"
                            description="Predice tendencias y recomienda estrategias"
                        />
                    </div>
                </div>
            </div>

            {/* Preview Configuration (Disabled) */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 opacity-50 pointer-events-none">
                <h3 className="font-bold text-gray-900 mb-4">Configuración del Agente</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                            <p className="font-semibold text-gray-900">Respuesta Automática</p>
                            <p className="text-sm text-gray-500">Responder mensajes automáticamente</p>
                        </div>
                        <div className="w-11 h-6 bg-gray-300 rounded-full"></div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="font-semibold text-gray-900 mb-2">Horario de Trabajo</p>
                        <div className="flex gap-4">
                            <input
                                type="time"
                                disabled
                                className="px-4 py-2 rounded-lg border border-gray-300 bg-white"
                                defaultValue="09:00"
                            />
                            <span className="self-center text-gray-500">hasta</span>
                            <input
                                type="time"
                                disabled
                                className="px-4 py-2 rounded-lg border border-gray-300 bg-white"
                                defaultValue="18:00"
                            />
                        </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="font-semibold text-gray-900 mb-2">Proyectos Máximos por Mes</p>
                        <input
                            type="number"
                            disabled
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white"
                            defaultValue="5"
                        />
                    </div>
                </div>
            </div>

            {/* Beta Signup */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white text-center">
                <h3 className="text-xl font-bold mb-2">¿Quieres acceso anticipado?</h3>
                <p className="mb-4 opacity-90">Regístrate en nuestra lista de espera para beta testing</p>
                <button className="px-6 py-3 bg-white text-purple-600 rounded-xl font-medium hover:bg-purple-50 transition-colors">
                    Unirme a la Lista
                </button>
            </div>
        </div>
    );
};

const FeatureCard: React.FC<{ icon: string; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="p-4 border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all">
        <div className="flex gap-3">
            <span className="material-symbols-outlined text-purple-600">{icon}</span>
            <div>
                <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
                <p className="text-sm text-gray-600">{description}</p>
            </div>
        </div>
    </div>
);

export default AIAgentSettings;
