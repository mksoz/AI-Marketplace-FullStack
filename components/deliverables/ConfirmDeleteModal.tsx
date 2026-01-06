import React from 'react';

interface ConfirmDeleteModalProps {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
    title,
    message,
    onConfirm,
    onCancel
}) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-red-100 rounded-lg">
                        <span className="material-symbols-outlined text-red-600 text-2xl">warning</span>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
                        <p className="text-sm text-gray-600">{message}</p>
                    </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                    <p className="text-xs text-amber-800 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">info</span>
                        Esta acción no se puede deshacer
                    </p>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">delete</span>
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDeleteModal;
