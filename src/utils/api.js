import axios from 'axios';
import { logoutAllTabs } from './storageSync';

const BASE_URL = import.meta.env.VITE_BASE_URL;

/**
 * Create an axios instance with common configuration
 */
export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

/**
 * Add a request interceptor to add the token to all requests
 */
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

/**
 * Add a response interceptor to handle auth errors
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle authentication errors (401, 403)
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      // Clear user data from localStorage across all tabs
      logoutAllTabs();

      // Redirect to login page if not already there
      if (
        window.location.pathname !== '/' &&
        window.location.pathname !== '/signup'
      ) {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
