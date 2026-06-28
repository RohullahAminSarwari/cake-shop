import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';

const STATUS_STYLES = {
  completed: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
  active: 'bg-green-100 text-green-700',
};

export default function AdminDashboard() {
  const { user } = useAuth();
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

  if (loading) return (
    <div className="flex justify-center items-center py-20">
      <div className="w-8 h-8 border-2 border-cream-300 border-t-terra-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="font-display text-3xl lg:text-4xl text-bark-950">Marketplace Overview</h1>
          <p className="text-bark-500 text-sm mt-1">A sophisticated look at your patisserie ecosystem.</p>
        </div>
        <div className="hidden sm:flex items-center gap-3 bg-cream-100 rounded-xl px-4 py-2.5 border border-cream-300">
          <div className="w-8 h-8 bg-terra-100 text-terra-800 rounded-full flex items-center justify-center text-sm font-bold">
            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div>
            <p className="text-sm font-semibold text-bark-900">{user?.name || 'Admin User'}</p>
            <p className="text-[11px] text-bark-400">Super Administrator</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-10 stagger-children">
        <div className="card p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-cream-200 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-bark-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-bark-400 mb-1">Total Users</p>
          <p className="font-display text-4xl text-bark-950">{stats.totalUsers || 0}</p>
        </div>

        <div className="bg-terra-700 rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-terra-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
              </svg>
            </div>
            <span className="badge bg-white/20 text-white text-[10px]">Urgent</span>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-terra-200 mb-1">Pending Orders</p>
          <p className="font-display text-4xl">{stats.totalOrders || 0}</p>
        </div>

        <div className="card p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-cream-200 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-bark-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-bark-400 mb-1">Monthly Revenue</p>
          <p className="font-display text-4xl text-bark-950">${(stats.totalRevenue || 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-cream-200">
          <div>
            <h2 className="font-display text-xl text-bark-950">Recent Orders</h2>
            <p className="text-xs text-bark-400 mt-0.5">Latest incoming orders</p>
          </div>
          <Link to="/admin/orders" className="text-sm font-medium text-terra-700 hover:text-terra-800 transition-colors">View All</Link>
        </div>
        {orders.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">📦</div>
            <p className="text-sm text-bark-500">No orders yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-cream-50">
                  <th className="text-left text-[11px] font-bold text-bark-500 uppercase tracking-wider px-6 py-3">Order</th>
                  <th className="text-left text-[11px] font-bold text-bark-500 uppercase tracking-wider px-6 py-3">Customer</th>
                  <th className="text-left text-[11px] font-bold text-bark-500 uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-right text-[11px] font-bold text-bark-500 uppercase tracking-wider px-6 py-3">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-cream-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-semibold text-bark-900">#{order.order_number}</td>
                    <td className="px-6 py-4 text-sm text-bark-600">{order.user?.name || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`badge ${STATUS_STYLES[order.status] || 'bg-cream-200 text-bark-700'}`}>{order.status}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-bark-900 text-right">${order.total_price}</td>
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
