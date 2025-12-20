import { createContext, useContext, useState, useEffect } from 'react';
import api from '../config/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        const response = await api.get('/user');
        setUser(response.data);
        setIsAuthenticated(true);
      }
    } catch (error) {
      localStorage.removeItem('auth_token');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      // Get CSRF cookie first if using Sanctum
      await api.get('/sanctum/csrf-cookie', { baseURL: import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000' });
      
      const response = await api.post('/login', credentials);
      if (response.data.token) {
        localStorage.setItem('auth_token', response.data.token);
      }
      setUser(response.data.user || response.data);
      setIsAuthenticated(true);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/register', userData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const isAdmin = () => {
    return user?.role === 'admin' || user?.is_admin === true;
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    isAdmin,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

