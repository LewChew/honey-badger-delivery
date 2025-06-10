import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, TIMEOUTS, STORAGE_KEYS } from '../config/constants';

// Create axios instance
export const createApiClient = () => {
  const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: TIMEOUTS.request,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add auth token
  api.interceptors.request.use(
    async (config) => {
      try {
        const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error getting auth token:', error);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle errors
  api.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      // Handle 401 errors (unauthorized)
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Try to refresh token
          const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
          if (token) {
            const refreshResponse = await axios.post(
              `${API_BASE_URL}/auth/refresh`,
              {},
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            const newToken = refreshResponse.data.token;
            await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;

            return api(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, logout user
          await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
          
          // Navigate to login screen
          // This would be handled by the app's navigation logic
          console.error('Token refresh failed:', refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  return api;
};

export default createApiClient();