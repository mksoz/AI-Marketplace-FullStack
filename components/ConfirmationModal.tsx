import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Button from './Button';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    variant = 'info'
}) => {
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setTimeout(() => setAnimate(true), 10);
        } else {
            setAnimate(false);
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const getIcon = () => {
        switch (variant) {
            case 'danger': return 'error';
            case 'warning': return 'warning';
            default: return 'info';
        }
    };

    const getColor = () => {
        switch (variant) {
            case 'danger': return 'text-red-600 bg-red-100';
            case 'warning': return 'text-orange-600 bg-orange-100';
            default: return 'text-blue-600 bg-blue-100';
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${animate ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className={`relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 transform transition-all duration-300 ${animate ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${getColor()}`}>
                    <span className="material-symbols-outlined text-2xl">{getIcon()}</span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                    {message}
                </p>

                <div className="flex gap-3 justify-end">
                    <Button variant="ghost" onClick={onClose}>
                        {cancelText}
                    </Button>
                    <Button
                        variant="primary"
                        className={variant === 'danger' ? 'bg-red-600 hover:bg-red-700 border-red-600' : ''}
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ConfirmationModal;
