import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Create axios instance with interceptors
  const axiosInstance = axios.create();

  // Add request interceptor
  axiosInstance.interceptors.request.use(
    (config) => {
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add response interceptor
  axiosInstance.interceptors.response.use(
    (response) => {
      // Check if token is about to expire
      if (response.headers['x-token-expired']) {
        refreshToken();
      }
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      // If the error is due to token expiration and we haven't tried to refresh yet
      if (error.response?.status === 401 && 
          error.response?.data?.code === 'TOKEN_EXPIRED' && 
          !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Attempt to refresh the token
          const newToken = await refreshToken();
          
          // Update the authorization header
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          
          // Retry the original request
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // If refresh fails, logout the user
          logout();
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  const refreshToken = async () => {
    try {
      const response = await axios.post('http://localhost:8000/api/auth/refresh', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const newToken = response.data.token;
      setToken(newToken);
      localStorage.setItem('token', newToken);
      return newToken;
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout();
      throw error;
    }
  };

  const login = async (userData, authToken) => {
    try {
      console.log('Login called with token:', authToken); // Debug log

      // First update localStorage
      localStorage.setItem('token', authToken);
      console.log('Token stored in localStorage:', localStorage.getItem('token')); // Debug log

      // Then update state
      setToken(authToken);
      setUser(userData);
      setIsAuthenticated(true);

      console.log('Login state updated'); // Debug log
    } catch (error) {
      console.error('Error in login:', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const response = await axios.get('http://localhost:5000/api/auth/verify', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setUser(response.data.user);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Token verification failed:', error);
          logout();
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, [token]);

  useEffect(() => {
    // Update isAuthenticated whenever token changes
    setIsAuthenticated(!!token);
    
    // Log for debugging
    console.log('Token in AuthContext:', token);
    console.log('localStorage token:', localStorage.getItem('token'));
  }, [token]);

  const value = {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    loading,
    axiosInstance // Expose the axios instance with interceptors
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 