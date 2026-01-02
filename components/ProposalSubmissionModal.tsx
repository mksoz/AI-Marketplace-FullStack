import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import api from '../services/api';

interface Field {
    id: string;
    label: string;
    helperText?: string;
    type: 'text' | 'textarea' | 'number' | 'select' | 'date';
    inputFormat?: 'single' | 'range';
    required: boolean;
    options?: string[];
    validation?: {
        min?: number | string;
        max?: number | string;
    };
}

interface Template {
    id: string;
    name: string;
    description: string;
    structure: Field[];
    // ...
}

interface ProposalSubmissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    vendorId: string;
    vendorName: string;
    templates: Template[];
}

const ProposalSubmissionModal: React.FC<ProposalSubmissionModalProps> = ({ isOpen, onClose, vendorId, vendorName, templates }) => {
    const [step, setStep] = useState<'select-template' | 'fill-form' | 'success'>('select-template');
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset state on open
    useEffect(() => {
        if (isOpen) {
            setStep('select-template');
            setSelectedTemplate(null);
            setFormData({});
            setError(null);

            // Auto-select if only one template
            if (templates.length === 1) {
                setSelectedTemplate(templates[0]);
                setStep('fill-form');
            }
        }
    }, [isOpen, templates]);

    const handleTemplateSelect = (t: Template) => {
        setSelectedTemplate(t);
        setStep('fill-form');
    };

    const handleInputChange = (fieldId: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [fieldId]: value
        }));
    };

    const validateForm = () => {
        if (!selectedTemplate) return false;
        for (const field of selectedTemplate.structure) {
            if (field.required && !formData[field.id]) {
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!selectedTemplate || !validateForm()) {
            setError('Por favor completa todos los campos obligatorios.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Construct payload
            // We use the first text/textarea answer as description, or a default
            const description = selectedTemplate.name + ' Request';

            // Extract Budget using Strict Mapping or Label Fallback
            let budget = 0;
            // 1. Check Strict ID
            if (formData['mandatory-budget']) {
                budget = parseFloat(formData['mandatory-budget']);
            }
            // 2. Fallback Label Search
            else {
                const budgetField = selectedTemplate.structure.find(f => f.label.toLowerCase().includes('presupuesto') || f.label.toLowerCase().includes('budget'));
                if (budgetField && formData[budgetField.id]) {
                    budget = parseFloat(formData[budgetField.id]);
                }
            }

            await api.post('/projects/request', {
                title: `Solicitud: ${selectedTemplate.name}`,
                description: description, // In real app, maybe concatenate Q&A
                budget: budget || 0, // Ensure no NaN
                vendorId: vendorId,
                templateData: {
                    templateId: selectedTemplate.id,
                    templateName: selectedTemplate.name,
                    answers: formData
                }
            });

            setStep('success');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Error al enviar la propuesta.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={step === 'success' ? '¡Solicitud Enviada!' : `Nueva Propuesta para ${vendorName}`}
            size="2xl"
        >
            <div className="min-h-[400px]">
                {/* STEP 1: SELECT TEMPLATE */}
                {step === 'select-template' && (
                    <div className="space-y-6">
                        <p className="text-gray-600">Este proveedor ofrece los siguientes servicios predefinidos. Selecciona el que mejor se adapte a tus necesidades.</p>
                        <div className="grid grid-cols-1 gap-4">
                            {templates.map(t => (
                                <div
                                    key={t.id}
                                    onClick={() => handleTemplateSelect(t)}
                                    className="border border-gray-200 rounded-xl p-6 hover:border-primary hover:shadow-md cursor-pointer transition-all flex justify-between items-center group"
                                >
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary">{t.name}</h3>
                                        <p className="text-sm text-gray-500 mt-1">{t.description}</p>
                                    </div>
                                    <span className="material-symbols-outlined text-gray-300 group-hover:text-primary">arrow_forward_ios</span>
                                </div>
                            ))}
                        </div>
                        {templates.length === 0 && (
                            <div className="text-center py-12 bg-gray-50 rounded-xl">
                                <p className="text-gray-500">Este proveedor no tiene plantillas públicas disponibles.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 2: FILL FORM */}
                {step === 'fill-form' && selectedTemplate && (
                    <div className="space-y-6">
                        <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-blue-900">{selectedTemplate.name}</h3>
                                <p className="text-xs text-blue-700">{selectedTemplate.description}</p>
                            </div>
                            {templates.length > 1 && (
                                <button onClick={() => setStep('select-template')} className="text-xs font-bold text-blue-600 hover:underline">Cambiar</button>
                            )}
                        </div>

                        <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2">
                            {selectedTemplate.structure.map(field => (
                                <div key={field.id}>
                                    <label className="block text-sm font-bold text-gray-900 mb-1">
                                        {field.label} {field.required && <span className="text-red-500">*</span>}
                                    </label>
                                    {field.helperText && (
                                        <p className="text-xs text-gray-500 mb-2">{field.helperText}</p>
                                    )}

                                    {field.type === 'textarea' ? (
                                        <textarea
                                            className="w-full rounded-xl border-gray-300 shadow-sm focus:border-primary focus:ring-primary h-24 px-4 py-3"
                                            value={formData[field.id] || ''}
                                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                                            placeholder="Escribe aquí..."
                                        />
                                    ) : (
                                        // Number, Date, Text
                                        field.id === 'mandatory-budget' ? (
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    min={field.validation?.min}
                                                    max={field.validation?.max}
                                                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-primary focus:ring-primary h-11 px-4"
                                                    placeholder="Respuesta..."
                                                    value={formData[field.id] || ''}
                                                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                                                />
                                                <span className="absolute right-4 top-2.5 text-gray-400 font-bold text-sm">USD</span>
                                            </div>
                                        ) : (
                                            <input
                                                type={field.type}
                                                min={field.validation?.min}
                                                max={field.validation?.max}
                                                className="w-full rounded-xl border-gray-300 shadow-sm focus:border-primary focus:ring-primary h-11 px-4"
                                                placeholder="Respuesta..."
                                                value={formData[field.id] || ''}
                                                onChange={(e) => handleInputChange(field.id, e.target.value)}
                                            />
                                        )
                                    )}
                                </div>
                            ))}
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>
                        )}

                        <div className="flex gap-4 pt-4 border-t border-gray-100">
                            <Button variant="ghost" onClick={onClose} className="flex-1 justify-center">Cancelar</Button>
                            <Button
                                variant="primary"
                                onClick={handleSubmit}
                                isLoading={loading}
                                className="flex-1 justify-center"
                            >
                                Enviar Propuesta
                            </Button>
                        </div>
                    </div>
                )}

                {/* STEP 3: SUCCESS */}
                {step === 'success' && (
                    <div className="text-center py-12 space-y-6">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto animate-in zoom-in duration-300">
                            <span className="material-symbols-outlined text-4xl">check_circle</span>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">¡Propuesta Enviada con Éxito!</h3>
                            <p className="text-gray-500 max-w-md mx-auto">
                                El proveedor {vendorName} ha recibido tu solicitud y se pondrá en contacto contigo pronto. Puedes seguir el estado en "Mis Proyectos".
                            </p>
                        </div>
                        <Button onClick={onClose} size="lg">Entendido</Button>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default ProposalSubmissionModal;
