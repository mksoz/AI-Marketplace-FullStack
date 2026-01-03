import React from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';

interface NewProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProjectCreated?: () => void; // Kept for compatibility but unused
}

const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();

    const handleNavigate = (path: string) => {
        onClose();
        navigate(path);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Comenzar Nuevo Proyecto">
            <div className="p-4">
                <p className="text-gray-500 mb-6 text-center">¿Cómo te gustaría iniciar tu próximo proyecto?</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Option 1: Explore */}
                    <div
                        onClick={() => handleNavigate('/search')}
                        className="p-6 border border-gray-200 rounded-2xl hover:border-primary hover:bg-blue-50 cursor-pointer transition-all group flex flex-col items-center text-center gap-4"
                    >
                        <div className="w-16 h-16 rounded-full bg-blue-100 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-3xl">travel_explore</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-gray-900 mb-1">Explorar Vendors</h3>
                            <p className="text-sm text-gray-500">Encuentra socios nuevos en el marketplace.</p>
                        </div>
                    </div>

                    {/* Option 2: My Vendors */}
                    <div
                        onClick={() => handleNavigate('/client/vendors')}
                        className="p-6 border border-gray-200 rounded-2xl hover:border-primary hover:bg-blue-50 cursor-pointer transition-all group flex flex-col items-center text-center gap-4"
                    >
                        <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-3xl">groups</span>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-gray-900 mb-1">Mis Vendors</h3>
                            <p className="text-sm text-gray-500">Inicia proyecto con tus contactos actuales.</p>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default NewProjectModal;
