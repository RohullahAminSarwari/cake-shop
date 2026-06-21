import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import guestCartService from '../services/guestCartService';

export default function NavBar() {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
      if (isAuthenticated) {
        // For authenticated users, use the user's cart count from API
        setCartCount(user?.cart_count || 0);
      } else {
        // For guest users, get count from local storage
        const guestCart = guestCartService.getCart();
        setCartCount(guestCart.items?.length || 0);
      }
    };

    updateCartCount();
    
    // Listen for storage changes to update cart count in real-time
    const handleStorageChange = () => {
      updateCartCount();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cartUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleStorageChange);
    };
  }, [isAuthenticated, user]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="glass sticky top-0 z-50 backdrop-blur-xl bg-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="text-4xl transform group-hover:scale-110 transition-transform duration-300">🎂</div>
            <span className="text-2xl font-bold gradient-text">Sweet Dreams</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-purple-600 font-semibold transition-all duration-300 hover:scale-105">
              Home
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-purple-600 font-semibold transition-all duration-300 hover:scale-105">
              Products
            </Link>
            <Link to="/categories" className="text-gray-700 hover:text-purple-600 font-semibold transition-all duration-300 hover:scale-105">
              Categories
            </Link>
            {isAuthenticated ? (
              <>
                {/* Show cart only for customers, not for creators/admins */}
                {!isAdmin() && user?.role !== 'seller' && (
                  <Link to="/cart" className="text-gray-700 hover:text-purple-600 font-semibold transition-all duration-300 hover:scale-105 relative">
                    Cart
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center shadow-lg animate-pulse">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                )}
                
                {/* Show orders for customers */}
                {!isAdmin() && user?.role !== 'seller' && (
                  <Link to="/orders" className="text-gray-700 hover:text-purple-600 font-semibold transition-all duration-300 hover:scale-105">
                    My Orders
                  </Link>
                )}
                
                {/* Show notifications for creators, admins, and any authenticated user */}
                {(isAdmin() || user?.role === 'seller' || user?.role === 'creator' || isAuthenticated) && (
                  <Link to="/creator/notifications" className="text-purple-700 hover:text-purple-800 font-semibold transition-all duration-300 hover:scale-105">
                    Notifications
                  </Link>
                )}
                
                {/* Show creator links for sellers */}
                {user?.role === 'seller' && (
                  <>
                    <Link to="/dashboard" className="text-green-700 hover:text-green-800 font-semibold transition-all duration-300 hover:scale-105">
                      Dashboard
                    </Link>
                    <Link to="/my-products" className="text-green-700 hover:text-green-800 font-semibold transition-all duration-300 hover:scale-105">
                      My Products
                    </Link>
                    <Link to="/add-product" className="text-green-700 hover:text-green-800 font-semibold transition-all duration-300 hover:scale-105">
                      Add Product
                    </Link>
                    <Link to="/add-category" className="text-blue-700 hover:text-blue-800 font-semibold transition-all duration-300 hover:scale-105">
                      Add Category
                    </Link>
                  </>
                )}
                {isAdmin() && (
                  <>
                    <Link to="/admin/dashboard" className="text-purple-700 hover:text-purple-800 font-semibold transition-all duration-300 hover:scale-105">
                      Admin
                    </Link>
                    <Link to="/admin/product-approval" className="text-orange-700 hover:text-orange-800 font-semibold transition-all duration-300 hover:scale-105">
                      Approvals
                    </Link>
                  </>
                )}
                <div className="flex items-center space-x-4 ml-4 pl-4 border-l-2 border-purple-200">
                  <span className="text-gray-700 font-medium">Hi, {user?.name}</span>
                  <button
                    onClick={handleLogout}
                    className="btn-secondary text-sm px-4 py-2"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/cart" className="text-gray-700 hover:text-purple-600 font-semibold transition-all duration-300 hover:scale-105 relative">
                  Cart
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center shadow-lg animate-pulse">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link to="/login" className="btn-primary text-sm px-6 py-2">
                  Login
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-gray-700 hover:text-purple-600 transition-colors p-2"
          >
            <svg className="h-8 w-8" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
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
          <div className="md:hidden py-6 space-y-4 bg-white/95 backdrop-blur-xl rounded-2xl mt-4 shadow-xl fade-in">
            <Link to="/" className="block text-gray-700 hover:text-purple-600 font-semibold py-2 px-4 rounded-lg hover:bg-purple-50 transition-all">Home</Link>
            <Link to="/products" className="block text-gray-700 hover:text-purple-600 font-semibold py-2 px-4 rounded-lg hover:bg-purple-50 transition-all">Products</Link>
            <Link to="/categories" className="block text-gray-700 hover:text-purple-600 font-semibold py-2 px-4 rounded-lg hover:bg-purple-50 transition-all">Categories</Link>
            {isAuthenticated ? (
              <>
                {/* Show cart only for customers */}
                {!isAdmin() && user?.role !== 'seller' && (
                  <Link to="/cart" className="block text-gray-700 hover:text-purple-600 font-semibold py-2 px-4 rounded-lg hover:bg-purple-50 transition-all relative">
                    Cart
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center shadow-lg">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                )}
                
                {/* Show orders for customers */}
                {!isAdmin() && user?.role !== 'seller' && (
                  <Link to="/orders" className="block text-gray-700 hover:text-purple-600 font-semibold py-2 px-4 rounded-lg hover:bg-purple-50 transition-all">My Orders</Link>
                )}
                
                {/* Show notifications for creators, admins, and any authenticated user */}
                {(isAdmin() || user?.role === 'seller' || user?.role === 'creator' || isAuthenticated) && (
                  <Link to="/creator/notifications" className="block text-purple-700 hover:text-purple-800 font-semibold py-2 px-4 rounded-lg hover:bg-purple-50 transition-all">Notifications</Link>
                )}
                
                {/* Show creator links for sellers */}
                {user?.role === 'seller' && (
                  <>
                    <Link to="/dashboard" className="block text-green-700 hover:text-green-800 font-semibold py-2 px-4 rounded-lg hover:bg-green-50 transition-all">Dashboard</Link>
                    <Link to="/my-products" className="block text-green-700 hover:text-green-800 font-semibold py-2 px-4 rounded-lg hover:bg-green-50 transition-all">My Products</Link>
                    <Link to="/add-product" className="block text-green-700 hover:text-green-800 font-semibold py-2 px-4 rounded-lg hover:bg-green-50 transition-all">Add Product</Link>
                    <Link to="/add-category" className="block text-blue-700 hover:text-blue-800 font-semibold py-2 px-4 rounded-lg hover:bg-blue-50 transition-all">Add Category</Link>
                  </>
                )}
                {isAdmin() && (
                  <>
                    <Link to="/admin/dashboard" className="block text-purple-700 hover:text-purple-800 font-semibold py-2 px-4 rounded-lg hover:bg-purple-50 transition-all">Admin</Link>
                    <Link to="/admin/categories" className="block text-indigo-700 hover:text-indigo-800 font-semibold py-2 px-4 rounded-lg hover:bg-indigo-50 transition-all">Categories</Link>
                  </>
                )}
                <div className="pt-4 border-t border-gray-200 mt-4">
                  <p className="text-gray-700 mb-3 font-medium px-4">Hi, {user?.name}</p>
                  <button onClick={handleLogout} className="btn-secondary w-full mx-4">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/cart" className="block text-gray-700 hover:text-purple-600 font-semibold py-2 px-4 rounded-lg hover:bg-purple-50 transition-all relative">
                  Cart
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center shadow-lg">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link to="/login" className="btn-primary block mx-4 text-center">Login</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
