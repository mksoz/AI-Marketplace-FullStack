import React, { useState } from 'react';

interface CreateProtectedFolderModalProps {
    milestones: any[];
    onClose: () => void;
    onCreate: (milestoneId: string, folderName: string) => Promise<void>;
}

const CreateProtectedFolderModal: React.FC<CreateProtectedFolderModalProps> = ({
    milestones,
    onClose,
    onCreate
}) => {
    const [selectedMilestoneId, setSelectedMilestoneId] = useState('');
    const [folderName, setFolderName] = useState('');
    const [loading, setLoading] = useState(false);

    // Use all milestones (completed or not)
    const availableMilestones = milestones;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMilestoneId || !folderName.trim()) return;

        setLoading(true);
        try {
            await onCreate(selectedMilestoneId, folderName.trim());
            onClose();
        } catch (error) {
            console.error('Error creating folder:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">folder_special</span>
                    Nueva Carpeta Protegida
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre de la Carpeta
                        </label>
                        <input
                            autoFocus
                            type="text"
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            placeholder="Ej: Diseños Fase 1"
                            value={folderName}
                            onChange={e => setFolderName(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Asociar a Hito
                        </label>
                        <select
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            value={selectedMilestoneId}
                            onChange={e => setSelectedMilestoneId(e.target.value)}
                            required
                        >
                            <option value="">Selecciona un hito...</option>
                            {availableMilestones.map(milestone => (
                                <option key={milestone.id} value={milestone.id}>
                                    Hito {milestone.order}: {milestone.title}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                            Solo se muestran hitos no completados
                        </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex gap-2">
                            <span className="material-symbols-outlined text-blue-600 text-sm">info</span>
                            <p className="text-xs text-blue-800">
                                La carpeta se desbloqueará automáticamente cuando el cliente apruebe el pago del hito seleccionado.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-50 rounded-lg transition-colors"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                            disabled={loading || !selectedMilestoneId || !folderName.trim()}
                        >
                            {loading && <span className="material-symbols-outlined animate-spin text-sm">sync</span>}
                            Crear Carpeta
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateProtectedFolderModal;
