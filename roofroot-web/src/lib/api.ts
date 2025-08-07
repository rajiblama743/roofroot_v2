import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Network connectivity check
export const checkNetworkConnectivity = async (): Promise<boolean> => {
  try {
    // Try to fetch a small resource to check connectivity
    await fetch(`${API_BASE_URL}/health`, { 
      method: 'HEAD',
      cache: 'no-cache',
      signal: AbortSignal.timeout(3000) // 3 second timeout
    });
    return true;
  } catch (error) {
    console.warn('Network connectivity check failed:', error);
    return false;
  }
};

// Auth utilities for secure token management
const authUtils = {
  // Store tokens in sessionStorage (more secure than localStorage)
  setTokens: (accessToken: string, refreshToken: string, csrfToken: string) => {
    sessionStorage.setItem('accessToken', accessToken);
    sessionStorage.setItem('refreshToken', refreshToken);
    sessionStorage.setItem('csrfToken', csrfToken);
  },
  
  getAccessToken: () => sessionStorage.getItem('accessToken'),
  getRefreshToken: () => sessionStorage.getItem('refreshToken'),
  getCSRFToken: () => sessionStorage.getItem('csrfToken'),
  
  clearTokens: () => {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('csrfToken');
    sessionStorage.removeItem('user');
  },
  
  setUser: (user: any) => {
    sessionStorage.setItem('user', JSON.stringify(user));
  },
  
  getUser: () => {
    const user = sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

// Token refresh logic
const refreshToken = async (): Promise<string | null> => {
  try {
    const refreshToken = authUtils.getRefreshToken();
    if (!refreshToken) return null;

    // Call the refresh endpoint with the refresh token
    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refreshToken
    }, {
      timeout: 5000
    });

    if (response.data.accessToken) {
      authUtils.setTokens(
        response.data.accessToken,
        response.data.refreshToken,
        response.data.csrfToken
      );
      return response.data.accessToken;
    }
    return null;
  } catch (error) {
    console.warn('Token refresh failed:', error);
    return null;
  }
};

