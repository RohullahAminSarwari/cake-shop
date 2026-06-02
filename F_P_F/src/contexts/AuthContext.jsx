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
  const [tokenExpiry, setTokenExpiry] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('user');
      const storedExpiry = localStorage.getItem('token_expiry');
      const loginTime = localStorage.getItem('login_time');
      
      if (token && storedUser) {
        // Check if token is expired
        if (storedExpiry && new Date(storedExpiry) < new Date()) {
          console.log('Token expired, logging out');
          await logout();
          return;
        }
        
        // Check if session is too old (more than 30 minutes)
        if (loginTime) {
          const loginDate = new Date(loginTime);
          const now = new Date();
          const sessionAge = (now - loginDate) / (1000 * 60); // in minutes
          
          if (sessionAge > 30) {
            console.log('Session too old, logging out');
            await logout();
            return;
          }
        }
        
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsAuthenticated(true);
          setTokenExpiry(storedExpiry);
          
          // Set up auto-logout timer
          if (storedExpiry) {
            const expiryTime = new Date(storedExpiry).getTime();
            const currentTime = new Date().getTime();
            const timeUntilExpiry = expiryTime - currentTime;
            
            if (timeUntilExpiry > 0) {
              setTimeout(() => {
                console.log('Token expired, auto-logging out');
                logout();
              }, timeUntilExpiry);
            }
          }
        } catch (parseError) {
          // If JSON parse fails, clear storage
          await logout();
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setTokenExpiry(null);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      await logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await api.post('/login', credentials);
      
      if (response.data.success && response.data.data) {
        const { user: userData, token, expires_at, expires_in_minutes } = response.data.data;
        const loginTime = new Date().toISOString();
        
        // Store authentication data
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token_expiry', expires_at);
        localStorage.setItem('login_time', loginTime);
        setTokenExpiry(expires_at);
        
        setUser(userData);
        setIsAuthenticated(true);
        
        // Set up auto-logout timer
        if (expires_at) {
          const expiryTime = new Date(expires_at).getTime();
          const currentTime = new Date().getTime();
          const timeUntilExpiry = expiryTime - currentTime;
          
          // Auto-logout 1 minute before expiry to give time for refresh
          if (timeUntilExpiry > 60000) {
            setTimeout(() => {
              console.log('Token about to expire, attempting refresh');
              refreshToken();
            }, timeUntilExpiry - 60000);
          }
          
          // Final auto-logout at expiry
          setTimeout(() => {
            console.log('Token expired, auto-logging out');
            logout();
          }, timeUntilExpiry);
        }
        
        // Set up session timeout (30 minutes max)
        setTimeout(() => {
          console.log('Session timeout, logging out');
          logout();
        }, 30 * 60 * 1000); // 30 minutes
        
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
          error: response.data.message || 'Invalid response from server',
          errors: response.data.errors || null
        };
      }
    } catch (error) {
      let errorMessage = 'Login failed';
      let errors = null;
      
      if (error.response?.data) {
        errorMessage = error.response.data.message || errorMessage;
        errors = error.response.data.errors || null;
      }
      
      return { 
        success: false, 
        error: errorMessage,
        errors: errors,
        error_code: error.response?.data?.error_code || null
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
      
      if (response.data.success && response.data.data) {
        const { user: userData, token, expires_at, expires_in_minutes } = response.data.data;
        const loginTime = new Date().toISOString();
        
        // Store authentication data
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token_expiry', expires_at);
        localStorage.setItem('login_time', loginTime);
        setTokenExpiry(expires_at);
        
        setUser(userData);
        setIsAuthenticated(true);
        
        // Set up auto-logout timer
        if (expires_at) {
          const expiryTime = new Date(expires_at).getTime();
          const currentTime = new Date().getTime();
          const timeUntilExpiry = expiryTime - currentTime;
          
          // Auto-logout 1 minute before expiry to give time for refresh
          if (timeUntilExpiry > 60000) {
            setTimeout(() => {
              console.log('Token about to expire, attempting refresh');
              refreshToken();
            }, timeUntilExpiry - 60000);
          }
          
          // Final auto-logout at expiry
          setTimeout(() => {
            console.log('Token expired, auto-logging out');
            logout();
          }, timeUntilExpiry);
        }
        
        // Set up session timeout (30 minutes max)
        setTimeout(() => {
          console.log('Session timeout, logging out');
          logout();
        }, 30 * 60 * 1000); // 30 minutes
        
        return { success: true, data: response.data };
      } else {
        return { 
          success: false, 
          error: response.data.message || 'Invalid response from server',
          errors: response.data.errors || null
        };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message 
        || (error.response?.data?.errors ? JSON.stringify(error.response.data.errors) : null)
        || 'Registration failed';
      
      return { 
        success: false, 
        error: errorMessage,
        errors: error.response?.data?.errors || null
      };
    }
  };

  const logout = async (logoutAll = false) => {
    try {
      if (logoutAll) {
        await api.post('/logout-all');
      } else {
        await api.post('/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      localStorage.removeItem('token_expiry');
      localStorage.removeItem('login_time');
      setUser(null);
      setIsAuthenticated(false);
      setTokenExpiry(null);
      
      // Clear any pending timers
      if (typeof window !== 'undefined') {
        // Clear all timeouts
        const highestTimeoutId = setTimeout(() => {});
        for (let i = 0; i < highestTimeoutId; i++) {
          clearTimeout(i);
        }
      }
    }
  };

  const logoutAll = async () => {
    return await logout(true);
  };

  const refreshToken = async () => {
    try {
      const response = await api.post('/refresh-token');
      
      if (response.data.success && response.data.data) {
        const { token, expires_at, expires_in_minutes } = response.data.data;
        const loginTime = new Date().toISOString();
        
        localStorage.setItem('auth_token', token);
        if (expires_at) {
          localStorage.setItem('token_expiry', expires_at);
          localStorage.setItem('login_time', loginTime);
          setTokenExpiry(expires_at);
        }
        
        // Set up new auto-logout timer
        if (expires_at) {
          const expiryTime = new Date(expires_at).getTime();
          const currentTime = new Date().getTime();
          const timeUntilExpiry = expiryTime - currentTime;
          
          // Auto-logout 1 minute before expiry to give time for refresh
          if (timeUntilExpiry > 60000) {
            setTimeout(() => {
              console.log('Token about to expire, attempting refresh');
              refreshToken();
            }, timeUntilExpiry - 60000);
          }
          
          // Final auto-logout at expiry
          setTimeout(() => {
            console.log('Token expired, auto-logging out');
            logout();
          }, timeUntilExpiry);
        }
        
        return { success: true };
      } else {
        return { success: false, error: 'Token refresh failed' };
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh fails, logout user
      await logout();
      return { success: false, error: 'Token refresh failed' };
    }
  };

  const getProfile = async () => {
    try {
      const response = await api.get('/profile');
      
      if (response.data.success && response.data.data) {
        const userData = response.data.data.user;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true, data: userData };
      } else {
        return { success: false, error: 'Failed to get profile' };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to get profile' 
      };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      const response = await api.post('/change-password', passwordData);
      
      if (response.data.success) {
        return { success: true, message: response.data.message };
      } else {
        return { 
          success: false, 
          error: response.data.message || 'Password change failed',
          errors: response.data.errors || null
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Password change failed',
        errors: error.response?.data?.errors || null
      };
    }
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const isSeller = () => {
    return user?.role === 'seller';
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const isTokenExpired = () => {
    if (!tokenExpiry) return false;
    return new Date(tokenExpiry) < new Date();
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    tokenExpiry,
    login,
    register,
    logout,
    logoutAll,
    refreshToken,
    getProfile,
    changePassword,
    isAdmin,
    isSeller,
    hasRole,
    isTokenExpired,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
