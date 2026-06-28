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
          } catch { return { ...cat, productCount: 0 }; }
        })
      );
      setCategories(withCounts);
    } catch { setError('Failed to load categories.'); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex justify-center">
      <div className="w-8 h-8 border-2 border-cream-300 border-t-terra-600 rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center card p-12 max-w-md mx-auto">
        <div className="text-5xl mb-4">⚠️</div>
        <h3 className="font-display text-xl text-bark-900 mb-2">Something went wrong</h3>
        <p className="text-sm text-bark-500 mb-6">{error}</p>
        <button onClick={fetchCategories} className="btn-primary">Try Again</button>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10">
        <h1 className="section-title">Shop by Occasion</h1>
        <p className="section-subtitle">Curated selections for your most meaningful moments</p>
      </div>

      {categories.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {categories.map((cat) => (
            <Link key={cat.id} to={`/products?category=${cat.id}`}
              className="group relative h-64 sm:h-72 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-bark-700 to-bark-900">
                <div className="absolute inset-0 flex items-center justify-center text-8xl opacity-20 group-hover:opacity-30 group-hover:scale-110 transition-all duration-500">
                  {cat.icon || '🎂'}
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-bark-950/80 via-transparent to-transparent" />
              <div className="absolute top-4 right-4">
                <span className="badge bg-white/20 backdrop-blur-sm text-white border border-white/10">
                  {cat.productCount} {cat.productCount === 1 ? 'item' : 'items'}
                </span>
              </div>
              <div className="relative h-full flex flex-col justify-end p-6">
                <h3 className="font-display text-2xl text-white mb-1">{cat.name}</h3>
                <p className="text-cream-400 text-sm mb-3">
                  {cat.description || `Explore our ${cat.name.toLowerCase()} collection`}
                </p>
                <div className="flex items-center text-sm font-medium text-cream-300 group-hover:text-white transition-colors">
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
          <div className="text-5xl mb-4">📁</div>
          <h3 className="font-display text-2xl text-bark-900 mb-2">No categories yet</h3>
          <p className="text-bark-500">Check back later for our collections.</p>
        </div>
      )}

      <div className="mt-12 text-center">
        <Link to="/products" className="btn-secondary">Browse All Pastries</Link>
      </div>
    </div>
  );
}
