import React, { useState, useEffect } from 'react';
import VendorLayout from '../../components/VendorLayout';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { templateService } from '../../services/templateService';

interface Field {
    id: string;
    label: string;
    helperText?: string;
    type: 'text' | 'textarea' | 'number' | 'select' | 'date';
    inputFormat?: 'single' | 'range'; // For number, date
    required: boolean;
    options?: string[]; // For select
    validation?: {
        min?: number | string;
        max?: number | string;
    };
    isMandatory?: boolean; // New Flag
    currency?: string; // New: Default currency if pre-selected, or just to mark it
}

interface Template {
    id: string;
    name: string;
    description: string;
    structure: Field[];
    status: 'DRAFT' | 'PUBLISHED';
    updatedAt?: string;
    createdAt?: string;
}

const MANDATORY_FIELDS: Field[] = [
    {
        id: 'mandatory-title',
        label: 'Título del Proyecto',
        type: 'text',
        required: true,
        isMandatory: true,
        helperText: 'Asigna un nombre claro a tu proyecto.'
    },
    {
        id: 'mandatory-desc',
        label: 'Descripción Detallada',
        type: 'textarea',
        required: true,
        isMandatory: true,
        helperText: 'Describe los objetivos y alcance del trabajo.'
    },
    {
        id: 'mandatory-budget',
        label: 'Presupuesto Estimado',
        type: 'number',
        required: true,
        isMandatory: true,
        inputFormat: 'single',
        validation: { min: 0 }
    }
];

