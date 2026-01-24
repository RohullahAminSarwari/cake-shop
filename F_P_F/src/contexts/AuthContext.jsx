import { createContext, useContext, useState, useEffect } from 'react';
import api from '../config/api';
import guestCartService from '../services/guestCartService';

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
      const storedUser = localStorage.getItem('user');
      
      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
        } catch (parseError) {
          // If JSON parse fails, clear storage
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await api.post('/login', credentials);
      if (response.data.token && response.data.user) {
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        setIsAuthenticated(true);
        
        // Merge guest cart with user cart (don't block login if this fails)
        try {
          await mergeGuestCart();
        } catch (cartError) {
          console.error('Guest cart merge failed, but login succeeded:', cartError);
        }
        
        return { success: true, data: response.data };
      } else {
        return { 
          success: false, 
          error: 'Invalid response from server' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const mergeGuestCart = async () => {
    try {
      const guestCart = guestCartService.getCart();
      if (guestCart.items && guestCart.items.length > 0) {
        // Add each guest cart item to user's cart via API
        for (const item of guestCart.items) {
          await api.post('/cart/add', { 
            product_id: item.product_id, 
            quantity: item.quantity 
          });
        }
        // Clear guest cart after merging
        guestCartService.clearCart();
      }
    } catch (error) {
      console.error('Error merging guest cart:', error);
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/register', userData);
      if (response.data.token && response.data.user) {
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        setIsAuthenticated(true);
        
        // Merge guest cart with user cart (don't block registration if this fails)
        try {
          await mergeGuestCart();
        } catch (cartError) {
          console.error('Guest cart merge failed, but registration succeeded:', cartError);
        }
        
        return { success: true, data: response.data };
      } else {
        return { 
          success: false, 
          error: 'Invalid response from server' 
        };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || (error.response?.data?.errors ? JSON.stringify(error.response.data.errors) : null)
        || 'Registration failed';
      return { 
        success: false, 
        error: errorMessage
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
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const isAdmin = () => {
    return user?.role === 'admin';
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
