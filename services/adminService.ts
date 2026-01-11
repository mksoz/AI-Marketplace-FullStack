import api from './api';

// ==========================================
// DASHBOARD SERVICES
// ==========================================
export const adminDashboardService = {
    getStats: () => api.get('/admin/dashboard/stats'),
    getActivity: () => api.get('/admin/dashboard/activity'),
    getHealth: () => api.get('/admin/dashboard/health'),
    getModerationQueue: () => api.get('/admin/dashboard/moderation-queue'),
};

// ==========================================
// USERS MANAGEMENT SERVICES
// ==========================================
export const adminUsersService = {
    getUsers: (params?: { role?: string; status?: string; search?: string; page?: number; limit?: number }) =>
        api.get('/admin/users', { params }),

    getUser: (id: string) =>
        api.get(`/admin/users/${id}`),

    updateUser: (id: string, data: any) =>
        api.patch(`/admin/users/${id}`, data),

    suspendUser: (id: string, reason: string) =>
        api.post(`/admin/users/${id}/suspend`, { reason }),

    activateUser: (id: string) =>
        api.post(`/admin/users/${id}/activate`),

    deleteUser: (id: string) =>
        api.delete(`/admin/users/${id}`),

    createUser: (data: { email: string; password: string; role: string; companyName?: string }) =>
        api.post('/admin/users/create', data),
};

// ==========================================
// DISPUTES SERVICES
// ==========================================
export const adminDisputesService = {
    getDisputes: (params?: { status?: string; search?: string; page?: number; limit?: number }) =>
        api.get('/admin/disputes', { params }),

    getDispute: (id: string) =>
        api.get(`/admin/disputes/${id}`),

    analyzeWithAI: (id: string) =>
        api.post(`/admin/disputes/${id}/analyze`),

    resolveDispute: (id: string, data: {
        resolution: 'REFUND_CLIENT' | 'RELEASE_VENDOR' | 'SPLIT_CUSTOM';
        splitClient?: number;
        splitVendor?: number;
        notes?: string;
    }) => api.post(`/admin/disputes/${id}/resolve`, data),
};

// ==========================================
// METRICS & REPORTS SERVICES
// ==========================================
export const adminMetricsService = {
    getGeneralMetrics: (timeRange: string = '30d') =>
        api.get('/admin/metrics/general', { params: { timeRange } }),

    getTechTrends: () =>
        api.get('/admin/metrics/tech-trends'),

    getPricingHeatmap: () =>
        api.get('/admin/metrics/pricing-heatmap'),

    generateVendorReport: (data: { vendorId: string; config: any }) =>
        api.post('/admin/reports/vendor/generate', data),

    getVendorReport: (reportId: string) =>
        api.get(`/admin/reports/vendor/${reportId}`),

    getReportRevenue: () =>
        api.get('/admin/reports/revenue'),
};

// ==========================================
// PLATFORM CONFIGURATION SERVICES
// ==========================================
export const adminPlatformService = {
    getConfig: () =>
        api.get('/admin/platform/config'),

    updateConfig: (data: any) =>
        api.patch('/admin/platform/config', data),

    getSkills: () =>
        api.get('/admin/platform/skills'),

    addSkill: (data: { name: string; category?: string }) =>
        api.post('/admin/platform/skills', data),

    deleteSkill: (id: string) =>
        api.delete(`/admin/platform/skills/${id}`),

    updateAIConfig: (data: { aiModel?: string; aiTemperature?: number; aiSystemPrompt?: string }) =>
        api.patch('/admin/platform/ai-config', data),
};

// ==========================================
// SETTINGS & TEAM SERVICES
// ==========================================
export const adminSettingsService = {
    getTeam: () =>
        api.get('/admin/settings/team'),

    inviteTeamMember: (data: { email: string; displayName?: string; permissions: string[] }) =>
        api.post('/admin/settings/team/invite', data),

    updateTeamMember: (id: string, data: { permissions?: string[]; displayName?: string }) =>
        api.patch(`/admin/settings/team/${id}`, data),

    removeTeamMember: (id: string) =>
        api.delete(`/admin/settings/team/${id}`),

    getAuditLog: (params?: { page?: number; limit?: number; actionType?: string; targetType?: string }) =>
        api.get('/admin/settings/audit-log', { params }),

    setMaintenanceMode: (data: { enabled: boolean; message?: string }) =>
        api.post('/admin/settings/maintenance', data),

    purgeCache: () =>
        api.post('/admin/settings/cache-purge'),
};

// ==========================================
// PROJECTS & PROPOSALS SERVICES
// ==========================================
export const adminProjectsService = {
    getProjects: (params?: {
        status?: string;
        clientId?: string;
        vendorId?: string;
        search?: string;
        minBudget?: number;
        maxBudget?: number;
        startDate?: string;
        endDate?: string;
        page?: number;
        limit?: number;
    }) => api.get('/admin/projects', { params }),

    getProject: (id: string) =>
        api.get(`/admin/projects/${id}`),

    updateStatus: (id: string, data: { status: string; reason: string }) =>
        api.put(`/admin/projects/${id}/status`, data),

    assignVendor: (id: string, data: { vendorId: string; reason: string }) =>
        api.put(`/admin/projects/${id}/assign-vendor`, data),

    cancelProject: (id: string, data: { reason: string; refundPercentage?: number }) =>
        api.post(`/admin/projects/${id}/cancel`, data),

    deleteProject: (id: string, reason: string) =>
        api.delete(`/admin/projects/${id}`, { data: { reason } }),

    notifyParties: (id: string, data: { title: string; message: string; recipients: string }) =>
        api.post(`/admin/projects/${id}/notify`, data),
};

// ==========================================
// FINANCE SERVICES
// ==========================================
export const adminFinanceService = {
    getDashboard: () =>
        api.get('/admin/finance/dashboard'),

    getTransactions: (params?: {
        type?: string;
        status?: string;
        minAmount?: number;
        maxAmount?: number;
        startDate?: string;
        endDate?: string;
        userId?: string;
        projectId?: string;
        page?: number;
        limit?: number;
    }) => api.get('/admin/finance/transactions', { params }),

    getTransaction: (id: string) =>
        api.get(`/admin/finance/transactions/${id}`),

    completeTransaction: (id: string, reason: string) =>
        api.post(`/admin/finance/transactions/${id}/complete`, { reason }),

    refundTransaction: (id: string, data: { reason: string; amount?: number }) =>
        api.post(`/admin/finance/transactions/${id}/refund`, data),

    getPaymentRequests: (params?: { status?: string; overdue?: boolean; page?: number; limit?: number }) =>
        api.get('/admin/finance/payment-requests', { params }),

    approvePayment: (id: string, reason: string) =>
        api.put(`/admin/finance/payment-requests/${id}/approve`, { reason }),

    getAccounts: (params?: { type?: 'client' | 'vendor'; search?: string }) =>
        api.get('/admin/finance/accounts', { params }),

    adjustBalance: (id: string, data: { amount: number; reason: string; accountType: 'client' | 'vendor' }) =>
        api.put(`/admin/finance/accounts/${id}/balance`, data),

    freezeAccount: (id: string, data: { reason: string; accountType: 'client' | 'vendor' }) =>
        api.post(`/admin/finance/accounts/${id}/freeze`, data),
};

// Export all as default
export default {
    dashboard: adminDashboardService,
    users: adminUsersService,
    projects: adminProjectsService,
    finance: adminFinanceService,
    disputes: adminDisputesService,
    metrics: adminMetricsService,
    platform: adminPlatformService,
    settings: adminSettingsService,
};