const TemplateEditor: React.FC = () => {
    // Main View Mode: 'list' (My Templates) or 'editor' (Working on a template)
    const [view, setView] = useState<'list' | 'editor'>('list');

    // Editor Sub-View: 'build' (Structure Editor) or 'preview' (Client View)
    const [editorTab, setEditorTab] = useState<'build' | 'preview'>('build');

    // Data
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);

    // Editor State
    const [currentTemplateId, setCurrentTemplateId] = useState<string | null>(null);
    const [templateName, setTemplateName] = useState('Nueva Plantilla');
    const [templateDesc, setTemplateDesc] = useState('');
    const [fields, setFields] = useState<Field[]>(MANDATORY_FIELDS);
    const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');
    const [isSaving, setIsSaving] = useState(false);

    // Delete Modal State
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

    // Currencies
    const currencyOptions = ['EUR', 'USD', 'GBP'];

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        try {
            setLoading(true);
            const data = await templateService.getMyTemplates();
            // @ts-ignore
            setTemplates(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateNew = () => {
        resetEditor();
        setView('editor');
    };

    const handleEdit = (t: Template) => {
        setTemplateName(t.name);
        setTemplateDesc(t.description || '');

        // Ensure mandatory fields exist if opening an old template (migration logic)
        let loadedFields = t.structure as Field[];
        const hasTitle = loadedFields.some(f => f.id === 'mandatory-title');
        const hasDesc = loadedFields.some(f => f.id === 'mandatory-desc');
        const hasBudget = loadedFields.some(f => f.id === 'mandatory-budget');

        if (!hasTitle || !hasDesc || !hasBudget) {
            // Prepend missing mandatory fields
            const missing = MANDATORY_FIELDS.filter(mf => !loadedFields.some(lf => lf.id === mf.id));
            loadedFields = [...missing, ...loadedFields];
        }

        setFields(loadedFields);
        setStatus(t.status);
        setCurrentTemplateId(t.id);
        setEditorTab('build');
        setView('editor');
    };

    const resetEditor = () => {
        setTemplateName('Nueva Plantilla de Requisitos');
        setTemplateDesc('');
        setFields([...MANDATORY_FIELDS]);
        setStatus('DRAFT');
        setCurrentTemplateId(null);
        setEditorTab('build');
    };

    // Trigger Delete Flow
    const handleDeleteClick = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setTemplateToDelete(id);
        setDeleteModalOpen(true);
    };

    // Confirm Delete
    const handleConfirmDelete = async () => {
        if (!templateToDelete) return;
        try {
            // @ts-ignore
            await templateService.deleteTemplate(templateToDelete);
            await loadTemplates();
            setDeleteModalOpen(false);
            setTemplateToDelete(null);
        } catch (error) {
            alert('Error al eliminar');
        }
    };

    const handleSave = async (newStatus: 'DRAFT' | 'PUBLISHED') => {
        try {
            if (status === 'PUBLISHED' && newStatus === 'DRAFT') {
                alert("No se puede devolver una plantilla publicada a borrador.");
                return;
            }

            setIsSaving(true);

            // Strictly enforce IDs for system fields before saving
            const sanitizedFields = fields.map(f => {
                if (f.isMandatory) {
                    if (f.label.toLowerCase().includes('título') || f.label.toLowerCase().includes('title')) return { ...f, id: 'mandatory-title' };
                    if (f.label.toLowerCase().includes('descripc') || f.label.toLowerCase().includes('desc')) return { ...f, id: 'mandatory-desc' };
                    if (f.label.toLowerCase().includes('presupuesto') || f.label.toLowerCase().includes('budget')) return { ...f, id: 'mandatory-budget' };
                }
                return f;
            });

            const payload = {
                name: templateName,
                description: templateDesc,
                structure: sanitizedFields,
                isDefault: false,
                status: newStatus
            };

            if (currentTemplateId) {
                // @ts-ignore
                await templateService.updateTemplate(currentTemplateId, payload);
            } else {
                await templateService.createTemplate(payload);
            }

            await loadTemplates();
            setView('list');
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.message || error.message || 'Error desconocido';
            alert(`Error al guardar: ${msg}`);
        } finally {
            setIsSaving(false);
        }
    };

    const addField = (type: Field['type']) => {
        if (status === 'PUBLISHED') return; // Lockdown
        const newField: Field = {
            id: Date.now().toString(),
            label: type === 'text' ? 'Texto Corto' : type === 'textarea' ? 'Texto Largo' : type === 'number' ? 'Número' : type === 'date' ? 'Fecha' : 'Selección',
            type,
            required: false,
            inputFormat: (type === 'number' || type === 'date') ? 'single' : undefined,
            options: type === 'select' ? ['Opción 1', 'Opción 2'] : undefined,
            isMandatory: false
        };
        setFields([...fields, newField]);
    };

    const updateField = (id: string, updates: Partial<Field>) => {
        // Validation: Cannot uncheck required for mandatory fields
        const target = fields.find(f => f.id === id);
        if (target?.isMandatory && updates.required === false) {
            return;
        }

        if (status === 'PUBLISHED') return;

        setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
    };

    const removeField = (id: string) => {
        if (status === 'PUBLISHED') return; // Lockdown
        const target = fields.find(f => f.id === id);
        if (target?.isMandatory) return; // Prevent deleting mandatory
        setFields(fields.filter(f => f.id !== id));
    };

    const moveField = (index: number, direction: 'up' | 'down') => {
        if (status === 'PUBLISHED') return; // Lockdown
        const newFields = [...fields];
        if (direction === 'up' && index > 0) {
            [newFields[index], newFields[index - 1]] = [newFields[index - 1], newFields[index]];
        } else if (direction === 'down' && index < newFields.length - 1) {
            [newFields[index], newFields[index + 1]] = [newFields[index + 1], newFields[index]];
        }
        setFields(newFields);
    };

    // Sub-components
    const renderCard = (t: Template) => (
        <div key={t.id} className="group bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer relative overflow-hidden flex flex-col h-full" onClick={() => handleEdit(t)}>
            <div className={`absolute top-0 right-0 px-2 py-0.5 rounded-bl-lg text-[9px] font-bold uppercase tracking-wide ${t.status === 'PUBLISHED' ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
                {t.status === 'PUBLISHED' ? 'Publicado' : 'Borrador'}
            </div>

            <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-xl">fact_check</span>
                </div>
                {/* Delete Button */}
                <button
                    onClick={(e) => handleDeleteClick(t.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                    title="Eliminar Plantilla"
                >
                    <span className="material-symbols-outlined text-lg">delete</span>
                </button>
            </div>

            <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-base mb-1 leading-tight">{t.name}</h3>
                <p className="text-xs text-gray-500 line-clamp-2">{t.description || "Sin descripción"}</p>
            </div>

            <div className="flex items-center gap-3 text-[10px] font-medium text-gray-400 border-t border-gray-50 pt-3 mt-4">
                <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">list</span>
                    {(t.structure as Field[]).length}
                </span>
                <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">calendar_today</span>
                    {t.updatedAt ? new Date(t.updatedAt).toLocaleDateString() : 'N/A'}
                </span>
            </div>
        </div>
    );

    const renderList = () => {
        const drafts = templates.filter(t => t.status === 'DRAFT');
        const published = templates.filter(t => t.status === 'PUBLISHED');

        return (
            <div className="space-y-12 animate-in fade-in duration-300">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Mis Plantillas</h1>
                        <p className="text-gray-500 mt-2 max-w-2xl">
                            Gestiona dos tipos de formularios: Borradores en proceso y Plantillas publicadas listas para los clientes.
                        </p>
                    </div>
                    <Button onClick={handleCreateNew} className="shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-transform">
                        <span className="material-symbols-outlined mr-2">add</span>
                        Nueva Plantilla
                    </Button>
                </div>

                {/* Published Section */}
                <section>
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500"></span>
                        Publicadas ({published.length})
                    </h2>
                    {published.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {published.map(t => renderCard(t))}
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-400 border border-dashed border-gray-200">
                            No tienes plantillas publicadas.
                        </div>
                    )}
                </section>

                {/* Drafts Section */}
                <section>
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                        Borradores ({drafts.length})
                    </h2>
                    {drafts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {drafts.map(t => renderCard(t))}
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-400 border border-dashed border-gray-200">
                            No tienes borradores.
                        </div>
                    )}
                </section>
            </div>
        );
    };

    const renderEditor = () => (
        <div className="flex flex-col h-[calc(100vh-100px)] animate-in slide-in-from-right duration-300">
            {/* Common Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={() => setView('list')} className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <input
                            value={templateName}
                            onChange={e => setTemplateName(e.target.value)}
                            className="text-xl font-bold bg-transparent border-none focus:ring-0 p-0 text-gray-900 placeholder:text-gray-300 w-full outline-none"
                            placeholder="Nombre de la Plantilla"
                        />
                        <input
                            value={templateDesc}
                            onChange={e => setTemplateDesc(e.target.value)}
                            className="text-sm text-gray-500 bg-transparent border-none focus:ring-0 p-0 w-full outline-none"
                            placeholder="Añade una breve descripción para el cliente..."
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* View Toggle */}
                    <div className="flex bg-gray-100 rounded-lg p-1 mr-4">
                        <button
                            onClick={() => setEditorTab('build')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${editorTab === 'build' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Editor
                        </button>
                        <button
                            onClick={() => setEditorTab('preview')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${editorTab === 'preview' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            Vista Previa
                        </button>
                    </div>

                    {status === 'DRAFT' && (
                        <Button variant="ghost" onClick={() => handleSave('DRAFT')} disabled={isSaving}>Guardar Borrador</Button>
                    )}
                    {status === 'PUBLISHED' ? (
                        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg border border-green-200">
                            <span className="material-symbols-outlined text-sm">lock</span>
                            <span className="text-sm font-bold">Plantilla Publicada</span>
                        </div>
                    ) : (
                        <Button variant="primary" onClick={() => handleSave('PUBLISHED')} disabled={isSaving}>
                            Publicar Plantilla
                        </Button>
                    )}
                </div>
            </div>

            {/* Main Content Area - Swaps between Builder and Preview */}
            <div className="flex-1 flex overflow-hidden">

                {editorTab === 'build' ? (
                    // BUILDER VIEW
                    <>
                        {/* Left: Toolbar - Disabled if Published */}
                        <div className={`w-64 bg-white border-r border-gray-200 p-6 overflow-y-auto hidden lg:block shrink-0 animate-in fade-in slide-in-from-left duration-300 ${status === 'PUBLISHED' ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Elementos</h3>
                            <div className="space-y-3">
                                {[
                                    { type: 'text', icon: 'short_text', label: 'Texto Corto' },
                                    { type: 'textarea', icon: 'notes', label: 'Párrafo' },
                                    { type: 'number', icon: '123', label: 'Numérico' },
                                    { type: 'select', icon: 'list', label: 'Selección' },
                                    { type: 'date', icon: 'calendar_today', label: 'Fecha' }
                                ].map(item => (
                                    <button key={item.type} onClick={() => addField(item.type as Field['type'])} className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-primary hover:bg-blue-50 text-left transition-all group">
                                        <span className="material-symbols-outlined text-gray-400 group-hover:text-primary">{item.icon}</span>
                                        <span className="text-sm font-bold text-gray-600 group-hover:text-primary">{item.label}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-2 mb-2 text-primary">
                                    <span className="material-symbols-outlined text-sm">lightbulb</span>
                                    <span className="text-xs font-bold">Consejo Pro</span>
                                </div>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    Define si el cliente debe introducir un valor exacto o un rango estimado en los campos numéricos y de fecha.
                                </p>
                            </div>
                        </div>

                        {/* Center: Builder Canvas - Block Layout for safe scrolling */}
                        <div className="flex-1 bg-gray-50 overflow-y-auto p-8 animate-in fade-in duration-300">

                            {status === 'PUBLISHED' && (
                                <div className="mb-6 bg-amber-50 rounded-full px-4 py-1.5 text-xs font-bold text-amber-700 border border-amber-200 shadow-sm flex items-center gap-2 max-w-2xl mx-auto">
                                    <span className="material-symbols-outlined text-sm">lock</span>
                                    Modo Edición Limitada: La plantilla está publicada y protegida contra cambios.
                                </div>
                            )}

                            <div className="w-full max-w-2xl mx-auto space-y-6">
                                {/* Template Header Info */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 border-b border-gray-100 group/header relative hover:bg-gray-50/50 transition-colors">
                                    {status !== 'PUBLISHED' && (
                                        <div className="absolute top-4 right-4 opacity-0 group-hover/header:opacity-100 transition-opacity pointer-events-none">
                                            <span className="material-symbols-outlined text-gray-300">edit</span>
                                        </div>
                                    )}
                                    <input
                                        type="text"
                                        value={templateName}
                                        onChange={(e) => setTemplateName(e.target.value)}
                                        disabled={status === 'PUBLISHED'}
                                        className="w-full text-3xl font-black text-gray-900 placeholder:text-gray-300 border-none p-0 focus:ring-0 outline-none bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="Título de la Plantilla"
                                    />
                                    <textarea
                                        value={templateDesc}
                                        onChange={(e) => setTemplateDesc(e.target.value)}
                                        disabled={status === 'PUBLISHED'}
                                        className="w-full text-base text-gray-500 placeholder:text-gray-300 border-none p-0 focus:ring-0 outline-none resize-none bg-transparent mt-2 block disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="Descripción o instrucciones generales para el cliente..."
                                        rows={1}
                                        style={{ minHeight: '1.5rem', height: 'auto' }}
                                        onInput={(e) => {
                                            const target = e.target as HTMLTextAreaElement;
                                            target.style.height = 'auto';
                                            target.style.height = target.scrollHeight + 'px';
                                        }}
                                    />
                                </div>

                                {/* SYSTEM FIELDS SECTION */}
                                <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 overflow-hidden">
                                    <div className="bg-indigo-50/50 px-6 py-4 border-b border-indigo-100 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-indigo-600">settings_account_box</span>
                                        <h3 className="font-bold text-indigo-900 text-sm uppercase tracking-wide">Configuración del Proyecto (Campos Sistema)</h3>
                                    </div>
                                    <div className="p-6 space-y-6">
                                        {/* Mandatory Title & Desc (Implicitly handled by System, but we show them as 'locked' visuals or editable labels if needed?) 
                                            Actually, let's allow editing the LABEL of these fields to customize user experience 
                                        */}
                                        {fields.filter(f => f.isMandatory).map(field => (
                                            <div key={field.id} className="flex gap-4 items-start">
                                                <div className="mt-2 text-indigo-300">
                                                    <span className="material-symbols-outlined">
                                                        {field.id.includes('budget') ? 'attach_money' : field.id.includes('title') ? 'title' : 'description'}
                                                    </span>
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="flex justify-between">
                                                        <label className="text-xs font-bold text-indigo-400 uppercase">{field.id.includes('budget') ? 'Campo de Presupuesto' : field.id.includes('title') ? 'Campo de Título' : 'Campo de Descripción'}</label>
                                                        <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-bold">REQUERIDO</span>
                                                    </div>
                                                    <input
                                                        value={field.label}
                                                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                                                        className="font-bold text-gray-900 bg-transparent border-b border-gray-200 focus:border-indigo-500 p-0 focus:ring-0 w-full placeholder:text-gray-300 text-base outline-none pb-1 transition-colors"
                                                        placeholder="Etiqueta del campo..."
                                                        disabled={status === 'PUBLISHED'}
                                                    />
                                                    <input
                                                        value={field.helperText || ''}
                                                        onChange={(e) => updateField(field.id, { helperText: e.target.value })}
                                                        className="text-sm text-gray-500 bg-transparent border-none p-0 focus:ring-0 w-full placeholder:text-gray-300 italic outline-none"
                                                        placeholder="Instrucciones para el cliente..."
                                                        disabled={status === 'PUBLISHED'}
                                                    />

                                                    {/* Budget Specifics */}
                                                    {field.id === 'mandatory-budget' && (
                                                        <div className="mt-2 flex items-center gap-4 bg-gray-50 p-2 rounded-lg">
                                                            <span className="text-xs text-gray-500">Divisa Visualización:</span>
                                                            <div className="flex gap-2">
                                                                {['USD', 'EUR', 'GBP'].map(curr => (
                                                                    <span key={curr} className={`text-xs font-bold px-2 py-1 rounded cursor-default ${curr === 'USD' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`}>{curr}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* DRAGGABLE CONTENT AREA */}
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-8 min-h-[300px]">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Preguntas Adicionales</h3>

                                    {fields.filter(f => !f.isMandatory).map((field, idx) => {
                                        // Find actual index in full array for movement
                                        const realIndex = fields.findIndex(f => f.id === field.id);
                                        return (
                                            <div key={field.id} className={`relative group border-2 border-transparent hover:border-primary/20 rounded-xl p-4 transition-all ${status !== 'PUBLISHED' ? 'hover:bg-gray-50/50' : ''}`}>

                                                {/* Actions */}
                                                {status !== 'PUBLISHED' && (
                                                    <div className="absolute right-4 top-4 hidden group-hover:flex gap-2 z-10">
                                                        <button onClick={() => moveField(realIndex, 'up')} disabled={realIndex <= fields.filter(f => f.isMandatory).length} className="p-1.5 bg-white text-gray-500 rounded-md shadow-sm border border-gray-100 hover:bg-gray-50 disabled:opacity-50">
                                                            <span className="material-symbols-outlined text-lg">arrow_upward</span>
                                                        </button>
                                                        <button onClick={() => moveField(realIndex, 'down')} disabled={realIndex === fields.length - 1} className="p-1.5 bg-white text-gray-500 rounded-md shadow-sm border border-gray-100 hover:bg-gray-50 disabled:opacity-50">
                                                            <span className="material-symbols-outlined text-lg">arrow_downward</span>
                                                        </button>
                                                        <button onClick={() => removeField(field.id)} className="p-1.5 bg-white text-red-500 rounded-md shadow-sm border border-gray-100 hover:bg-red-50">
                                                            <span className="material-symbols-outlined text-lg">delete</span>
                                                        </button>
                                                    </div>
                                                )}

                                                <div className="space-y-3">
                                                    {/* Label Edit */}
                                                    <input
                                                        value={field.label}
                                                        onChange={(e) => updateField(field.id, { label: e.target.value })}
                                                        className="font-bold text-gray-900 bg-transparent border-none p-0 focus:ring-0 w-full placeholder:text-gray-300 text-lg outline-none"
                                                        placeholder="Escribe la pregunta aquí..."
                                                        disabled={status === 'PUBLISHED'}
                                                    />

                                                    {/* Helper Text Edit */}
                                                    <input
                                                        value={field.helperText || ''}
                                                        onChange={(e) => updateField(field.id, { helperText: e.target.value })}
                                                        className="text-sm text-gray-500 bg-transparent border-none p-0 focus:ring-0 w-full placeholder:text-gray-300 italic outline-none"
                                                        placeholder="Añade una descripción o ayuda para el cliente (opcional)"
                                                        disabled={status === 'PUBLISHED'}
                                                    />

                                                    {/* Field Configuration Area */}
                                                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200/50 space-y-4">

                                                        {/* Type Specific Configs */}
                                                        {field.type === 'select' && (
                                                            <div className="space-y-2">
                                                                <label className="text-xs font-bold text-gray-500 uppercase">Opciones (separadas por coma)</label>
                                                                <input
                                                                    value={field.options?.join(', ') || ''}
                                                                    onChange={(e) => updateField(field.id, { options: e.target.value.split(',').map(s => s.trim()) })}
                                                                    disabled={status === 'PUBLISHED'}
                                                                    className="w-full text-sm bg-white border border-gray-200 rounded-md px-3 py-2 outline-none focus:border-primary disabled:bg-gray-100"
                                                                    placeholder="Opción 1, Opción 2, Opción 3"
                                                                />
                                                            </div>
                                                        )}

                                                        {(field.type === 'number' || field.type === 'date') && (
                                                            <div className="space-y-4">
                                                                <div>
                                                                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Tipo de Entrada para el Cliente</label>
                                                                    <div className="flex gap-4">
                                                                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                                                            <input
                                                                                type="radio"
                                                                                name={`format-${field.id}`}
                                                                                checked={field.inputFormat === 'single'}
                                                                                onChange={() => updateField(field.id, { inputFormat: 'single' })}
                                                                                disabled={status === 'PUBLISHED'}
                                                                            />
                                                                            Valor Único
                                                                        </label>
                                                                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                                                            <input
                                                                                type="radio"
                                                                                name={`format-${field.id}`}
                                                                                checked={field.inputFormat === 'range'}
                                                                                onChange={() => updateField(field.id, { inputFormat: 'range' })}
                                                                                disabled={status === 'PUBLISHED'}
                                                                            />
                                                                            Rango
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Preview of Input (Disabled) */}
                                                        <div className="opacity-60 pointer-events-none pt-2">
                                                            {field.type === 'textarea' ? (
                                                                <div className="h-24 bg-white rounded-lg border border-gray-300 w-full"></div>
                                                            ) : field.type === 'select' ? (
                                                                <div className="h-10 bg-white rounded-lg border border-gray-300 w-full flex items-center px-4 text-gray-400 text-sm justify-between">
                                                                    <span>Seleccione una opción...</span>
                                                                    <span className="material-symbols-outlined text-sm">expand_more</span>
                                                                </div>
                                                            ) : (
                                                                <div className="flex gap-2">
                                                                    <div className="h-10 bg-white rounded-lg border border-gray-300 w-full flex items-center px-4 text-gray-400 text-sm justify-between">
                                                                        <span>{field.type === 'date' ? 'dd/mm/aaaa' : '0.00'}</span>
                                                                    </div>
                                                                    {field.inputFormat === 'range' && (
                                                                        <>
                                                                            <span className="self-center text-gray-400">-</span>
                                                                            <div className="h-10 bg-white rounded-lg border border-gray-300 w-full flex items-center px-4 text-gray-400 text-sm">
                                                                                {field.type === 'date' ? 'dd/mm/aaaa' : '0.00'}
                                                                            </div>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4 pt-1">
                                                        <label className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={field.required}
                                                                onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                                                disabled={status === 'PUBLISHED'}
                                                                className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary disabled:opacity-50"
                                                            />
                                                            <span className="text-xs font-medium text-gray-500">Obligatorio</span>
                                                        </label>
                                                        <span className="text-xs text-gray-300">|</span>
                                                        <span className="text-xs text-gray-400 uppercase font-bold">{field.type}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}

                                    {fields.filter(f => !f.isMandatory).length === 0 && (
                                        <div className="text-center py-12 text-gray-300">
                                            <span className="material-symbols-outlined text-4xl mb-2">move_item</span>
                                            <p>Arrastra elementos o haz clic para añadir campos vacíos</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    // PREVIEW VIEW - Replaces Main Content
                    <div className="flex-1 bg-gray-50 overflow-y-auto p-4 md:p-8 flex justify-center animate-in fade-in duration-300">
                        <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-xl flex flex-col h-fit">
                            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
                                <div>
                                    <span className="text-xs font-bold text-primary uppercase tracking-wide mb-1 block">Vista Previa del Cliente</span>
                                    <h2 className="text-xl font-black text-gray-900">Iniciar Nuevo Proyecto</h2>
                                </div>
                            </div>

                            <div className="p-8 md:p-12 space-y-8">
                                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-8">
                                    <h3 className="font-bold text-blue-900 mb-2">{templateName}</h3>
                                    <p className="text-sm text-blue-700">{templateDesc}</p>
                                </div>

                                <form className="space-y-8">
                                    {fields.map(field => (
                                        <div key={field.id}>
                                            <label className="block text-sm font-bold text-gray-900 mb-1">
                                                {field.label} {field.required && <span className="text-red-500">*</span>}
                                            </label>
                                            {field.helperText && (
                                                <p className="text-xs text-gray-500 mb-2">{field.helperText}</p>
                                            )}

                                            {field.type === 'textarea' ? (
                                                <textarea className="w-full rounded-xl border-gray-300 shadow-sm focus:border-primary focus:ring-primary h-32 px-4 py-3" placeholder="Escribe aquí..."></textarea>
                                            ) : field.type === 'select' ? (
                                                <select className="w-full rounded-xl border-gray-300 shadow-sm focus:border-primary focus:ring-primary h-11 px-4">
                                                    <option value="">Selecciona una opción...</option>
                                                    {field.options?.map((opt, i) => (
                                                        <option key={i} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <div className="flex gap-4">
                                                    <div className="relative w-full">
                                                        <input
                                                            type={field.type}
                                                            min={field.validation?.min}
                                                            max={field.validation?.max}
                                                            className="w-full rounded-xl border-gray-300 shadow-sm focus:border-primary focus:ring-primary h-11 px-4"
                                                            placeholder={field.inputFormat === 'range' ? (field.type === 'date' ? 'Desde...' : 'Mínimo...') : 'Tu respuesta...'}
                                                        />
                                                        {/* Currency Selector for Mandatory Budget */}
                                                        {field.id === 'mandatory-budget' && (
                                                            <div className="absolute right-1 top-1 bottom-1">
                                                                <select
                                                                    value={field.currency || 'USD'}
                                                                    onChange={(e) => updateField(field.id, { currency: e.target.value })}
                                                                    className="h-full border-none bg-gray-50 text-gray-600 font-bold rounded-r-lg focus:ring-0 text-xs px-2 cursor-pointer hover:bg-gray-100"
                                                                >
                                                                    {currencyOptions.map(c => <option key={c} value={c}>{c}</option>)}
                                                                </select>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {field.inputFormat === 'range' && (
                                                        <input
                                                            type={field.type}
                                                            min={field.validation?.min}
                                                            max={field.validation?.max}
                                                            className="w-full rounded-xl border-gray-300 shadow-sm focus:border-primary focus:ring-primary h-11 px-4"
                                                            placeholder={field.type === 'date' ? 'Hasta...' : 'Máximo...'}
                                                        />
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    <div className="pt-8 border-t border-gray-100 flex justify-end gap-3">
                                        <Button variant="primary" size="lg" disabled className="opacity-50 cursor-not-allowed">
                                            Enviar Propuesta (Vista Previa)
                                        </Button>
                                    </div>
                                </form>
                            </div>

                            <div className="p-4 bg-gray-50 border-t border-gray-100 text-center text-xs text-gray-400 rounded-b-2xl">
                                Esta es una simulación. No se enviará ninguna propuesta real.
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
    return (
        <div className="h-full">
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
                </div>
            ) : view === 'list' ? (
                renderList()
            ) : (
                renderEditor()
            )}

            <Modal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="Eliminar Plantilla"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">¿Estás seguro de que deseas eliminar esta plantilla? Esta acción no se puede deshacer.</p>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>Cancelar</Button>
                        <Button variant="primary" onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700 border-transparent text-white">
                            Sí, eliminar
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default TemplateEditor;
