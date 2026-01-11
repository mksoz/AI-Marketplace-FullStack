export const NOTIFICATION_CONFIG = {
    // Propuestas
    PROPOSAL_RECEIVED: {
        icon: 'description',
        color: '#3b82f6',
        bg: '#eff6ff',
        category: 'Propuestas',
    },
    PROPOSAL_ACCEPTED: {
        icon: 'check_circle',
        color: '#10b981',
        bg: '#f0fdf4',
        category: 'Propuestas',
    },
    PROPOSAL_REJECTED: {
        icon: 'cancel',
        color: '#ef4444',
        bg: '#fef2f2',
        category: 'Propuestas',
    },
    PROPOSAL_UPDATED: {
        icon: 'edit_note',
        color: '#f59e0b',
        bg: '#fffbeb',
        category: 'Propuestas',
    },

    // Proyectos
    PROJECT_CREATED: {
        icon: 'folder_open',
        color: '#8b5cf6',
        bg: '#faf5ff',
        category: 'Proyectos',
    },
    PROJECT_STARTED: {
        icon: 'play_circle',
        color: '#10b981',
        bg: '#f0fdf4',
        category: 'Proyectos',
    },
    PROJECT_COMPLETED: {
        icon: 'task_alt',
        color: '#10b981',
        bg: '#f0fdf4',
        category: 'Proyectos',
    },
    PROJECT_CANCELLED: {
        icon: 'block',
        color: '#ef4444',
        bg: '#fef2f2',
        category: 'Proyectos',
    },

    // Hitos & Entregas
    MILESTONE_COMPLETED: {
        icon: 'flag',
        color: '#10b981',
        bg: '#f0fdf4',
        category: 'Hitos',
    },
    MILESTONE_APPROVED: {
        icon: 'verified',
        color: '#10b981',
        bg: '#f0fdf4',
        category: 'Hitos',
    },
    MILESTONE_REJECTED: {
        icon: 'thumb_down',
        color: '#ef4444',
        bg: '#fef2f2',
        category: 'Hitos',
    },
    DELIVERABLE_UPLOADED: {
        icon: 'upload_file',
        color: '#3b82f6',
        bg: '#eff6ff',
        category: 'Entregas',
    },
    DELIVERABLE_APPROVED: {
        icon: 'check_circle',
        color: '#10b981',
        bg: '#f0fdf4',
        category: 'Entregas',
    },
    DEADLINE_REMINDER: {
        icon: 'schedule',
        color: '#f59e0b',
        bg: '#fffbeb',
        category: 'Recordatorios',
    },

    // Finanzas
    PAYMENT_REQUESTED: {
        icon: 'payments',
        color: '#8b5cf6',
        bg: '#faf5ff',
        category: 'Pagos',
    },
    PAYMENT_APPROVED: {
        icon: 'account_balance',
        color: '#10b981',
        bg: '#f0fdf4',
        category: 'Pagos',
    },
    PAYMENT_REJECTED: {
        icon: 'money_off',
        color: '#ef4444',
        bg: '#fef2f2',
        category: 'Pagos',
    },
    PAYMENT_COMPLETED: {
        icon: 'paid',
        color: '#10b981',
        bg: '#f0fdf4',
        category: 'Pagos',
    },
    PAYMENT_FAILED: {
        icon: 'error',
        color: '#ef4444',
        bg: '#fef2f2',
        category: 'Pagos',
    },

    // Mensajes
    MESSAGE_RECEIVED: {
        icon: 'chat',
        color: '#3b82f6',
        bg: '#eff6ff',
        category: 'Mensajes',
    },
    MESSAGE_REPLY: {
        icon: 'reply',
        color: '#3b82f6',
        bg: '#eff6ff',
        category: 'Mensajes',
    },

    // Calendario
    EVENT_CREATED: {
        icon: 'event',
        color: '#3b82f6',
        bg: '#eff6ff',
        category: 'Calendario',
    },
    EVENT_INVITATION: {
        icon: 'event_available',
        color: '#8b5cf6',
        bg: '#faf5ff',
        category: 'Calendario',
    },
    EVENT_ACCEPTED: {
        icon: 'event_note',
        color: '#10b981',
        bg: '#f0fdf4',
        category: 'Calendario',
    },
    EVENT_REJECTED: {
        icon: 'event_busy',
        color: '#ef4444',
        bg: '#fef2f2',
        category: 'Calendario',
    },
    EVENT_PROPOSED: {
        icon: 'schedule_send',
        color: '#f59e0b',
        bg: '#fffbeb',
        category: 'Calendario',
    },
    EVENT_REMINDER: {
        icon: 'alarm',
        color: '#f59e0b',
        bg: '#fffbeb',
        category: 'Recordatorios',
    },

    // Archivos
    FILE_UPLOADED: {
        icon: 'cloud_upload',
        color: '#3b82f6',
        bg: '#eff6ff',
        category: 'Archivos',
    },
    FILE_UPDATED: {
        icon: 'update',
        color: '#f59e0b',
        bg: '#fffbeb',
        category: 'Archivos',
    },
    FOLDER_CREATED: {
        icon: 'create_new_folder',
        color: '#8b5cf6',
        bg: '#faf5ff',
        category: 'Archivos',
    },
    FOLDER_ACCESS: {
        icon: 'folder_open',
        color: '#3b82f6',
        bg: '#eff6ff',
        category: 'Archivos',
    },

    // Contratos
    CONTRACT_GENERATED: {
        icon: 'contract',
        color: '#8b5cf6',
        bg: '#faf5ff',
        category: 'Contratos',
    },
    CONTRACT_SIGNED: {
        icon: 'draw',
        color: '#10b981',
        bg: '#f0fdf4',
        category: 'Contratos',
    },
    CONTRACT_REMINDER: {
        icon: 'edit_document',
        color: '#f59e0b',
        bg: '#fffbeb',
        category: 'Contratos',
    },

    // Incidencias
    INCIDENT_CREATED: {
        icon: 'error_outline',
        color: '#ef4444',
        bg: '#fef2f2',
        category: 'Incidencias',
    },
    INCIDENT_ASSIGNED: {
        icon: 'assignment_ind',
        color: '#f59e0b',
        bg: '#fffbeb',
        category: 'Incidencias',
    },
    INCIDENT_RESOLVED: {
        icon: 'task_alt',
        color: '#10b981',
        bg: '#f0fdf4',
        category: 'Incidencias',
    },
    INCIDENT_UPDATED: {
        icon: 'update',
        color: '#3b82f6',
        bg: '#eff6ff',
        category: 'Incidencias',
    },
    INCIDENT_CRITICAL: {
        icon: 'warning',
        color: '#dc2626',
        bg: '#fef2f2',
        category: 'Incidencias',
    },

    // Reviews
    REVIEW_RECEIVED: {
        icon: 'star',
        color: '#f59e0b',
        bg: '#fffbeb',
        category: 'Reviews',
    },
    REVIEW_REPLIED: {
        icon: 'reply',
        color: '#3b82f6',
        bg: '#eff6ff',
        category: 'Reviews',
    },

    // GitHub
    GITHUB_COMMIT: {
        icon: 'commit',
        color: '#6366f1',
        bg: '#eef2ff',
        category: 'GitHub',
    },
    GITHUB_RELEASE: {
        icon: 'new_releases',
        color: '#10b981',
        bg: '#f0fdf4',
        category: 'GitHub',
    },
    GITHUB_MILESTONE: {
        icon: 'military_tech',
        color: '#f59e0b',
        bg: '#fffbeb',
        category: 'GitHub',
    },

    // Sistema
    SYSTEM_ASSIGNMENT: {
        icon: 'person_add',
        color: '#8b5cf6',
        bg: '#faf5ff',
        category: 'Sistema',
    },
    SYSTEM_REMINDER: {
        icon: 'notifications',
        color: '#f59e0b',
        bg: '#fffbeb',
        category: 'Sistema',
    },
    SYSTEM_SUCCESS: {
        icon: 'celebration',
        color: '#10b981',
        bg: '#f0fdf4',
        category: 'Sistema',
    },
    SYSTEM_WARNING: {
        icon: 'warning',
        color: '#f59e0b',
        bg: '#fffbeb',
        category: 'Sistema',
    },
} as const;

export type NotificationType = keyof typeof NOTIFICATION_CONFIG;
