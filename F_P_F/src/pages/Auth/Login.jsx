import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AuthService from '../../services/authService';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeLeft, setLockTimeLeft] = useState(0);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect path from location state or default to home
  const from = location.state?.from?.pathname || '/';

  // Check if user is locked out
  useEffect(() => {
    const lockUntil = localStorage.getItem('loginLockUntil');
    if (lockUntil) {
      const lockTime = new Date(lockUntil);
      if (lockTime > new Date()) {
        setIsLocked(true);
        const interval = setInterval(() => {
          const now = new Date();
          if (lockTime <= now) {
            setIsLocked(false);
            setLockTimeLeft(0);
            localStorage.removeItem('loginLockUntil');
            clearInterval(interval);
          } else {
            setLockTimeLeft(Math.floor((lockTime - now) / 1000));
          }
        }, 1000);
      } else {
        localStorage.removeItem('loginLockUntil');
        setAttempts(0);
      }
    }
  }, []);

  // Auto-fill email if stored
  useEffect(() => {
    const storedEmail = localStorage.getItem('rememberedEmail');
    if (storedEmail) {
      setEmail(storedEmail);
      setRemember(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Check if locked out
    if (isLocked) {
      setError('Account temporarily locked. Please try again later.');
      setLoading(false);
      return;
    }

    // Validate form
    if (!AuthService.validateEmail(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (password.length < 1) {
      setError('Please enter your password');
      setLoading(false);
      return;
    }

    const result = await login({ 
      email, 
      password, 
      remember 
    });
    
    if (result.success) {
      // Reset attempts on successful login
      setAttempts(0);
      localStorage.removeItem('loginAttempts');
      
      // Store email if remember is checked
      if (remember) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      navigate(from, { replace: true });
    } else {
      // Handle failed login
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      localStorage.setItem('loginAttempts', newAttempts.toString());
      
      // Lock account after 5 failed attempts
      if (newAttempts >= 5) {
        const lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        localStorage.setItem('loginLockUntil', lockUntil.toISOString());
        setIsLocked(true);
        setError('Account temporarily locked due to too many failed attempts. Please try again in 15 minutes.');
      } else {
        // Show specific error message
        let errorMessage = result.error || 'Login failed';
        
        if (result.error_code === 'INVALID_CREDENTIALS') {
          const remainingAttempts = 5 - newAttempts;
          errorMessage = `Invalid email or password. ${remainingAttempts} attempt${remainingAttempts > 1 ? 's' : ''} remaining.`;
        } else if (result.error_code === 'ACCOUNT_BANNED') {
          errorMessage = 'Your account has been banned. Please contact support.';
        } else if (result.errors) {
          // Show validation errors
          const firstError = Object.values(result.errors)[0];
          errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
        }
        
        setError(errorMessage);
      }
    }
    
    setLoading(false);
  };

  const handleForgotPassword = () => {
    // For now, just show an alert. In a real app, this would navigate to a forgot password page
    alert('Password reset functionality coming soon! Please contact support for password reset.');
  };

  const formatLockTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-pink-50 to-rose-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 fade-in">
        <div className="text-center">
          <div className="text-7xl mb-6 transform hover:scale-110 transition-transform duration-300">🎂</div>
          <h2 className="text-5xl font-bold gradient-text mb-3">Welcome Back</h2>
          <p className="text-gray-600 text-xl">Sign in to your account</p>
        </div>

        <div className="card p-10 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {isLocked && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 text-yellow-700 px-4 py-3 rounded-xl">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>Account locked. Try again in {formatLockTime(lockTimeLeft)}</span>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={isLocked}
                  className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLocked}
                  className="w-full px-4 py-3 pl-12 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLocked}
                >
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    )}
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  disabled={isLocked}
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-700 font-medium">
                  Remember me
                </label>
              </div>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-purple-600 hover:text-purple-700 font-semibold disabled:opacity-50 transition-colors"
                disabled={isLocked}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || isLocked}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl text-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-purple-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">New to our platform?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/register"
                className="btn-secondary w-full flex justify-center py-3 px-4 text-lg shadow-md hover:shadow-lg transition-all"
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p className="font-medium">Secure login with encrypted connection</p>
          <p className="mt-2">
            Having trouble?{' '}
            <button 
              onClick={handleForgotPassword}
              className="text-purple-600 hover:text-purple-700 font-semibold transition-colors"
            >
              Contact support
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

