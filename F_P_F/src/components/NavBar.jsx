import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';
import guestCartService from '../services/guestCartService';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/categories', label: 'Categories' },
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
      if (isAuthenticated) {
        setCartCount(user?.cart_count || 0);
      } else {
        const cart = guestCartService.getCart();
        setCartCount(cart.items?.length || 0);
      }
    };
    update();
    window.addEventListener('storage', update);
    window.addEventListener('cartUpdated', update);
    return () => {
      window.removeEventListener('storage', update);
      window.removeEventListener('cartUpdated', update);
    };
  }, [isAuthenticated, user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-stone-200/50' : 'bg-white border-b border-stone-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-stone-900 tracking-tight">Sweet Dreams</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(to)
                    ? 'text-brand-700 bg-brand-50'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-brand-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              /* Profile Dropdown */
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-stone-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-brand-100 text-brand-700 rounded-lg flex items-center justify-center text-sm font-bold">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-stone-700 max-w-[100px] truncate">
                    {user?.name}
                  </span>
                  <svg className={`w-4 h-4 text-stone-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-lg border border-stone-200 py-2 animate-scale-in origin-top-right z-50">
                    <div className="px-4 py-3 border-b border-stone-100">
                      <p className="text-sm font-semibold text-stone-900">{user?.name}</p>
                      <p className="text-xs text-stone-500 mt-0.5">{user?.email}</p>
                      <span className="inline-block mt-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md">
                        {user?.role}
                      </span>
                    </div>

                    <div className="py-1">
                      {user?.role === 'seller' && (
                        <>
                          <DropdownLink to="/dashboard" icon="grid">Dashboard</DropdownLink>
                          <DropdownLink to="/my-products" icon="box">My Products</DropdownLink>
                          <DropdownLink to="/add-product" icon="plus">Add Product</DropdownLink>
                          <DropdownLink to="/add-category" icon="tag">Add Category</DropdownLink>
                          <div className="my-1 border-t border-stone-100" />
                        </>
                      )}
                      {isAdmin() && (
                        <>
                          <DropdownLink to="/admin/dashboard" icon="chart">Admin Panel</DropdownLink>
                          <DropdownLink to="/admin/product-approval" icon="check">Approvals</DropdownLink>
                          <div className="my-1 border-t border-stone-100" />
                        </>
                      )}
                      <DropdownLink to="/creator/notifications" icon="bell">Notifications</DropdownLink>
                      <DropdownLink to="/orders" icon="receipt">Orders</DropdownLink>
                    </div>

                    <div className="pt-1 border-t border-stone-100">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                        </svg>
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn-primary text-sm px-5 py-2">
                Sign in
              </Link>
            )}

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2.5 rounded-xl text-stone-600 hover:bg-stone-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                {mobileOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
                }
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-stone-100 bg-white animate-slide-down">
          <div className="px-4 py-3 space-y-1">
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive(to)
                    ? 'text-brand-700 bg-brand-50'
                    : 'text-stone-700 hover:bg-stone-50'
                }`}
              >
                {label}
              </Link>
            ))}
            {isAuthenticated && (
              <>
                <div className="my-2 border-t border-stone-100" />
                {user?.role === 'seller' && (
                  <>
                    <Link to="/dashboard" className="block px-4 py-2.5 rounded-xl text-sm font-medium text-stone-700 hover:bg-stone-50">Dashboard</Link>
                    <Link to="/my-products" className="block px-4 py-2.5 rounded-xl text-sm font-medium text-stone-700 hover:bg-stone-50">My Products</Link>
                  </>
                )}
                {isAdmin() && (
                  <Link to="/admin/dashboard" className="block px-4 py-2.5 rounded-xl text-sm font-medium text-stone-700 hover:bg-stone-50">Admin Panel</Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Sign out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function DropdownLink({ to, icon, children }) {
  const icons = {
    grid: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />,
    box: <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />,
    plus: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />,
    tag: <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />,
    chart: <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />,
    check: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    bell: <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />,
    receipt: <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />,
  };

  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-4 py-2.5 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
    >
      <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        {icons[icon]}
      </svg>
      {children}
    </Link>
  );
}
