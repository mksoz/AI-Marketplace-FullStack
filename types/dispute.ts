// ==========================================
// DISPUTE TYPES
// ==========================================

export type DisputeStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'INVESTIGATING' | 'CANCELLED';
export type DisputeResolutionType = 'REFUND_CLIENT' | 'RELEASE_VENDOR' | 'SPLIT_CUSTOM';

export interface DisputeEvidence {
    id: string;
    disputeId: string;
    filename: string;
    originalName: string;
    fileSize: bigint | number;
    mimeType: string;
    storagePath: string;
    uploadedBy: string;
    description?: string;
    uploadedAt: Date | string;
}

export interface DisputeFull {
    id: string;
    projectId: string;
    project: {
        id: string;
        title: string;
        budget: number;
        client: {
            id: string;
            companyName: string;
            user: {
                id: string;
                email: string;
            };
        };
        vendor: {
            id: string;
            companyName: string;
            user: {
                id: string;
                email: string;
            };
        };
    };
    milestoneId: string;
    milestoneTitle: string;
    milestoneAmount: number;
    plaintiffId: string;
    defendantId: string;
    plaintiffUser?: {
        id: string;
        email: string;
        role: string;
    };
    defendantUser?: {
        id: string;
        email: string;
        role: string;
    };
    amount: number;
    escrowAmount: number;
    vendorComment: string;
    vendorSubmittedAt: Date | string;
    proposalData?: any;
    contractData?: any;
    reviewHistory?: any;
    deliverableFolders?: any;
    evidenceFiles?: DisputeEvidence[];
    status: DisputeStatus;
    resolution?: DisputeResolutionType;
    resolutionNotes?: string;
    splitClient?: number;
    splitVendor?: number;
    aiSentiment?: string;
    aiRecommendation?: string;
    aiConfidence?: number;
    resolvedBy?: string;
    resolvedAt?: Date | string;
    createdAt: Date | string;
    updatedAt: Date | string;
    milestone?: any;
}

export interface DisputeListItem {
    id: string;
    projectId: string;
    project: {
        id: string;
        title: string;
        budget: number;
        client: {
            id: string;
            companyName: string;
            user: {
                id: string;
                email: string;
            };
        };
        vendor: {
            id: string;
            companyName: string;
            user: {
                id: string;
                email: string;
            };
        };
    };
    milestoneId: string;
    milestoneTitle: string;
    milestoneAmount: number;
    plaintiffUser?: {
        id: string;
        email: string;
        role: string;
    };
    defendantUser?: {
        id: string;
        email: string;
        role: string;
    };
    amount: number;
    escrowAmount: number;
    vendorComment: string;
    status: DisputeStatus;
    resolution?: DisputeResolutionType;
    createdAt: Date | string;
    evidenceFiles?: Array<{
        id: string;
        filename: string;
        fileSize: bigint | number;
        mimeType: string;
    }>;
}

export interface DisputeFilters {
    status?: DisputeStatus | DisputeStatus[] | 'all';
    search?: string;
    dateFrom?: Date | string;
    dateTo?: Date | string;
    amountMin?: number;
    amountMax?: number;
    sortBy?: 'newest' | 'oldest' | 'highestAmount' | 'lowestAmount';
    page?: number;
    limit?: number;
}

export interface DisputeStats {
    totalActive: number;
    totalResolved: number;
    avgResolutionTime: number; // in days
    totalAmountDisputed: number;
    resolutionDistribution: {
        refund: number;
        release: number;
        split: number;
    };
}

export interface DisputesResponse {
    disputes: DisputeListItem[];
    total: number;
    page: number;
    totalPages: number;
}

export type ViewMode = 'card' | 'list' | 'kanban';
