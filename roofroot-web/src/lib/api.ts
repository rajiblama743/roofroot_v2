import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  
  // Users
  GET_USERS: '/users',
  GET_USER: '/users/:id',
  UPDATE_USER: '/users/:id',
  DELETE_USER: '/users/:id',
  
  // Listings
  GET_LISTINGS: '/listings',
  GET_LISTING: '/listings/:id',
  CREATE_LISTING: '/listings',
  UPDATE_LISTING: '/listings/:id',
  DELETE_LISTING: '/listings/:id',
  GET_MY_LISTINGS: '/listings/my/listings',
} as const;

// API Client Functions
export const apiClient = {
  // Auth
  register: async (data: RegisterData) => {
    const response = await api.post(API_ENDPOINTS.REGISTER, data);
    return response.data;
  },
  
  login: async (data: LoginData) => {
    const response = await api.post(API_ENDPOINTS.LOGIN, data);
    return response.data;
  },
  
  // Users
  getUsers: async () => {
    const response = await api.get(API_ENDPOINTS.GET_USERS);
    return response.data;
  },
  
  getUser: async (id: string) => {
    const response = await api.get(API_ENDPOINTS.GET_USER.replace(':id', id));
    return response.data;
  },
  
  updateUser: async (id: string, data: any) => {
    const response = await api.put(API_ENDPOINTS.UPDATE_USER.replace(':id', id), data);
    return response.data;
  },
  
  deleteUser: async (id: string) => {
    const response = await api.delete(API_ENDPOINTS.DELETE_USER.replace(':id', id));
    return response.data;
  },
  
  // Listings
  getListings: async (params?: ListingFilters) => {
    const response = await api.get(API_ENDPOINTS.GET_LISTINGS, { params });
    return response.data;
  },
  
  getListing: async (id: string) => {
    const response = await api.get(API_ENDPOINTS.GET_LISTING.replace(':id', id));
    return response.data;
  },
  
  createListing: async (data: CreateListingData) => {
    const response = await api.post(API_ENDPOINTS.CREATE_LISTING, data);
    return response.data;
  },
  
  updateListing: async (id: string, data: UpdateListingData) => {
    const response = await api.put(API_ENDPOINTS.UPDATE_LISTING.replace(':id', id), data);
    return response.data;
  },
  
  deleteListing: async (id: string) => {
    const response = await api.delete(API_ENDPOINTS.DELETE_LISTING.replace(':id', id));
    return response.data;
  },
  
  getMyListings: async () => {
    const response = await api.get(API_ENDPOINTS.GET_MY_LISTINGS);
    return response.data;
  },
};

// Type Definitions
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  agencyName?: string;
  agencyDescription?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  type: 'sale' | 'lease';
  location: string;
  images?: string[];
  bedrooms?: number;
  bathrooms?: number;
  carBay?: number;
  area?: number;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
    agencyName?: string;
  };
  agency?: {
    _id: string;
    name: string;
    agencyName?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateListingData {
  title: string;
  description: string;
  price: number;
  type: 'sale' | 'lease';
  location: string;
  images?: string[];
  bedrooms?: number;
  bathrooms?: number;
  carBay?: number;
  area?: number;
}

export interface UpdateListingData extends Partial<CreateListingData> {}

export interface ListingFilters {
  search?: string;
  type?: 'sale' | 'lease';
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  page?: number;
  limit?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  token?: string;
  user?: any;
  listings?: Listing[];
  users?: any[];
} 