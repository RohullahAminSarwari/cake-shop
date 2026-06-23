import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../config/api';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const r = await api.get('/categories');
      const data = Array.isArray(r.data) ? r.data : (r.data?.data || []);

      const withCounts = await Promise.all(
        data.map(async (cat) => {
          try {
            const pr = await api.get(`/products?category_id=${cat.id}`);
            const pd = Array.isArray(pr.data) ? pr.data : (pr.data?.data || []);
            return { ...cat, productCount: pd.length };
          } catch {
            return { ...cat, productCount: 0 };
          }
        })
      );
      setCategories(withCounts);
    } catch {
      setError('Failed to load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex justify-center">
          <div className="w-8 h-8 border-2 border-stone-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center card p-12 max-w-md mx-auto">
          <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-stone-900 mb-2">Something went wrong</h3>
          <p className="text-sm text-stone-500 mb-6">{error}</p>
          <button onClick={fetchCategories} className="btn-primary">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="section-title">Categories</h1>
        <p className="section-subtitle">Explore our collection organized by type</p>
      </div>

      {categories.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${cat.id}`}
              className="card-hover group overflow-hidden"
            >
              {/* Icon header */}
              <div className="relative h-40 bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center">
                <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
                  {cat.icon || '🎂'}
                </span>
                <div className="absolute top-4 right-4">
                  <span className="badge bg-white/80 backdrop-blur-sm text-stone-700 border border-stone-200/50">
                    {cat.productCount} {cat.productCount === 1 ? 'item' : 'items'}
                  </span>
                </div>
              </div>
              {/* Info */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-stone-900 mb-1 group-hover:text-brand-600 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-sm text-stone-500 line-clamp-2 mb-4">
                  {cat.description || `Browse our selection of ${cat.name.toLowerCase()}.`}
                </p>
                <div className="flex items-center text-sm font-medium text-brand-600 group-hover:text-brand-700 transition-colors">
                  Shop now
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 card p-12">
          <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-stone-900 mb-2">No categories yet</h3>
          <p className="text-stone-500">Check back later for our product categories.</p>
        </div>
      )}

      {/* All Products Link */}
      <div className="mt-12 text-center">
        <Link to="/products" className="btn-secondary">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6z" />
          </svg>
          Browse All Products
        </Link>
      </div>
    </div>
  );
}
