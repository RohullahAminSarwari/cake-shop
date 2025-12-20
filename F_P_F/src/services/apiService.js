import api from '../config/api';

// Example API service functions
export const apiService = {
  // Example: Get all cakes
  getCakes: async () => {
    const response = await api.get('/cakes');
    return response.data;
  },

  // Example: Get single cake
  getCake: async (id) => {
    const response = await api.get(`/cakes/${id}`);
    return response.data;
  },

  // Example: Create cake
  createCake: async (cakeData) => {
    const response = await api.post('/cakes', cakeData);
    return response.data;
  },

  // Example: Update cake
  updateCake: async (id, cakeData) => {
    const response = await api.put(`/cakes/${id}`, cakeData);
    return response.data;
  },

  // Example: Delete cake
  deleteCake: async (id) => {
    const response = await api.delete(`/cakes/${id}`);
    return response.data;
  },

  // Authentication examples
  login: async (credentials) => {
    const response = await api.post('/login', credentials);
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/logout');
    localStorage.removeItem('auth_token');
    return response.data;
  },

  // Get authenticated user
  getCurrentUser: async () => {
    const response = await api.get('/user');
    return response.data;
  },
};

