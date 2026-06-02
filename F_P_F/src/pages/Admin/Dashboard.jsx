import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchRecentOrders();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/dashboard/stats');
      console.log('Admin Dashboard Stats Response:', response.data);
      
      // The API returns the stats directly, not wrapped in a data object
      const statsData = response.data;
      setStats(statsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      console.error('Error response:', error.response?.data);
      // Set default stats on error to prevent white screen
      setStats({
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
      });
      setLoading(false);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const response = await api.get('/admin/orders?limit=5');
      // Handle different response formats
      const ordersData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setRecentOrders(ordersData);
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      // Set empty array on error to prevent white screen
      setRecentOrders([]);
    }
  };

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers || 0, icon: '👥', color: 'bg-blue-500', link: '/admin/users' },
    { title: 'Total Products', value: stats.totalProducts || 0, icon: '🎂', color: 'bg-pink-500', link: '/admin/products' },
    { title: 'Categories', value: 'Manage', icon: '🏷️', color: 'bg-indigo-500', link: '/admin/categories' },
    { title: 'Total Orders', value: stats.totalOrders || 0, icon: '📦', color: 'bg-green-500', link: '/admin/orders' },
    { title: 'Total Revenue', value: `$${(stats.totalRevenue || 0).toFixed(2)}`, icon: '💰', color: 'bg-purple-500' },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Debug Info - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h3 className="font-bold text-yellow-800">Debug Info:</h3>
          <pre className="text-xs text-yellow-700">{JSON.stringify(stats, null, 2)}</pre>
        </div>
      )}
      
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const content = (
            <div className={`${stat.color} text-white card p-6`}>
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl">{stat.icon}</div>
                <div className="text-right">
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-pink-100">{stat.title}</p>
                </div>
              </div>
            </div>
          );

          return stat.link ? (
            <Link key={index} to={stat.link} className="block hover:scale-105 transition-transform">
              {content}
            </Link>
          ) : (
            <div key={index}>{content}</div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Recent Orders</h2>
          <Link to="/admin/orders" className="text-pink-600 hover:text-pink-700 font-semibold">
            View All →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📦</div>
            <p className="text-gray-600">No orders yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Order #</th>
                  <th className="text-left py-3 px-4 font-semibold">Customer</th>
                  <th className="text-left py-3 px-4 font-semibold">Total</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <Link to={`/admin/orders/${order.id}`} className="text-pink-600 hover:text-pink-700 font-semibold">
                        #{order.order_number}
                      </Link>
                    </td>
                    <td className="py-3 px-4">{order.user?.name || 'N/A'}</td>
                    <td className="py-3 px-4 font-semibold">${order.total_price}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(order.created_at).toLocaleDateString()}
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

