import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/api';

const STAT_CONFIG = [
  { key: 'totalUsers',    label: 'Users',    icon: 'users',    color: 'bg-blue-500',  link: '/admin/users' },
  { key: 'totalProducts', label: 'Products', icon: 'box',      color: 'bg-brand-500', link: '/admin/products' },
  { key: 'totalOrders',   label: 'Orders',   icon: 'receipt',  color: 'bg-emerald-500', link: '/admin/orders' },
  { key: 'totalRevenue',  label: 'Revenue',  icon: 'dollar',   color: 'bg-violet-500', format: 'currency' },
];

const ICONS = {
  users: <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />,
  box: <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />,
  receipt: <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185z" />,
  dollar: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
};

const STATUS_STYLES = {
  completed: 'bg-emerald-50 text-emerald-700',
  pending:   'bg-amber-50 text-amber-700',
  processing:'bg-blue-50 text-blue-700',
  cancelled: 'bg-red-50 text-red-700',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalProducts: 0, totalOrders: 0, totalRevenue: 0 });
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/admin/dashboard/stats').then(r => setStats(r.data)).catch(() => {}),
      api.get('/admin/orders?limit=5').then(r => {
        const d = Array.isArray(r.data) ? r.data : (r.data?.data || []);
        setOrders(d);
      }).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex justify-center">
        <div className="w-8 h-8 border-2 border-stone-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="section-title">Dashboard</h1>
        <p className="section-subtitle">Overview of your store performance</p>
      </div>

      {/* Quick Links */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link to="/admin/categories" className="btn-ghost text-sm bg-stone-100 hover:bg-stone-200">
          <svg className="w-4 h-4 mr-1.5 text-stone-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
          </svg>
          Categories
        </Link>
        <Link to="/admin/product-approval" className="btn-ghost text-sm bg-stone-100 hover:bg-stone-200">
          <svg className="w-4 h-4 mr-1.5 text-stone-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Approvals
        </Link>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10 stagger-children">
        {STAT_CONFIG.map(({ key, label, icon, color, link, format }) => {
          const value = format === 'currency' ? `$${(stats[key] || 0).toFixed(2)}` : (stats[key] || 0);
          const inner = (
            <div className="card p-6 flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-stone-500 mb-1">{label}</p>
                <p className="text-2xl font-bold text-stone-900">{value}</p>
              </div>
              <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center shrink-0`}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  {ICONS[icon]}
                </svg>
              </div>
            </div>
          );
          return link ? (
            <Link key={key} to={link} className="hover:ring-2 hover:ring-stone-200 rounded-2xl transition-all">{inner}</Link>
          ) : (
            <div key={key}>{inner}</div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-stone-100">
          <h2 className="text-lg font-semibold text-stone-900">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">
            View all
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-stone-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                {ICONS.receipt}
              </svg>
            </div>
            <p className="text-sm text-stone-500">No orders yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-stone-50">
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wider px-6 py-3">Order</th>
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wider px-6 py-3">Customer</th>
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wider px-6 py-3">Total</th>
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-stone-500 uppercase tracking-wider px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-stone-900">#{order.order_number}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-stone-600">{order.user?.name || '—'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-stone-900">${order.total_price}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${STATUS_STYLES[order.status] || 'bg-stone-100 text-stone-700'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-stone-500">{new Date(order.created_at).toLocaleDateString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
