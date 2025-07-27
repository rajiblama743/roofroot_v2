import Constants from 'expo-constants';

// Get API URL from Expo constants or fallback to localhost
export const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3001';

export const API_ENDPOINTS = {
  health: `${API_BASE_URL}/`,
  // Add more endpoints as needed
  // properties: `${API_BASE_URL}/api/properties`,
  // users: `${API_BASE_URL}/api/users`,
};

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
}; 