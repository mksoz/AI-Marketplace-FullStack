import React, { useState, useEffect } from 'react';

interface EditProtectedFolderModalProps {
    isOpen: boolean;
    folderId: string;
    currentName: string;
    onClose: () => void;
    onUpdate: (folderId: string, name: string) => Promise<void>;
}

const EditProtectedFolderModal: React.FC<EditProtectedFolderModalProps> = ({
    isOpen,
    folderId,
    currentName,
    onClose,
    onUpdate
}) => {
    const [name, setName] = useState(currentName);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setName(currentName);
    }, [currentName, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        try {
            await onUpdate(folderId, name.trim());
            onClose();
        } catch (error) {
            console.error('Error updating folder:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">edit</span>
                    Editar Carpeta
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
                            placeholder="Nombre de la carpeta"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                        />
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
                            disabled={loading || !name.trim()}
                        >
                            {loading && <span className="material-symbols-outlined animate-spin text-sm">sync</span>}
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProtectedFolderModal;
