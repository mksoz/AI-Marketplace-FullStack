import api from './api';

export interface Project {
    id: string;
    title: string;
    description: string;
    budget: number;
    status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    createdAt: string;
    _count?: {
        proposals: number;
    };
}

export const projectService = {
    createProject: async (data: { title: string; description: string; budget: number }) => {
        const response = await api.post<Project>('/projects', data);
        return response.data;
    },

    getMyProjects: async () => {
        const response = await api.get<Project[]>('/projects/my-projects');
        return response.data;
    }
};
