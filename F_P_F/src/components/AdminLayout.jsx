import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SIDEBAR_LINKS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /> },
  { to: '/admin/orders', label: 'Orders', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" /> },
  { to: '/admin/products', label: 'Inventory', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /> },
  { to: '/admin/users', label: 'Users', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /> },
  { to: '/admin/categories', label: 'Categories', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /> },
  { to: '/admin/product-approval', label: 'Approvals', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> },
];

export default function AdminLayout({ children, title, subtitle }) {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-cream-50 border-r border-cream-300 shrink-0">
        <div className="p-6 border-b border-cream-200">
          <h2 className="font-display text-lg text-terra-800 italic">Artisan Baker Hub</h2>
          <p className="text-[11px] text-bark-400 mt-0.5">Vendor Dashboard</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {SIDEBAR_LINKS.map(({ to, label, icon }) => (
            <Link key={to} to={to}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                location.pathname === to
                  ? 'bg-terra-700 text-white'
                  : 'text-bark-600 hover:bg-cream-200 hover:text-bark-900'
              }`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">{icon}</svg>
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-cream-200">
          <div className="flex items-center gap-3 px-4 py-2.5">
            <div className="w-8 h-8 bg-terra-100 text-terra-800 rounded-full flex items-center justify-center text-sm font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-bark-800 truncate">{user?.name || 'Admin'}</p>
              <p className="text-[11px] text-bark-400">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar toggle row */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-cream-300 flex items-center justify-around py-2 px-1">
        {SIDEBAR_LINKS.slice(0, 5).map(({ to, label, icon }) => (
          <Link key={to} to={to}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-medium transition-colors ${
              location.pathname === to ? 'text-terra-700' : 'text-bark-500'
            }`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">{icon}</svg>
            {label}
          </Link>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 p-6 lg:p-10 overflow-auto pb-20 lg:pb-10">
        {children}
      </div>
    </div>
  );
}
