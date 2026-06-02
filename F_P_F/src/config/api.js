import axios from 'axios';

// API base URL - change this to match your Laravel backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor - add auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally and token refresh
api.interceptors.response.use(
  (response) => {
    // Log response time for debugging
    const endTime = new Date();
    const duration = endTime - response.config.metadata.startTime;
    console.log(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Don't retry if we've already tried to refresh the token
      if (originalRequest._retry) {
        // Clear auth data and redirect to login
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        localStorage.removeItem('token_expiry');
        
        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
      
      // Try to refresh the token
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          originalRequest._retry = true;
          
          const response = await axios.post(`${API_BASE_URL}/refresh-token`, {}, {
            headers: {
              'Authorization': `Bearer ${refreshToken}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            }
          });
          
          if (response.data.success && response.data.data?.token) {
            const newToken = response.data.data.token;
            const newExpiry = response.data.data.expires_at;
            
            // Update stored tokens
            localStorage.setItem('auth_token', newToken);
            if (newExpiry) {
              localStorage.setItem('token_expiry', newExpiry);
            }
            
            // Update the authorization header for the original request
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            
            // Retry the original request
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
      
      // If refresh fails or no refresh token, clear auth and redirect
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      localStorage.removeItem('token_expiry');
      
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Handle network errors
    if (error.code === 'NETWORK_ERROR') {
      error.message = 'Network error. Please check your internet connection.';
    }
    
    // Handle timeout errors
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout. Please try again.';
    }
    
    // Handle server errors
    if (error.response?.status >= 500) {
      error.message = 'Server error. Please try again later.';
    }
    
    // Handle rate limiting
    if (error.response?.status === 429) {
      error.message = 'Too many requests. Please try again later.';
    }
    
    return Promise.reject(error);
  }
);

// Utility functions for common API operations
export const apiUtils = {
  // Handle API errors consistently
  handleError: (error) => {
    if (error.response?.data) {
      return {
        message: error.response.data.message || 'An error occurred',
        errors: error.response.data.errors || null,
        error_code: error.response.data.error_code || null,
        status: error.response.status
      };
    }
    
    return {
      message: error.message || 'Network error',
      errors: null,
      error_code: null,
      status: error.response?.status || null
    };
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('auth_token');
    const expiry = localStorage.getItem('token_expiry');
    
    if (!token) return false;
    
    if (expiry && new Date(expiry) < new Date()) {
      return false;
    }
    
    return true;
  },
  
  // Get auth headers
  getAuthHeaders: () => {
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
};

export default api;