// Retry logic with exponential backoff
const retryRequest = async (
  requestFn: () => Promise<any>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<any> => {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on client errors (4xx) except 429 (rate limit)
      if (error.response?.status >= 400 && error.response?.status < 500 && error.response?.status !== 429) {
        throw error;
      }
      
      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`Request failed, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

// Request interceptor to add auth token and handle token refresh
api.interceptors.request.use(
  async (config) => {
    // Check network connectivity first
    const isOnline = await checkNetworkConnectivity();
    if (!isOnline) {
      throw new Error('No internet connection. Please check your network and try again.');
    }

    let token = authUtils.getAccessToken();
    
    // Try to refresh token if it's about to expire (within 5 minutes)
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = payload.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();
        const timeUntilExpiry = expirationTime - currentTime;
        
        // If token expires within 5 minutes, try to refresh
        if (timeUntilExpiry < 300000) { // 5 minutes in milliseconds
          const refreshedToken = await refreshToken();
          if (refreshedToken) {
            token = refreshedToken;
          }
        }
      } catch (error) {
        console.warn('Error parsing token:', error);
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add CSRF token if available
    const csrfToken = authUtils.getCSRFToken();
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors and implement retry logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        const newToken = await refreshToken();
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } else {
          // Token refresh failed, logout user
          authUtils.clearTokens();
          window.location.href = '/login';
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // Token refresh failed, logout user
        authUtils.clearTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    
    // Handle 429 errors (rate limit) with retry
    if (error.response?.status === 429 && !originalRequest._retry) {
      originalRequest._retry = true;
      const delay = parseInt(error.response.headers['retry-after']) * 1000 || 5000;
      await new Promise(resolve => setTimeout(resolve, delay));
      return api(originalRequest);
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
  SEARCH_AGENCIES: '/users/search/agencies',
  
  // Listings
  GET_LISTINGS: '/listings',
  GET_LISTING: '/listings/:id',
  CREATE_LISTING: '/listings',
  UPDATE_LISTING: '/listings/:id',
  DELETE_LISTING: '/listings/:id',
  GET_MY_LISTINGS: '/listings/my/listings',
  GET_LISTINGS_BY_AGENCY: '/listings/by-agency/:agencyName',
} as const;

// API Client Functions with retry logic
export const apiClient = {
  // Auth
  register: async (data: RegisterData) => {
    return retryRequest(async () => {
      const response = await api.post(API_ENDPOINTS.REGISTER, data);
      // Store tokens and user data on successful registration
      if (response.data.success && response.data.accessToken) {
        authUtils.setTokens(
          response.data.accessToken,
          response.data.refreshToken,
          response.data.csrfToken
        );
        authUtils.setUser(response.data.user);
      }
      return response.data;
    });
  },
  
  login: async (data: LoginData) => {
    return retryRequest(async () => {
      const response = await api.post(API_ENDPOINTS.LOGIN, data);
      // Store tokens and user data on successful login
      if (response.data.success && response.data.accessToken) {
        authUtils.setTokens(
          response.data.accessToken,
          response.data.refreshToken,
          response.data.csrfToken
        );
        authUtils.setUser(response.data.user);
      }
      return response.data;
    });
  },
  
  // Users
  getUsers: async () => {
    return retryRequest(async () => {
      const response = await api.get(API_ENDPOINTS.GET_USERS);
      return response.data;
    });
  },
  
  getUser: async (id: string) => {
    return retryRequest(async () => {
      const response = await api.get(API_ENDPOINTS.GET_USER.replace(':id', id));
      return response.data;
    });
  },
  
  updateUser: async (id: string, data: any) => {
    return retryRequest(async () => {
      const response = await api.put(API_ENDPOINTS.UPDATE_USER.replace(':id', id), data);
      return response.data;
    });
  },
  
  deleteUser: async (id: string) => {
    return retryRequest(async () => {
      const response = await api.delete(API_ENDPOINTS.DELETE_USER.replace(':id', id));
      return response.data;
    });
  },
  
  // Agency Search
  searchAgencies: async (params?: AgencySearchFilters) => {
    return retryRequest(async () => {
      const response = await api.get(API_ENDPOINTS.SEARCH_AGENCIES, { params });
      return response.data;
    });
  },
  
  // Listings
  getListings: async (params?: ListingFilters) => {
    return retryRequest(async () => {
      const response = await api.get(API_ENDPOINTS.GET_LISTINGS, { params });
      return response.data;
    });
  },
  
  getListing: async (id: string) => {
    return retryRequest(async () => {
      const response = await api.get(API_ENDPOINTS.GET_LISTING.replace(':id', id));
      return response.data;
    });
  },
  
  createListing: async (data: CreateListingData) => {
    return retryRequest(async () => {
      const response = await api.post(API_ENDPOINTS.CREATE_LISTING, data);
      return response.data;
    });
  },
  
  updateListing: async (id: string, data: UpdateListingData) => {
    return retryRequest(async () => {
      const response = await api.put(API_ENDPOINTS.UPDATE_LISTING.replace(':id', id), data);
      return response.data;
    });
  },
  
  deleteListing: async (id: string) => {
    return retryRequest(async () => {
      const response = await api.delete(API_ENDPOINTS.DELETE_LISTING.replace(':id', id));
      return response.data;
    });
  },
  
  getMyListings: async () => {
    return retryRequest(async () => {
      const response = await api.get(API_ENDPOINTS.GET_MY_LISTINGS);
      return response.data;
    });
  },
  
  getListingsByAgency: async (agencyName: string, params?: ListingFilters) => {
    return retryRequest(async () => {
      const response = await api.get(
        API_ENDPOINTS.GET_LISTINGS_BY_AGENCY.replace(':agencyName', encodeURIComponent(agencyName)),
        { params }
      );
      return response.data;
    });
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
  license?: string;
  address?: string;
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
    phoneNumber?: string;
    agencyDescription?: string;
    license?: string;
    address?: string;
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

export interface AgencySearchFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export interface Agency {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  agencyName?: string;
  agencyDescription?: string;
  license?: string;
  address?: string;
  role: 'agency';
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  token?: string;
  user?: any;
  listings?: Listing[];
  agencies?: Agency[];
  users?: any[];
} 