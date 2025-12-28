
import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import { projectService } from '../services/projectService';
import { useNavigate } from 'react-router-dom';

interface NewProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onProjectCreated: () => void;
}

const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose, onProjectCreated }) => {
    const navigate = useNavigate();
    const [step, setStep] = useState<1 | 2>(1); // 1: Selection, 2: Form
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        budget: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Reset step on close
    React.useEffect(() => {
        if (isOpen) setStep(1);
    }, [isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.description || !formData.budget) {
            setError('Todos los campos son obligatorios');
            return;
        }

        try {
            setLoading(true);
            setError('');
            await projectService.createProject({
                title: formData.title,
                description: formData.description,
                budget: parseFloat(formData.budget)
            });
            onProjectCreated();
            onClose();
            setFormData({ title: '', description: '', budget: '' });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al crear el proyecto.');
        } finally {
            setLoading(false);
        }
    };

    const handleExplore = () => {
        onClose();
        navigate('/search');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={step === 1 ? "Comenzar Nuevo Proyecto" : "Detalles del Proyecto"}>

            {step === 1 ? (
                <div className="space-y-4">
                    <p className="text-gray-600 mb-6">¿Cómo deseas iniciar este proyecto?</p>

                    <div
                        onClick={() => setStep(2)}
                        className="p-4 border border-gray-200 rounded-xl hover:border-primary hover:bg-blue-50 cursor-pointer transition-all flex items-center gap-4 group"
                    >
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-full group-hover:bg-blue-200">
                            <span className="material-symbols-outlined">group</span>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900">Trabajar con un Vendor Actual</h4>
                            <p className="text-sm text-gray-500">Crear proyecto para asignar a un contacto existente.</p>
                        </div>
                    </div>

                    <div
                        onClick={handleExplore}
                        className="p-4 border border-gray-200 rounded-xl hover:border-primary hover:bg-blue-50 cursor-pointer transition-all flex items-center gap-4 group"
                    >
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-full group-hover:bg-purple-200">
                            <span className="material-symbols-outlined">explore</span>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900">Explorar Nuevos Vendors</h4>
                            <p className="text-sm text-gray-500">Buscar en el mercado global el mejor talento.</p>
                        </div>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>}

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Título del Proyecto</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Ej. Chatbot de Atención al Cliente"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Descripción Detallada</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe tus requerimientos, objetivos y tecnologías preferidas..."
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Presupuesto Estimado (USD)</label>
                        <input
                            type="number"
                            name="budget"
                            value={formData.budget}
                            onChange={handleChange}
                            placeholder="Ej. 5000"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setStep(1)} type="button">Atrás</Button>
                        <Button variant="primary" type="submit" disabled={loading}>
                            {loading ? 'Publicando...' : 'Publicar Proyecto'}
                        </Button>
                    </div>
                </form>
            )}
        </Modal>
    );
};

export default NewProjectModal;

