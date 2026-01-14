/**
 * Toast Notification Utility
 * Provides native-like toast notifications without browser alerts
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    type: ToastType;
    message: string;
    duration: number;
}

class ToastManager {
    private container: HTMLDivElement | null = null;
    private toasts: Map<string, HTMLDivElement> = new Map();

    private ensureContainer() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 99999;
                display: flex;
                flex-direction: column;
                gap: 12px;
                pointer-events: none;
            `;
            document.body.appendChild(this.container);
        }
        return this.container;
    }

    private getToastStyles(type: ToastType): string {
        const baseStyles = `
            padding: 14px 20px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 300px;
            max-width: 500px;
            pointer-events: auto;
            animation: slideInRight 0.3s ease-out;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        const typeStyles = {
            success: 'background: #10b981; color: white;',
            error: 'background: #ef4444; color: white;',
            warning: 'background: #f59e0b; color: white;',
            info: 'background: #3b82f6; color: white;'
        };

        return baseStyles + typeStyles[type];
    }

    private getIcon(type: ToastType): string {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type];
    }

    show(type: ToastType, message: string, duration: number = 3000): string {
        const container = this.ensureContainer();
        const id = `toast-${Date.now()}-${Math.random()}`;

        // Create toast element
        const toast = document.createElement('div');
        toast.id = id;
        toast.style.cssText = this.getToastStyles(type);

        // Add icon
        const icon = document.createElement('span');
        icon.style.cssText = `
            font-size: 18px;
            font-weight: bold;
            flex-shrink: 0;
        `;
        icon.textContent = this.getIcon(type);

        // Add message
        const messageEl = document.createElement('span');
        messageEl.textContent = message;
        messageEl.style.cssText = 'flex: 1;';

        toast.appendChild(icon);
        toast.appendChild(messageEl);

        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        if (!document.getElementById('toast-animations')) {
            style.id = 'toast-animations';
            document.head.appendChild(style);
        }

        container.appendChild(toast);
        this.toasts.set(id, toast);

        // Auto-remove after duration
        setTimeout(() => {
            this.remove(id);
        }, duration);

        return id;
    }

    remove(id: string) {
        const toast = this.toasts.get(id);
        if (toast) {
            toast.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                toast.remove();
                this.toasts.delete(id);

                // Remove container if no toasts
                if (this.toasts.size === 0 && this.container) {
                    this.container.remove();
                    this.container = null;
                }
            }, 300);
        }
    }
}

// Singleton instance
const toastManager = new ToastManager();

/**
 * Show a toast notification
 * @param type - Type of toast: 'success', 'error', 'warning', or 'info'
 * @param message - Message to display
 * @param duration - Duration in milliseconds (default: 3000)
 * @returns Toast ID for manual removal if needed
 */
export const showToast = (type: ToastType, message: string, duration: number = 3000): string => {
    return toastManager.show(type, message, duration);
};

/**
 * Remove a specific toast by ID
 * @param id - Toast ID returned from showToast
 */
export const removeToast = (id: string): void => {
    toastManager.remove(id);
};

// Convenience methods
export const toast = {
    success: (message: string, duration?: number) => showToast('success', message, duration),
    error: (message: string, duration?: number) => showToast('error', message, duration),
    warning: (message: string, duration?: number) => showToast('warning', message, duration),
    info: (message: string, duration?: number) => showToast('info', message, duration)
};
