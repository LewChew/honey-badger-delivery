import { API_BASE_URL, TIMEOUTS } from '../config/constants';
import { createApiClient } from './apiClient';

const api = createApiClient();

export const authService = {
  // Login user
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  // Register new user
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  // Verify JWT token
  async verifyToken(token) {
    try {
      const response = await api.get('/auth/verify', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Token verification failed');
    }
  },

  // Refresh JWT token
  async refreshToken(token) {
    try {
      const response = await api.post('/auth/refresh', {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Token refresh failed');
    }
  },

  // Logout (client-side only, token invalidation happens locally)
  async logout() {
    // Clear any client-side data
    // Token will be removed from storage by the auth slice
    return { success: true };
  },
};

export default authService;