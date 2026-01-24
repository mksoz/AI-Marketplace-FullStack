import axios from 'axios';

// Create Axios Config
const api = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Clean up any double slashes in URLs
api.interceptors.request.use(
    (config) => {
        // Remove trailing slashes from URLs
        if (config.url) {
            config.url = config.url.replace(/\/+$/, '');
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Request Interceptor: Attach Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
