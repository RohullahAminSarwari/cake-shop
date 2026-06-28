import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';
import guestCartService from '../services/guestCartService';

const NAV_LINKS = [
  { to: '/', label: 'Marketplace' },
  { to: '/categories', label: 'Collections' },
  { to: '/products', label: 'Seasonal' },
];

export default function NavBar() {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const update = () => {
      if (isAuthenticated) setCartCount(user?.cart_count || 0);
      else setCartCount(guestCartService.getCart().items?.length || 0);
    };
    update();
    window.addEventListener('storage', update);
    window.addEventListener('cartUpdated', update);
    return () => { window.removeEventListener('storage', update); window.removeEventListener('cartUpdated', update); };
  }, [isAuthenticated, user]);

  useEffect(() => {
    const h = (e) => { if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  useEffect(() => { setMobileOpen(false); setProfileOpen(false); }, [location.pathname]);

  const handleLogout = async () => { await logout(); navigate('/'); };
  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled
        ? 'bg-cream-100/95 backdrop-blur-md shadow-sm border-b border-cream-300/50'
        : 'bg-cream-100 border-b border-cream-200/60'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="shrink-0">
            <span className="text-xl font-display text-terra-800 italic">The Modern Patisserie</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <Link key={to} to={to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(to)
                    ? 'text-terra-800 border-b-2 border-terra-700'
                    : 'text-bark-600 hover:text-bark-900'
                }`}
              >{label}</Link>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <Link to="/cart" className="relative p-2 rounded-xl text-bark-700 hover:text-bark-900 hover:bg-cream-200 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-terra-700 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{cartCount}</span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <button onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-cream-200 transition-colors">
                  <div className="w-8 h-8 bg-terra-100 text-terra-800 rounded-full flex items-center justify-center text-sm font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-bark-800 max-w-[100px] truncate">{user?.name}</span>
                  <svg className={`w-4 h-4 text-bark-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-lg border border-cream-300 py-2 animate-scale-in origin-top-right z-50">
                    <div className="px-4 py-3 border-b border-cream-200">
                      <p className="text-sm font-semibold text-bark-900">{user?.name}</p>
                      <p className="text-xs text-bark-500 mt-0.5">{user?.email}</p>
                      <span className="inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider text-terra-800 bg-terra-50 px-2 py-0.5 rounded-md">{user?.role}</span>
                    </div>
                    <div className="py-1">
                      {user?.role === 'seller' && (
                        <>
                          <DropLink to="/dashboard">Dashboard</DropLink>
                          <DropLink to="/my-products">My Products</DropLink>
                          <DropLink to="/add-product">Add Product</DropLink>
                          <DropLink to="/add-category">Add Category</DropLink>
                          <div className="my-1 border-t border-cream-200" />
                        </>
                      )}
                      {isAdmin() && (
                        <>
                          <DropLink to="/admin/dashboard">Admin Panel</DropLink>
                          <DropLink to="/admin/product-approval">Approvals</DropLink>
                          <div className="my-1 border-t border-cream-200" />
                        </>
                      )}
                      <DropLink to="/creator/notifications">Notifications</DropLink>
                      <DropLink to="/orders">Orders</DropLink>
                    </div>
                    <div className="pt-1 border-t border-cream-200">
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="p-2 rounded-xl text-bark-700 hover:text-bark-900 hover:bg-cream-200 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </Link>
            )}

            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-xl text-bark-700 hover:bg-cream-200 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                {mobileOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-cream-200 bg-cream-50 animate-slide-down">
          <div className="px-4 py-3 space-y-1">
            {NAV_LINKS.map(({ to, label }) => (
              <Link key={to} to={to} className={`block px-4 py-2.5 rounded-xl text-sm font-medium ${isActive(to) ? 'text-terra-800 bg-terra-50' : 'text-bark-700 hover:bg-cream-200'}`}>{label}</Link>
            ))}
            {isAuthenticated ? (
              <>
                <div className="my-2 border-t border-cream-200" />
                {user?.role === 'seller' && <Link to="/dashboard" className="block px-4 py-2.5 rounded-xl text-sm font-medium text-bark-700 hover:bg-cream-200">Dashboard</Link>}
                {isAdmin() && <Link to="/admin/dashboard" className="block px-4 py-2.5 rounded-xl text-sm font-medium text-bark-700 hover:bg-cream-200">Admin Panel</Link>}
                <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50">Sign out</button>
              </>
            ) : (
              <Link to="/login" className="block px-4 py-2.5 rounded-xl text-sm font-medium text-terra-700 hover:bg-terra-50">Sign in</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function DropLink({ to, children }) {
  return (
    <Link to={to} className="flex items-center gap-3 px-4 py-2.5 text-sm text-bark-700 hover:bg-cream-100 transition-colors">{children}</Link>
  );
}
