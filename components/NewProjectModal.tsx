import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import { projectService } from '../services/projectService';
import { templateService, RequirementTemplate } from '../services/templateService';
import { useNavigate } from 'react-router-dom';

interface NewProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProjectCreated: () => void;
}

const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose, onProjectCreated }) => {
    const navigate = useNavigate();
    // Steps: 1=Choice, 2=TemplateList, 3=Form
    const [step, setStep] = useState<1 | 2 | 3>(1);

    // Data
    const [templates, setTemplates] = useState<RequirementTemplate[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<RequirementTemplate | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        budget: ''
    });
    // Store custom answers for non-mandatory fields (future proofing)
    const [customAnswers, setCustomAnswers] = useState<Record<string, any>>({});

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setFormData({ title: '', description: '', budget: '' });
            setCustomAnswers({});
            setSelectedTemplate(null);
            loadTemplates();
        }
    }, [isOpen]);

    const loadTemplates = async () => {
        try {
            const data = await templateService.getPublishedTemplates();
            setTemplates(data);
        } catch (err) {
            console.error("Failed to load templates", err);
        }
    };

    const handleStandardFlow = () => {
        setSelectedTemplate(null);
        setStep(3); // Go straight to form (standard)
    };

    const handleTemplateFlow = () => {
        setStep(2); // Go to template selector
    };

    const handleSelectTemplate = (t: RequirementTemplate) => {
        setSelectedTemplate(t);
        setStep(3);
    };

    // Strict ID Mapping Constants
    const FIELD_IDS = {
        TITLE: 'mandatory-title',
        DESC: 'mandatory-desc',
        BUDGET: 'mandatory-budget'
    };

    const handleInputChange = (field: any, value: any) => {
        const fieldId = field.id;

        // Strict Mapping: Rely solely on fixed IDs.
        if (fieldId === FIELD_IDS.TITLE) {
            setFormData(prev => ({ ...prev, title: value }));
        } else if (fieldId === FIELD_IDS.DESC) {
            setFormData(prev => ({ ...prev, description: value }));
        } else if (fieldId === FIELD_IDS.BUDGET) {
            setFormData(prev => ({ ...prev, budget: value }));
        } else {
            // Custom fields
            setCustomAnswers(prev => ({ ...prev, [fieldId]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic Validation
        if (!formData.title || !formData.description || !formData.budget) {
            setError('Por favor completa los campos obligatorios (Título, Descripción, Presupuesto).');
            return;
        }

        try {
            setLoading(true);
            setError('');

            // Payload
            const payload = {
                title: formData.title,
                description: formData.description,
                budget: parseFloat(formData.budget),
                // Pass template structure and answers for robust detail view
                templateData: selectedTemplate ? {
                    templateName: selectedTemplate.name,
                    templateDesc: selectedTemplate.description,
                    structure: selectedTemplate.structure,
                    answers: { ...customAnswers, [FIELD_IDS.BUDGET]: formData.budget, [FIELD_IDS.TITLE]: formData.title, [FIELD_IDS.DESC]: formData.description }
                } : undefined
            };

            // DEBUG: Check what is actually being sent
            window.alert(`Payload Budget: ${payload.budget}\nFormData Budget: ${formData.budget}\nAnswers: ${JSON.stringify(payload.templateData?.answers)}\nKeys in Answers: ${Object.keys(payload.templateData?.answers || {})}`);

            await projectService.createProject(payload);
            onProjectCreated();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al crear el proyecto.');
        } finally {
            setLoading(false);
        }
    };

    const renderDynamicField = (field: any) => {
        // Map mandatory fields to current values using hybrid logic
        let currentValue = customAnswers[field.id] || '';

        // Check Strict IDs
        if (field.id === FIELD_IDS.TITLE) {
            currentValue = formData.title;
        } else if (field.id === FIELD_IDS.DESC) {
            currentValue = formData.description;
        } else if (field.id === FIELD_IDS.BUDGET) {
            currentValue = formData.budget;
        }

        const isLocked = false;

        return (
            <div key={field.id} className="space-y-1">
                <label className="block text-sm font-bold text-gray-700">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                {field.helperText && <p className="text-xs text-gray-500 mb-1">{field.helperText}</p>}

                {field.type === 'textarea' ? (
                    <textarea
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none h-28"
                        placeholder="Escribe aquí..."
                        value={currentValue}
                        onChange={e => handleInputChange(field, e.target.value)}
                    />
                ) : field.type === 'select' ? (
                    <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                        value={currentValue}
                        onChange={e => handleInputChange(field, e.target.value)}
                    >
                        <option value="">Seleccionar...</option>
                        {field.options?.map((opt: string) => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                ) : (
                    <div className="relative">
                        <input
                            type={field.type}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                            placeholder={field.type === 'date' ? 'dd/mm/aaaa' : 'Respuesta...'}
                            value={currentValue}
                            onChange={e => handleInputChange(field, e.target.value)}
                        />
                        {/* Budget Currency Logic */}
                        {(field.id === FIELD_IDS.BUDGET) && (
                            <span className="absolute right-4 top-2 text-gray-400 font-bold text-sm">USD</span>
                        )}
                    </div>
                )}
            </div>
        );
    };

    // --- Render Helpers ---

    const renderStep1_Choice = () => (
        <div className="space-y-4">
            <div
                onClick={handleTemplateFlow}
                className="p-4 border border-gray-200 rounded-xl hover:border-primary hover:bg-blue-50 cursor-pointer transition-all flex items-center gap-4 group"
            >
                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg group-hover:bg-indigo-200">
                    <span className="material-symbols-outlined">library_add</span>
                </div>
                <div>
                    <h4 className="font-bold text-gray-900">Usar Plantilla Recomendada</h4>
                    <p className="text-sm text-gray-500">Comienza con un brief estructurado por expertos.</p>
                </div>
                <span className="material-symbols-outlined ml-auto text-gray-300 group-hover:text-primary">arrow_forward</span>
            </div>

            <div
                onClick={handleStandardFlow}
                className="p-4 border border-gray-200 rounded-xl hover:border-primary hover:bg-blue-50 cursor-pointer transition-all flex items-center gap-4 group"
            >
                <div className="p-3 bg-gray-100 text-gray-600 rounded-lg group-hover:bg-gray-200">
                    <span className="material-symbols-outlined">edit_document</span>
                </div>
                <div>
                    <h4 className="font-bold text-gray-900">Crear desde Cero</h4>
                    <p className="text-sm text-gray-500">Define tus propios requisitos libremente.</p>
                </div>
                <span className="material-symbols-outlined ml-auto text-gray-300 group-hover:text-primary">arrow_forward</span>
            </div>
        </div>
    );

    const renderStep2_TemplateList = () => (
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {templates.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                    <span className="material-symbols-outlined text-4xl mb-2">sentiment_dissatisfied</span>
                    <p>No hay plantillas públicas disponibles.</p>
                    <Button variant="ghost" className="mt-4" onClick={handleStandardFlow}>Continuar sin plantilla</Button>
                </div>
            ) : (
                templates.map(t => (
                    <div
                        key={t.id}
                        onClick={() => handleSelectTemplate(t)}
                        className="p-4 border border-gray-200 rounded-xl hover:border-primary hover:shadow-md cursor-pointer transition-all group"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-gray-900">{t.name}</h4>
                            <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">VERIFICADO</span>
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-2">{t.description}</p>
                    </div>
                ))
            )}
        </div>
    );

    const renderStep3_Form = () => (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>}

            {selectedTemplate ? (
                // DYNAMIC TEMPLATE FORM
                <div className="space-y-5 animate-in fade-in">
                    <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg flex items-center gap-3 mb-4">
                        <span className="material-symbols-outlined text-indigo-600">article</span>
                        <div>
                            <p className="text-xs font-bold text-indigo-800 uppercase">Plantilla</p>
                            <p className="text-sm font-bold text-indigo-900">{selectedTemplate.name}</p>
                        </div>
                        <button type="button" onClick={() => setStep(2)} className="ml-auto text-xs text-indigo-600 underline hover:text-indigo-800">Cambiar</button>
                    </div>

                    {selectedTemplate.structure.map((field: any) => renderDynamicField(field))}
                </div>
            ) : (
                // STANDARD STATIC FORM
                <>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Título del Proyecto</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={e => handleInputChange({ id: FIELD_IDS.TITLE }, e.target.value)}
                            placeholder="Ej. Chatbot de Atención al Cliente"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Descripción Detallada</label>
                        <textarea
                            value={formData.description}
                            onChange={e => handleInputChange({ id: FIELD_IDS.DESC }, e.target.value)}
                            placeholder="Describe tus requerimientos..."
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Presupuesto Estimado (USD)</label>
                        <input
                            type="number"
                            value={formData.budget}
                            onChange={e => handleInputChange({ id: FIELD_IDS.BUDGET }, e.target.value)}
                            placeholder="Ej. 5000"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>
                </>
            )}

            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <Button variant="ghost" onClick={() => {
                    if (step === 3 && selectedTemplate) setStep(2);
                    else if (step === 3 && !selectedTemplate) setStep(1);
                    else if (step === 2) setStep(1);
                    else onClose();
                }} type="button">Atrás</Button>

                <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? 'Publicando...' : 'Publicar Proyecto'}
                </Button>
            </div>
        </form>
    );

    const getTitle = () => {
        if (step === 1) return "Comenzar Nuevo Proyecto";
        if (step === 2) return "Seleccionar Plantilla";
        return "Detalles del Proyecto";
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={getTitle()}>
            {step === 1 && renderStep1_Choice()}
            {step === 2 && renderStep2_TemplateList()}
            {step === 3 && renderStep3_Form()}
        </Modal>
    );
};

export default NewProjectModal;
