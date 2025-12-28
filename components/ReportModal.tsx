import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    chatPartnerName: string;
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, chatPartnerName }) => {
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [justificationFile, setJustificationFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            setSubmitting(false);
            setSuccess(true);
        }, 1500);
    };

    if (success) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title="Reporte Enviado">
                <div className="text-center py-8 space-y-4">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                        <span className="material-symbols-outlined text-3xl">mark_email_read</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Reporte Recibido</h3>
                    <p className="text-gray-500 text-sm px-6">
                        Hemos recibido tu incidencia sobre <strong>{chatPartnerName}</strong>. Nuestro equipo de administración revisará los mensajes y justificantes adjuntos en las próximas 24 horas.
                    </p>
                    <Button onClick={() => { setSuccess(false); onClose(); }} className="w-full">Entendido</Button>
                </div>
            </Modal>
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Reportar Incidencia">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <p className="text-sm text-gray-500 mb-4">
                        Esto enviará una copia del historial de chat y tu justificación al equipo de soporte de AI Marketplace para su revisión.
                    </p>
                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Motivo del reporte</label>
                    <select
                        required
                        value={reason}
                        onChange={e => setReason(e.target.value)}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    >
                        <option value="">Selecciona un motivo...</option>
                        <option value="spam">Spam / Publicidad no deseada</option>
                        <option value="harassment">Acoso o lenguaje inapropiado</option>
                        <option value="fraud">Sospecha de fraude o estafa</option>
                        <option value="breach">Incumplimiento de términos del contrato</option>
                        <option value="other">Otro motivo</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Descripción / Justificación</label>
                    <textarea
                        required
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Describe detalladamente lo sucedido..."
                        rows={4}
                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Adjuntar justificante (Opcional)</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-200 border-dashed rounded-xl hover:border-primary transition-colors cursor-pointer bg-gray-50 group">
                        <div className="space-y-1 text-center">
                            <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors">cloud_upload</span>
                            <div className="flex text-sm text-gray-600">
                                <label className="relative cursor-pointer bg-transparent rounded-md font-bold text-primary hover:text-primary/80 focus-within:outline-none">
                                    <span>Sube un archivo</span>
                                    <input
                                        type="file"
                                        className="sr-only"
                                        onChange={e => setJustificationFile(e.target.files?.[0] || null)}
                                    />
                                </label>
                                <p className="pl-1">o arrastra y suelta</p>
                            </div>
                            <p className="text-xs text-gray-500">{justificationFile ? justificationFile.name : 'PNG, JPG, PDF hasta 10MB'}</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <Button variant="ghost" onClick={onClose} className="flex-1">Cancelar</Button>
                    <Button type="submit" loading={submitting} className="flex-1 bg-red-600 hover:bg-red-700 border-red-600">Enviar Reporte</Button>
                </div>
            </form>
        </Modal>
    );
};

export default ReportModal;
