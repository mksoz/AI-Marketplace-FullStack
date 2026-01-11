import axios from 'axios';

// Create Axios Config
const api = axios.create({
    baseURL: 'http://localhost:8000/api', // No trailing slash
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
        console.log('[API] Making request to:', config.url);
        console.log('[API] Token from localStorage:', token ? 'EXISTS (' + token.substring(0, 20) + '...)' : 'MISSING');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('[API] Authorization header set');
        } else {
            console.warn('[API] No token or headers - request will fail auth');
        }
        return config;
    },
    (error) => {
        console.error('[API] Request interceptor error:', error);
        return Promise.reject(error);
    }
);

export default api;
