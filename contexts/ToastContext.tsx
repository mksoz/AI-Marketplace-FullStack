import React, { createContext, useContext, useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    type: ToastType;
    message: string;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = `toast-${Date.now()}-${Math.random()}`;
        const newToast: Toast = { id, type, message };

        setToasts(prev => [...prev, newToast]);

        // Auto remove after 4 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-[9999] space-y-2 pointer-events-none">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto animate-in slide-in-from-right-full duration-300 fade-in min-w-[300px] max-w-md p-4 rounded-xl shadow-2xl border-2 flex items-start gap-3 ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
                                toast.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
                                    toast.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                                        'bg-blue-50 border-blue-200 text-blue-800'
                            }`}
                    >
                        <span className={`material-symbols-outlined text-2xl ${toast.type === 'success' ? 'text-green-600' :
                                toast.type === 'error' ? 'text-red-600' :
                                    toast.type === 'warning' ? 'text-amber-600' :
                                        'text-blue-600'
                            }`}>
                            {toast.type === 'success' ? 'check_circle' :
                                toast.type === 'error' ? 'error' :
                                    toast.type === 'warning' ? 'warning' :
                                        'info'}
                        </span>
                        <p className="flex-1 font-medium text-sm leading-relaxed">{toast.message}</p>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
