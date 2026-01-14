import { DisputeStatus, DisputeResolutionType } from '../types/dispute';

/**
 * Format amount as currency
 */
export const formatDisputeAmount = (amount: number): string => {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

/**
 * Get Tailwind color classes for status badge
 */
export const getStatusColor = (status: DisputeStatus): string => {
    switch (status) {
        case 'OPEN':
            return 'bg-red-100 text-red-700';
        case 'IN_PROGRESS':
            return 'bg-yellow-100 text-yellow-700';
        case 'INVESTIGATING':
            return 'bg-orange-100 text-orange-700';
        case 'RESOLVED':
            return 'bg-green-100 text-green-700';
        case 'CANCELLED':
            return 'bg-gray-100 text-gray-700';
        default:
            return 'bg-gray-100 text-gray-700';
    }
};

/**
 * Get Spanish status text
 */
export const getStatusText = (status: DisputeStatus): string => {
    switch (status) {
        case 'OPEN':
            return 'Abierta';
        case 'IN_PROGRESS':
            return 'En Progreso';
        case 'INVESTIGATING':
            return 'Investigando';
        case 'RESOLVED':
            return 'Resuelta';
        case 'CANCELLED':
            return 'Cancelada';
        default:
            return status;
    }
};

/**
 * Get resolution type text in Spanish
 */
export const getResolutionText = (resolution?: DisputeResolutionType): string => {
    if (!resolution) return '-';

    switch (resolution) {
        case 'REFUND_CLIENT':
            return 'Reembolso Total';
        case 'RELEASE_VENDOR':
            return 'Liberación Total';
        case 'SPLIT_CUSTOM':
            return 'Split (Arbitraje)';
        default:
            return resolution;
    }
};

/**
 * Get resolution icon (material icon name)
 */
export const getResolutionIcon = (resolution?: DisputeResolutionType): string => {
    if (!resolution) return 'help';

    switch (resolution) {
        case 'REFUND_CLIENT':
            return 'undo';
        case 'RELEASE_VENDOR':
            return 'payments';
        case 'SPLIT_CUSTOM':
            return 'call_split';
        default:
            return 'help';
    }
};

/**
 * Get resolution color classes
 */
export const getResolutionColor = (resolution?: DisputeResolutionType): string => {
    if (!resolution) return 'bg-gray-100 text-gray-700';

    switch (resolution) {
        case 'REFUND_CLIENT':
            return 'bg-red-100 text-red-700';
        case 'RELEASE_VENDOR':
            return 'bg-green-100 text-green-700';
        case 'SPLIT_CUSTOM':
            return 'bg-blue-100 text-blue-700';
        default:
            return 'bg-gray-100 text-gray-700';
    }
};

/**
 * Calculate resolution time in days
 */
export const calculateResolutionTime = (created: Date | string, resolved: Date | string): number => {
    const createdDate = typeof created === 'string' ? new Date(created) : created;
    const resolvedDate = typeof resolved === 'string' ? new Date(resolved) : resolved;

    const diffMs = resolvedDate.getTime() - createdDate.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
};

/**
 * Validate split amounts equal total
 */
export const validateSplitAmounts = (client: number, vendor: number, total: number): boolean => {
    return Math.abs((client + vendor) - total) < 0.01; // Allow for floating point rounding
};

/**
 * Format file size from bytes to human-readable
 */
export const formatEvidenceSize = (bytes: bigint | number): string => {
    const numBytes = typeof bytes === 'bigint' ? Number(bytes) : bytes;

    if (numBytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(numBytes) / Math.log(k));

    return `${parseFloat((numBytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Format date as relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'Hace unos segundos';
    if (diffMin < 60) return `Hace ${diffMin} minuto${diffMin !== 1 ? 's' : ''}`;
    if (diffHour < 24) return `Hace ${diffHour} hora${diffHour !== 1 ? 's' : ''}`;
    if (diffDay < 7) return `Hace ${diffDay} día${diffDay !== 1 ? 's' : ''}`;

    return dateObj.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

/**
 * Format full date with time
 */
export const formatFullDateTime = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    return dateObj.toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

/**
 * Get file icon based on mime type
 */
export const getFileIcon = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'videocam';
    if (mimeType.startsWith('audio/')) return 'audiotrack';
    if (mimeType.includes('pdf')) return 'picture_as_pdf';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'description';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'table_chart';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'slideshow';
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('compressed')) return 'folder_zip';
    if (mimeType.includes('text/')) return 'article';

    return 'insert_drive_file';
};
