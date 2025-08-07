// Secure token management utilities
export const authUtils = {
  // Store tokens securely using httpOnly cookies (server-side) or sessionStorage (client-side)
  setTokens: (accessToken: string, refreshToken: string) => {
    // For client-side, use sessionStorage (cleared when browser closes)
    // In production, these should be set as httpOnly cookies by the server
    sessionStorage.setItem('accessToken', accessToken);
    sessionStorage.setItem('refreshToken', refreshToken);
  },

  // Get access token
  getAccessToken: (): string | null => {
    return sessionStorage.getItem('accessToken');
  },

  // Get refresh token
  getRefreshToken: (): string | null => {
    return sessionStorage.getItem('refreshToken');
  },

  // Clear all tokens
  clearTokens: () => {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    localStorage.removeItem('user'); // Keep user data in localStorage for UI
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const accessToken = sessionStorage.getItem('accessToken');
    if (!accessToken) return false;

    try {
      // Check if token is expired
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (error) {
      return false;
    }
  },

  // Logout user
  logout: () => {
    authUtils.clearTokens();
    window.location.href = '/login';
  },

  // Store user data (non-sensitive)
  setUser: (user: any) => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Get user data
  getUser: (): any => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Clear user data
  clearUser: () => {
    localStorage.removeItem('user');
  }
};

// CSRF token management
export const csrfUtils = {
  // Generate CSRF token
  generateCSRFToken: (): string => {
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessionStorage.setItem('csrfToken', token);
    return token;
  },

  // Get CSRF token
  getCSRFToken: (): string | null => {
    return sessionStorage.getItem('csrfToken');
  },

  // Validate CSRF token
  validateCSRFToken: (token: string): boolean => {
    const storedToken = sessionStorage.getItem('csrfToken');
    return storedToken === token;
  },

  // Clear CSRF token
  clearCSRFToken: () => {
    sessionStorage.removeItem('csrfToken');
  }
};
