import api from '../config/api';
import { apiUtils } from '../config/api';

class AuthService {
  // Login user
  static async login(credentials) {
    try {
      const response = await api.post('/login', credentials);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        return {
          success: false,
          error: response.data.message,
          errors: response.data.errors
        };
      }
    } catch (error) {
      const errorInfo = apiUtils.handleError(error);
      return {
        success: false,
        error: errorInfo.message,
        errors: errorInfo.errors,
        error_code: errorInfo.error_code
      };
    }
  }

  // Register new user
  static async register(userData) {
    try {
      const response = await api.post('/register', userData);
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message
        };
      } else {
        return {
          success: false,
          error: response.data.message,
          errors: response.data.errors
        };
      }
    } catch (error) {
      const errorInfo = apiUtils.handleError(error);
      return {
        success: false,
        error: errorInfo.message,
        errors: errorInfo.errors
      };
    }
  }

  // Logout user
  static async logout() {
    try {
      await api.post('/logout');
      return { success: true };
    } catch (error) {
      // Even if API call fails, we should clear local storage
      return { success: true };
    }
  }

  // Logout from all devices
  static async logoutAll() {
    try {
      await api.post('/logout-all');
      return { success: true };
    } catch (error) {
      // Even if API call fails, we should clear local storage
      return { success: true };
    }
  }

  // Get user profile
  static async getProfile() {
    try {
      const response = await api.get('/profile');
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data.user
        };
      } else {
        return {
          success: false,
          error: response.data.message
        };
      }
    } catch (error) {
      const errorInfo = apiUtils.handleError(error);
      return {
        success: false,
        error: errorInfo.message
      };
    }
  }

  // Change password
  static async changePassword(passwordData) {
    try {
      const response = await api.post('/change-password', passwordData);
      
      if (response.data.success) {
        return {
          success: true,
          message: response.data.message
        };
      } else {
        return {
          success: false,
          error: response.data.message,
          errors: response.data.errors
        };
      }
    } catch (error) {
      const errorInfo = apiUtils.handleError(error);
      return {
        success: false,
        error: errorInfo.message,
        errors: errorInfo.errors
      };
    }
  }

  // Refresh token
  static async refreshToken() {
    try {
      const response = await api.post('/refresh-token');
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data
        };
      } else {
        return {
          success: false,
          error: response.data.message
        };
      }
    } catch (error) {
      const errorInfo = apiUtils.handleError(error);
      return {
        success: false,
        error: errorInfo.message
      };
    }
  }

  // Check if user is authenticated
  static isAuthenticated() {
    return apiUtils.isAuthenticated();
  }

  // Get stored user data
  static getUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  // Get token
  static getToken() {
    return localStorage.getItem('auth_token');
  }

  // Get token expiry
  static getTokenExpiry() {
    const expiry = localStorage.getItem('token_expiry');
    return expiry ? new Date(expiry) : null;
  }

  // Check if token is expired
  static isTokenExpired() {
    const expiry = this.getTokenExpiry();
    if (!expiry) return false;
    return new Date() > expiry;
  }

  // Store auth data
  static storeAuthData(token, user, expiry) {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    if (expiry) {
      localStorage.setItem('token_expiry', expiry);
    }
  }

  // Clear auth data
  static clearAuthData() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('token_expiry');
  }

  // Validate email format
  static validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // Validate password strength
  static validatePassword(password) {
    const errors = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  }

  // Check user role
  static hasRole(role) {
    const user = this.getUser();
    return user?.role === role;
  }

  static isAdmin() {
    return this.hasRole('admin');
  }

  static isSeller() {
    return this.hasRole('seller');
  }

  // Format user display name
  static getDisplayName(user) {
    if (!user) return 'Guest';
    return user.name || user.email || 'User';
  }

  // Get user initials for avatar
  static getUserInitials(user) {
    if (!user || !user.name) return 'U';
    
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
    }
    
    return user.name.substring(0, 2).toUpperCase();
  }
}

export default AuthService;
