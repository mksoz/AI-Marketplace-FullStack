import api from './api';

export const vendorService = {
    // Fetch all vendors (public)
    getAllVendors: async () => {
        const response = await api.get('/vendors');
        return response.data;
    },

    // Fetch single vendor by ID
    getVendorById: async (id: string) => {
        const response = await api.get(`/vendors/${id}`);
        return response.data;
    }
};
