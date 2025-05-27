import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import api from '../utils/api';

const ProtectedRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const verifyToken = async () => {
      // If there's no token in localStorage, don't bother checking
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        // Use our API utility with interceptors
        await api.get('api/auth/verify');
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Authentication error:', error);
        // Token handling is done in the API interceptor
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  if (isLoading) {
    // You could render a loading spinner here
    return (
      <div className='flex items-center justify-center min-h-screen bg-gray-900'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to='/' />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
