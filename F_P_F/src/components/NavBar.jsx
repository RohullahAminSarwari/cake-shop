import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

export default function NavBar() {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-3xl">🎂</div>
            <span className="text-2xl font-bold text-pink-600">Sweet Dreams</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-pink-600 font-medium transition-colors">
              Home
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-pink-600 font-medium transition-colors">
              Products
            </Link>
            <Link to="/categories" className="text-gray-700 hover:text-pink-600 font-medium transition-colors">
              Categories
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/cart" className="text-gray-700 hover:text-pink-600 font-medium transition-colors relative">
                  Cart
                  {user?.cart_count > 0 && (
                    <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {user.cart_count}
                    </span>
                  )}
                </Link>
                <Link to="/orders" className="text-gray-700 hover:text-pink-600 font-medium transition-colors">
                  My Orders
                </Link>
                {isAdmin() && (
                  <Link to="/admin/dashboard" className="text-purple-700 hover:text-purple-800 font-medium transition-colors">
                    Admin
                  </Link>
                )}
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700">Hi, {user?.name}</span>
                  <button
                    onClick={handleLogout}
                    className="btn-secondary text-sm"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-pink-600 font-medium transition-colors">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-700 hover:text-pink-600"
          >
            <svg className="h-6 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Link to="/" className="block text-gray-700 hover:text-pink-600 font-medium">Home</Link>
            <Link to="/products" className="block text-gray-700 hover:text-pink-600 font-medium">Products</Link>
            <Link to="/categories" className="block text-gray-700 hover:text-pink-600 font-medium">Categories</Link>
            {isAuthenticated ? (
              <>
                <Link to="/cart" className="block text-gray-700 hover:text-pink-600 font-medium">Cart</Link>
                <Link to="/orders" className="block text-gray-700 hover:text-pink-600 font-medium">My Orders</Link>
                {isAdmin() && (
                  <Link to="/admin/dashboard" className="block text-purple-700 hover:text-purple-800 font-medium">Admin</Link>
                )}
                <div className="pt-4 border-t">
                  <p className="text-gray-700 mb-2">Hi, {user?.name}</p>
                  <button onClick={handleLogout} className="btn-secondary w-full">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="block text-gray-700 hover:text-pink-600 font-medium">Login</Link>
                <Link to="/register" className="block btn-primary text-center">Sign Up</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
