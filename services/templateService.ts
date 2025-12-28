import api from './api';

export interface RequirementTemplate {
    id: string;
    name: string;
    description?: string;
    structure: any; // JSON
    isDefault: boolean;
}

export const templateService = {
    // Vendor Role
    createTemplate: async (data: { name: string; description?: string; structure: any; isDefault?: boolean; status?: string }) => {
        const response = await api.post('/templates', data);
        return response.data;
    },

    updateTemplate: async (id: string, data: { name: string; description?: string; structure: any; isDefault?: boolean; status?: string }) => {
        const response = await api.put(`/templates/${id}`, data);
        return response.data;
    },

    deleteTemplate: async (id: string) => {
        await api.delete(`/templates/${id}`);
    },

    getMyTemplates: async (): Promise<RequirementTemplate[]> => {
        const response = await api.get('/templates');
        return response.data;
    }
};
