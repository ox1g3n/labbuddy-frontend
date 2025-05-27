import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';

/**
 * A custom hook for handling authentication state
 * @param {Object} options - Options for the hook
 * @param {boolean} options.redirect - Whether to redirect to dashboard if logged in
 * @param {boolean} options.requireAuth - Whether to redirect to login if not logged in
 * @returns {Object} Authentication state and functions
 */
export const useAuth = (options = {}) => {
  const { redirect = false, requireAuth = false } = options;
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);

        if (requireAuth) {
          navigate('/');
        }
        return;
      }

      try {
        const response = await api.get('api/auth/verify');
        setIsAuthenticated(true);
        setUser(
          response.data.user || {
            _id: localStorage.getItem('userId'),
            name: localStorage.getItem('userName'),
          }
        );

        if (redirect) {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Authentication verification failed:', error);
        setIsAuthenticated(false);
        setUser(null);

        if (requireAuth) {
          navigate('/');
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate, redirect, requireAuth]);

  const login = async (email, password) => {
    try {
      const response = await api.post('api/auth/login', { email, password });

      if (response?.data?.token && response?.data?.user?._id) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userId', response.data.user._id);
        localStorage.setItem('userName', response.data.user.name);
        localStorage.setItem('tokenTimestamp', Date.now().toString());

        setIsAuthenticated(true);
        setUser(response.data.user);

        return { success: true };
      }

      return {
        success: false,
        error: response?.data?.message || 'Login failed: Invalid response.',
      };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message || 'Login failed. Please try again.',
      };
    }
  };

  const logout = async () => {
    try {
      await api.post('api/auth/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('tokenTimestamp');

      setIsAuthenticated(false);
      setUser(null);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message || 'Logout failed. Please try again.',
      };
    }
  };

  return {
    isLoading,
    isAuthenticated,
    user,
    login,
    logout,
  };
};

export default useAuth;
