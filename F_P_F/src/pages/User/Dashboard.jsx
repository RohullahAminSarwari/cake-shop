import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';

const STATUS_STYLES = {
  approved: 'bg-emerald-50 text-emerald-700',
  pending:  'bg-amber-50 text-amber-700',
  rejected: 'bg-red-50 text-red-700',
};

export default function UserDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0, rejected: 0 });
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'seller') fetchData();
  }, [isAuthenticated, user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const r = await api.get('/my-products');
      const data = r.data?.data || r.data || [];
      const products = Array.isArray(data) ? data : (data.data || []);

      setStats({
        total: products.length,
        approved: products.filter(p => p.approval_status === 'approved').length,
        pending: products.filter(p => p.approval_status === 'pending').length,
        rejected: products.filter(p => p.approval_status === 'rejected').length,
      });
      setRecentProducts(products.slice(0, 5));
    } catch {
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || user?.role !== 'seller') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-2xl font-bold text-stone-900 mb-2">Seller Dashboard</h1>
        <p className="text-stone-500 mb-6">
          {!isAuthenticated ? 'Please sign in to access your dashboard.' : 'This dashboard is for sellers only.'}
        </p>
        <Link to={!isAuthenticated ? '/login' : '/products'} className="btn-primary">
          {!isAuthenticated ? 'Sign In' : 'Browse Products'}
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex justify-center">
        <div className="w-8 h-8 border-2 border-stone-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Products', value: stats.total, color: 'bg-blue-500' },
    { label: 'Approved', value: stats.approved, color: 'bg-emerald-500' },
    { label: 'Pending', value: stats.pending, color: 'bg-amber-500' },
    { label: 'Rejected', value: stats.rejected, color: 'bg-red-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="section-title">Seller Dashboard</h1>
        <p className="section-subtitle">Manage your products and track performance</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10 stagger-children">
        {statCards.map(({ label, value, color }) => (
          <div key={label} className="card p-6 flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-stone-500 mb-1">{label}</p>
              <p className="text-2xl font-bold text-stone-900">{value}</p>
            </div>
            <div className={`w-3 h-3 ${color} rounded-full mt-2`} />
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card p-6 mb-10">
        <h2 className="text-lg font-semibold text-stone-900 mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <Link to="/add-product" className="btn-primary justify-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Product
          </Link>
          <Link to="/my-products" className="btn-secondary justify-center">My Products</Link>
          <Link to="/add-category" className="btn-secondary justify-center">Add Category</Link>
        </div>
      </div>

      {/* Recent Products */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-stone-100">
          <h2 className="text-lg font-semibold text-stone-900">Recent Products</h2>
          <Link to="/my-products" className="text-sm font-medium text-brand-600 hover:text-brand-700">View all</Link>
        </div>
        {recentProducts.length > 0 ? (
          <div className="divide-y divide-stone-100">
            {recentProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between px-6 py-4 hover:bg-stone-50/50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-stone-900 truncate">{product.name}</p>
                  <p className="text-sm text-stone-500">${product.price}</p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className={`badge ${STATUS_STYLES[product.approval_status] || 'bg-stone-100 text-stone-700'}`}>
                    {product.approval_status}
                  </span>
                  <Link to={`/edit-product/${product.id}`} className="btn-ghost text-xs px-2 py-1 text-brand-600">Edit</Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <p className="text-sm text-stone-500 mb-3">No products yet</p>
            <Link to="/add-product" className="text-sm font-medium text-brand-600 hover:text-brand-700">Add your first product</Link>
          </div>
        )}
      </div>
    </div>
  );
}
