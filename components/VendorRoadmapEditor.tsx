import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';

interface Milestone {
    id: string;
    title: string;
    description: string;
    amount: number;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'PAID';
    dueDate?: string;
    isPaid?: boolean;
}

export interface VendorRoadmapEditorRef {
    openNotifyModal: () => void;
}

interface VendorRoadmapEditorProps {
    project: any;
    isEditing: boolean;
    onSave: (newMilestones: Milestone[], notificationText?: string) => Promise<void>;
    onCancel: () => void;
}

const VendorRoadmapEditor = forwardRef<VendorRoadmapEditorRef, VendorRoadmapEditorProps>(({ project, isEditing, onSave, onCancel }, ref) => {
    const [milestones, setMilestones] = useState<Milestone[]>([]);

    // Edit/Add Modal State
    const [showModal, setShowModal] = useState(false);
    const [currentNode, setCurrentNode] = useState<Partial<Milestone>>({});
    const [insertIndex, setInsertIndex] = useState<number | null>(null);
    const [error, setError] = useState('');

    // Notify Client Modal State
    const [showNotifyModal, setShowNotifyModal] = useState(false);
    const [notificationText, setNotificationText] = useState('');
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');

    useEffect(() => {
        if (project?.milestones) {
            setMilestones(JSON.parse(JSON.stringify(project.milestones)));
        }
    }, [project]);

    // On Cancel from Parent
    useEffect(() => {
        if (!isEditing) {
            if (project?.milestones) {
                setMilestones(JSON.parse(JSON.stringify(project.milestones)));
            }
        }
    }, [isEditing, project]);

    useImperativeHandle(ref, () => ({
        openNotifyModal: () => {
            setShowNotifyModal(true);
            setSaveStatus('idle');
        }
    }));

    const handleConfirmSave = async () => {
        setSaveStatus('saving');
        await onSave(milestones, notificationText);
        setSaveStatus('success');

        // Auto close after success
        setTimeout(() => {
            setShowNotifyModal(false);
            setNotificationText('');
            setSaveStatus('idle');
        }, 1500);
    };

    const openAddModal = (index: number) => {
        setInsertIndex(index);
        setCurrentNode({
            title: '',
            description: '',
            amount: 0,
            status: 'PENDING',
            dueDate: ''
        });
        setError('');
        setShowModal(true);
    };

    const openEditModal = (milestone: Milestone) => {
        setInsertIndex(null);
        setCurrentNode({ ...milestone });
        setError('');
        setShowModal(true);
    };

    const handleDeleteNode = (id: string) => {
        if (window.confirm('¿Eliminar este hito?')) {
            setMilestones(prev => prev.filter(m => m.id !== id));
        }
    };

    const validateDates = (dateStr: string, index: number, isNew: boolean) => {
        if (!dateStr) return null;
        const date = new Date(dateStr).getTime();

        let prevNode = null;
        let nextNode = null;

        if (isNew && insertIndex !== null) {
            prevNode = insertIndex > 0 ? milestones[insertIndex - 1] : null;
            nextNode = insertIndex < milestones.length ? milestones[insertIndex] : null;
        } else {
            const currentIndex = milestones.findIndex(m => m.id === currentNode.id);
            prevNode = currentIndex > 0 ? milestones[currentIndex - 1] : null;
            nextNode = currentIndex < milestones.length - 1 ? milestones[currentIndex + 1] : null;
        }

        if (prevNode?.dueDate && new Date(prevNode.dueDate).getTime() > date) {
            return `La fecha debe ser posterior al hito anterior (${new Date(prevNode.dueDate).toLocaleDateString()})`;
        }
        if (nextNode?.dueDate && new Date(nextNode.dueDate).getTime() < date) {
            return `La fecha debe ser anterior al hito siguiente (${new Date(nextNode.dueDate).toLocaleDateString()})`;
        }

        return null;
    };

    const handleSaveNode = () => {
        if (!currentNode.title || !currentNode.dueDate || currentNode.amount === undefined) {
            setError('Todos los campos son obligatorios');
            return;
        }

        const dateError = validateDates(currentNode.dueDate, insertIndex ?? 0, insertIndex !== null);
        if (dateError) {
            setError(dateError);
            return;
        }

        if (insertIndex !== null) {
            const newNode: Milestone = {
                ...(currentNode as Milestone),
                id: `m-new-${Date.now()}`,
                status: 'PENDING',
                isPaid: false
            };
            const newMilestones = [...milestones];
            newMilestones.splice(insertIndex, 0, newNode);
            setMilestones(newMilestones);
        } else {
            setMilestones(prev => prev.map(m => m.id === currentNode.id ? { ...m, ...currentNode } as Milestone : m));
        }

        setShowModal(false);
    };

    return (
        <div className="space-y-6">
            <div className={`relative pl-8 space-y-12 before:content-[''] before:absolute before:top-0 before:left-[23px] before:h-full before:w-0.5 before:bg-gray-200 transition-opacity ${isEditing ? 'opacity-100' : ''}`}>

                {isEditing && milestones.length > 0 && milestones[0].status === 'PENDING' && (
                    <div className="absolute -left-[5px] -top-8 w-14 flex justify-center z-20">
                        <button
                            onClick={() => openAddModal(0)}
                            className="bg-primary text-white p-1 rounded-full shadow-lg hover:scale-110 transition-transform"
                            title="Insertar Hito al Inicio"
                        >
                            <span className="material-symbols-outlined text-sm">add</span>
                        </button>
                    </div>
                )}

                {milestones.map((milestone, index) => {
                    const isCompleted = milestone.status === 'COMPLETED' || milestone.status === 'PAID';
                    const isInProgress = milestone.status === 'IN_PROGRESS';
                    const isPending = milestone.status === 'PENDING';
                    const isLocked = isCompleted;

                    return (
                        <div key={milestone.id} className="relative group/node">
                            <div className={`absolute -left-[29px] top-0 h-12 w-12 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 transition-all
                                    ${isCompleted ? 'bg-green-100 text-green-600' :
                                    isInProgress ? 'bg-primary text-white shadow-lg' :
                                        'bg-white border-2 border-gray-300 text-gray-300'}
                                `}>
                                {isCompleted ? <span className="material-symbols-outlined">check</span> :
                                    isInProgress ? <span className="material-symbols-outlined animate-pulse">sync</span> :
                                        <span className="font-bold">{index + 1}</span>}
                            </div>

                            <div className={`p-6 rounded-2xl border relative overflow-hidden transition-all group-hover/node:shadow-md
                                    ${isCompleted ? 'bg-white border-green-200 shadow-sm' :
                                    isInProgress ? 'bg-white border-2 border-primary shadow-md' :
                                        'bg-gray-50 border-gray-200 border-dashed'}
                                `}>
                                {isCompleted && <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">COMPLETADO</div>}
                                {isInProgress && <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-xl">EN PROGRESO</div>}

                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className={`text-xl font-bold mb-2 ${isPending ? 'text-gray-500' : 'text-gray-900'}`}>{milestone.title}</h3>
                                        <p className={`mb-4 text-sm ${isPending ? 'text-gray-400' : 'text-gray-600'}`}>{milestone.description}</p>
                                    </div>

                                    {isEditing && !isLocked && (
                                        <div className="flex gap-2 ml-4">
                                            <button
                                                onClick={() => openEditModal(milestone)}
                                                className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                title="Editar Hito"
                                            >
                                                <span className="material-symbols-outlined">edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteNode(milestone.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Eliminar Hito"
                                            >
                                                <span className="material-symbols-outlined">delete</span>
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-between items-center text-sm border-t border-gray-100 pt-4 mt-2">
                                    <div>
                                        <span className={`block font-bold ${isPending ? 'text-gray-400' : 'text-gray-900'}`}>${milestone.amount.toLocaleString()} USD</span>
                                        <span className="text-xs text-gray-500">{milestone.isPaid ? 'Pagado' : (isCompleted ? 'En Garantía' : 'Pendiente')}</span>
                                    </div>
                                    <div className="text-right">
                                        {milestone.dueDate && (
                                            <>
                                                <span className={`block font-bold ${isPending ? 'text-gray-400' : 'text-primary'}`}>Entrega estimada</span>
                                                <span className="text-xs text-gray-500">{new Date(milestone.dueDate).toLocaleDateString()}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {isEditing && !isLocked && (
                                <div className="absolute left-[24px] -bottom-8 w-0.5 h-8 z-20 flex items-center justify-center">
                                    <button
                                        onClick={() => openAddModal(index + 1)}
                                        className="bg-white border-2 border-primary text-primary w-6 h-6 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors shadow-sm transform translate-x-[-1px]"
                                        title="Insertar Hito Aquí"
                                    >
                                        <span className="material-symbols-outlined text-sm font-bold">add</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 animate-in zoom-in-95">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">{insertIndex !== null ? 'Añadir Nuevo Hito' : 'Editar Hito'}</h3>

                        {error && (
                            <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium flex items-center gap-2">
                                <span className="material-symbols-outlined">error</span> {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Título del Hito</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                                    value={currentNode.title}
                                    onChange={e => setCurrentNode({ ...currentNode, title: e.target.value })}
                                    placeholder="Ej. Diseño UI/UX"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Costo (USD)</label>
                                    <input
                                        type="number"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                                        value={currentNode.amount}
                                        onChange={e => setCurrentNode({ ...currentNode, amount: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Fecha de Entrega</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                                        value={currentNode.dueDate ? new Date(currentNode.dueDate).toISOString().split('T')[0] : ''}
                                        onChange={e => setCurrentNode({ ...currentNode, dueDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Descripción / Entregables</label>
                                <textarea
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none h-24"
                                    value={currentNode.description}
                                    onChange={e => setCurrentNode({ ...currentNode, description: e.target.value })}
                                    placeholder="Resumen de lo que se entregará..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-6 mt-2">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-50 rounded-lg">Cancelar</button>
                            <button onClick={handleSaveNode} className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90">Guardar Hito</button>
                        </div>
                    </div>
                </div>
            )}

            {showNotifyModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95">
                        {saveStatus === 'success' ? (
                            <div className="text-center py-6">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in spin-in-180">
                                    <span className="material-symbols-outlined text-4xl">check</span>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">¡Roadmap Actualizado!</h3>
                                <p className="text-gray-500 text-sm mt-2">Los cambios se han guardado y el cliente ha sido notificado.</p>
                            </div>
                        ) : (
                            <>
                                <div className="text-center mb-6">
                                    <div className="w-12 h-12 bg-blue-100 text-primary rounded-full flex items-center justify-center mx-auto mb-3">
                                        <span className="material-symbols-outlined text-2xl">send</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">Actualizar Roadmap</h3>
                                    <p className="text-gray-500 text-sm mt-1">Se notificará al cliente sobre los cambios realizados.</p>
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Mensaje opcional para el cliente</label>
                                    <textarea
                                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none resize-none h-24 bg-gray-50 text-sm"
                                        placeholder="Hola, he ajustado las fechas de los próximos hitos debido a..."
                                        value={notificationText}
                                        onChange={e => setNotificationText(e.target.value)}
                                        disabled={saveStatus === 'saving'}
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowNotifyModal(false)}
                                        className="flex-1 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl text-sm"
                                        disabled={saveStatus === 'saving'}
                                    >
                                        Volver a editar
                                    </button>
                                    <button
                                        onClick={handleConfirmSave}
                                        className="flex-1 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/20 text-sm flex items-center justify-center gap-2"
                                        disabled={saveStatus === 'saving'}
                                    >
                                        {saveStatus === 'saving' ? (
                                            <>
                                                <span className="material-symbols-outlined animate-spin text-lg">sync</span> Guardando...
                                            </>
                                        ) : (
                                            'Confirmar y Enviar'
                                        )}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
});

export default VendorRoadmapEditor;
