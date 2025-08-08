import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Create axios instance
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API functions
export const api = {
  // Auth
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  // Users
  getUsers: async (params?: any) => {
    const response = await apiClient.get('/users', { params });
    return response.data;
  },

  getUser: async (id: string) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  createUser: async (userData: any) => {
    const response = await apiClient.post('/users', userData);
    return response.data;
  },

  updateUser: async (id: string, userData: any) => {
    const response = await apiClient.put(`/users/${id}`, userData);
    return response.data;
  },

  updateUserStatus: async (id: string, statusData: { status: 'active' | 'pending' }) => {
    const response = await apiClient.patch(`/users/${id}/status`, statusData);
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },

  // Listings
  getListings: async (params?: any) => {
    const response = await apiClient.get('/listings', { params });
    return response.data;
  },

  getListing: async (id: string) => {
    const response = await apiClient.get(`/listings/${id}`);
    return response.data;
  },

  deleteListing: async (id: string) => {
    const response = await apiClient.delete(`/listings/${id}`);
    return response.data;
  },
};

export default api;
