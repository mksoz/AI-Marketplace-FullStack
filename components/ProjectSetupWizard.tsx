import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import api from '../services/api';

interface MilestoneInput {
    title: string;
    description: string;
    amount: string;
    dueDate: string;
}

interface ProjectSetupWizardProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
    onSuccess: () => void;
    initialData?: {
        budget?: number;
    };
}

const ProjectSetupWizard: React.FC<ProjectSetupWizardProps> = ({ isOpen, onClose, projectId, onSuccess, initialData }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Form Data
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [milestones, setMilestones] = useState<MilestoneInput[]>([
        { title: 'Hito 1: Inicio', description: 'Kickoff y Planificación', amount: '0', dueDate: '' }
    ]);
    const [repoUrl, setRepoUrl] = useState('');
    const [repoName, setRepoName] = useState('');

    const handleAddMilestone = () => {
        setMilestones([...milestones, { title: '', description: '', amount: '', dueDate: '' }]);
    };

    const handleRemoveMilestone = (index: number) => {
        setMilestones(milestones.filter((_, i) => i !== index));
    };

    const handleMilestoneChange = (index: number, field: keyof MilestoneInput, value: string) => {
        const newMilestones = [...milestones];
        newMilestones[index][field] = value;
        setMilestones(newMilestones);
    };

    const handleSubmit = async () => {
        // Simple validation
        const invalidMilestone = milestones.find(m => !m.title || !m.dueDate);
        if (invalidMilestone) {
            alert("Todos los hitos deben tener un título y una fecha límite.");
            setStep(2);
            return;
        }

        try {
            setLoading(true);
            await api.post(`/projects/${projectId}/setup`, {
                startDate,
                endDate,
                milestones,
                repoUrl,
                repoName
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error setting up project", error);
            alert("Hubo un error al configurar el proyecto. Inténtalo de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    const renderStep1 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Paso 1: Cronograma General</h3>
            <p className="text-sm text-gray-500">Define las fechas estimadas de inicio y fin del proyecto. Esto servirá para generar la línea de tiempo del cliente.</p>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Fin (Estimada)</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Paso 2: Hitos y Pagos</h3>
            <p className="text-sm text-gray-500">Desglosa el presupuesto (${initialData?.budget || 0}) en hitos entregables.</p>

            <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {milestones.map((m, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-200 relative group">
                        <div className="grid grid-cols-12 gap-3 mb-2">
                            <div className="col-span-8">
                                <label className="text-xs font-bold text-gray-500 uppercase">Título del Hito</label>
                                <input
                                    type="text"
                                    value={m.title}
                                    placeholder="Ej. Diseño de UI"
                                    onChange={(e) => handleMilestoneChange(idx, 'title', e.target.value)}
                                    className="w-full bg-white p-2 border border-gray-200 rounded text-sm"
                                />
                            </div>
                            <div className="col-span-4">
                                <label className="text-xs font-bold text-gray-500 uppercase">Fecha Límite</label>
                                <input
                                    type="date"
                                    value={m.dueDate}
                                    onChange={(e) => handleMilestoneChange(idx, 'dueDate', e.target.value)}
                                    className="w-full bg-white p-2 border border-gray-200 rounded text-sm"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-12 gap-3">
                            <div className="col-span-8">
                                <label className="text-xs font-bold text-gray-500 uppercase">Descripción</label>
                                <input
                                    type="text"
                                    value={m.description}
                                    placeholder="Breve descripción del entregable..."
                                    onChange={(e) => handleMilestoneChange(idx, 'description', e.target.value)}
                                    className="w-full bg-white p-2 border border-gray-200 rounded text-sm"
                                />
                            </div>
                            <div className="col-span-4">
                                <label className="text-xs font-bold text-gray-500 uppercase">Pago ($)</label>
                                <div className="relative">
                                    <span className="absolute left-2 top-2 text-gray-500">$</span>
                                    <input
                                        type="number"
                                        value={m.amount}
                                        onChange={(e) => handleMilestoneChange(idx, 'amount', e.target.value)}
                                        className="w-full bg-white p-2 pl-6 border border-gray-200 rounded text-sm font-mono"
                                    />
                                </div>
                            </div>
                        </div>

                        {milestones.length > 1 && (
                            <button
                                onClick={() => handleRemoveMilestone(idx)}
                                className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full p-1 shadow-sm border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <button
                onClick={handleAddMilestone}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 text-sm font-bold hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
                <span className="material-symbols-outlined">add</span>
                Añadir Hito
            </button>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Paso 3: Integración de Repositorio</h3>
            <p className="text-sm text-gray-500">Conecta el repositorio de código para mostrar la actividad en tiempo real al cliente.</p>

            <div className="bg-gray-900 text-white p-6 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                </div>

                <div className="relative z-10 space-y-4">
                    <div>
                        <label className="text-gray-400 text-xs font-bold uppercase tracking-wider">URL del Repositorio (HTTPS)</label>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="material-symbols-outlined text-gray-500">link</span>
                            <input
                                type="text"
                                value={repoUrl}
                                onChange={(e) => setRepoUrl(e.target.value)}
                                placeholder="https://github.com/usuario/repo"
                                className="w-full bg-gray-800 border border-gray-700 text-white p-2 rounded focus:outline-none focus:border-white transition-colors"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-100">
                <span className="material-symbols-outlined shrink-0">info</span>
                <p>Si no tienes un repositorio aún, puedes conectarlo más tarde desde la configuración del proyecto.</p>
            </div>
        </div>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Configuración Inicial del Proyecto" size="2xl">
            <div className="p-1">
                {/* Stepper */}
                <div className="flex justify-between items-center mb-8 px-4">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex flex-col items-center gap-2 relative z-10">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${step >= s ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-gray-100 text-gray-400'
                                }`}>
                                {s}
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${step >= s ? 'text-primary' : 'text-gray-300'}`}>
                                {s === 1 ? 'Fechas' : s === 2 ? 'Hitos' : 'GitHub'}
                            </span>
                        </div>
                    ))}
                    {/* Line */}
                    <div className="absolute top-[88px] left-10 right-10 h-0.5 bg-gray-100 -z-0">
                        <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${((step - 1) / 2) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="min-h-[300px]">
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
                    <Button
                        variant="ghost"
                        onClick={step === 1 ? onClose : () => setStep(step - 1)}
                    >
                        {step === 1 ? 'Cancelar' : 'Atrás'}
                    </Button>

                    <Button
                        onClick={step === 3 ? handleSubmit : () => setStep(step + 1)}
                        loading={loading}
                        disabled={step === 1 && (!startDate || !endDate)}
                    >
                        {step === 3 ? 'Finalizar Configuración' : 'Siguiente'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default ProjectSetupWizard;
