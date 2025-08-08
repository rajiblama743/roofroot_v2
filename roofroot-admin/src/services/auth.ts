import api from './api';

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: 'admin';
  createdAt: string;
  updatedAt: string;
}

export const authService = {
  // Login function
  login: async (email: string, password: string) => {
    try {
      const response = await api.login(email, password);
      
      if (response.success && response.accessToken) {
        // Store token and user data
        localStorage.setItem('adminToken', response.accessToken);
        localStorage.setItem('adminUser', JSON.stringify(response.user));
        
        // Verify user is admin
        if (response.user.role !== 'admin') {
          throw new Error('Access denied. Admin role required.');
        }
        
        return response;
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Login failed');
    }
  },

  // Logout function
  logout: () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  // Get current user
  getCurrentUser: (): AdminUser | null => {
    if (typeof window === 'undefined') return null;
    
    const userStr = localStorage.getItem('adminUser');
    if (!userStr) return null;
    
    try {
      const user = JSON.parse(userStr);
      return user.role === 'admin' ? user : null;
    } catch {
      return null;
    }
  },

  // Check if user is authenticated and is admin
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    
    const token = localStorage.getItem('adminToken');
    const user = authService.getCurrentUser();
    
    return !!(token && user && user.role === 'admin');
  },

  // Get token
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('adminToken');
  },

  // Verify token and role with backend (simplified since no /auth/me endpoint)
  verifyAuth: async (): Promise<boolean> => {
    try {
      const token = authService.getToken();
      if (!token) return false;

      // For now, just check if we have a valid token and admin user locally
      // In a real app, you'd verify with the backend
      const user = authService.getCurrentUser();
      return !!(token && user && user.role === 'admin');
    } catch {
      authService.logout();
      return false;
    }
  },
};
