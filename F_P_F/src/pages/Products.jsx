import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../config/api';
import { useAuth } from '../contexts/AuthContext';

export default function Products() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [selectedCategory, user, isAuthenticated]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'all') params.category_id = selectedCategory;

      let response;
      if (isAuthenticated && user?.role === 'seller') {
        response = await api.get('/my-products', { params });
      } else {
        response = await api.get('/products', { params });
      }

      let data;
      if (user?.role === 'seller') {
        data = response.data?.data || response.data || [];
      } else {
        data = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      }
      setProducts(Array.isArray(data) ? data : (data.data || []));
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const r = await api.get('/categories');
      setCategories(Array.isArray(r.data) ? r.data : (r.data?.data || []));
    } catch {}
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const r = await api.delete(`/products/${productId}`);
      if (r.data.success) setProducts(products.filter(p => p.id !== productId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const filtered = (Array.isArray(products) ? products : []).filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isSeller = isAuthenticated && user?.role === 'seller';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="section-title">{isSeller ? 'My Products' : 'All Products'}</h1>
          <p className="section-subtitle">
            {isSeller ? 'Manage your products and track their status' : 'Browse our full collection'}
          </p>
        </div>
        {isSeller && (
          <Link to="/add-product" className="btn-primary shrink-0">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Product
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="card p-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setSearchParams(e.target.value === 'all' ? {} : { category: e.target.value });
            }}
            className="input-field sm:w-56"
          >
            <option value="all">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-stone-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 stagger-children">
          {filtered.map((product) => (
            <div key={product.id} className="card-hover group overflow-hidden flex flex-col">
              <div className="relative aspect-square bg-stone-100 overflow-hidden">
                {product.images?.[0] ? (
                  <img
                    src={typeof product.images[0] === 'string' ? product.images[0] : product.images[0]?.url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-stone-50 to-stone-100">
                    🎂
                  </div>
                )}
                {product.discount_price && (
                  <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                    Sale
                  </div>
                )}
                {isSeller && (
                  <div className="absolute top-3 right-3">
                    <span className={`badge ${
                      (product.approval_status || product.status) === 'approved' ? 'bg-green-100 text-green-700' :
                      (product.approval_status || product.status) === 'pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {product.approval_status || product.status}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-semibold text-stone-900 mb-1 group-hover:text-brand-600 transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm text-stone-500 line-clamp-2 mb-4 flex-1">{product.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-stone-900">${product.discount_price || product.price}</span>
                    {product.discount_price && (
                      <span className="text-sm text-stone-400 line-through">${product.price}</span>
                    )}
                  </div>
                  {isSeller ? (
                    <div className="flex gap-1.5">
                      <Link to={`/edit-product/${product.id}`} className="btn-ghost text-xs px-3 py-1.5 text-brand-600">Edit</Link>
                      <button onClick={() => handleDeleteProduct(product.id)} className="btn-ghost text-xs px-3 py-1.5 text-red-600 hover:bg-red-50">Delete</button>
                    </div>
                  ) : (
                    <Link to={`/products/${product.id}`} className="btn-ghost text-xs px-3 py-1.5 text-brand-600">
                      View
                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 card p-12">
          <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-stone-900 mb-2">
            {isSeller ? 'No products yet' : 'No products found'}
          </h3>
          <p className="text-stone-500 mb-6">
            {isSeller ? 'Start by adding your first product' : 'Try adjusting your search or filters'}
          </p>
          {isSeller && (
            <Link to="/add-product" className="btn-primary">Add Your First Product</Link>
          )}
        </div>
      )}
    </div>
  );
}
