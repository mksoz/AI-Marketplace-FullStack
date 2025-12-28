import api from './api';
import { UserRole } from '../types'; // Check if types exists, otherwise need to define or import from backend types (shared?)

// Temporary Type Definition if not found globally
interface LoginResponse {
    message: string;
    token: string;
    user: {
        id: string;
        email: string;
        role: string;
    };
}

export const authService = {
    login: async (email: string, password: string): Promise<LoginResponse> => {
        const response = await api.post<LoginResponse>('/auth/login', { email, password });

        // Save to LocalStorage
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }

        return response.data;
    },

    register: async (email: string, password: string, role: string) => {
        const response = await api.post('/auth/register', { email, password, role });
        // Auto login on register? Or just return success.
        // Let's assume auto-login behavior if token is returned, otherwise user logs in.
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    }
};
