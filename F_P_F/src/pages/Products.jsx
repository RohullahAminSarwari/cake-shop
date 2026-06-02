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
      if (selectedCategory !== 'all') {
        params.category_id = selectedCategory;
      }

      let response;
      // Show different products based on user role
      if (isAuthenticated && user?.role === 'seller') {
        // Sellers see their own products
        response = await api.get('/my-products', { params });
      } else {
        // Guests and non-seller users see all approved products
        response = await api.get('/products', { params });
      }

      // Handle different response formats
      let productsData;
      if (user?.role === 'seller') {
        // My products API returns { success: true, data: products }
        productsData = response.data?.data || response.data || [];
      } else {
        // Public products API returns products directly or in data field
        productsData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      }
      
      setProducts(Array.isArray(productsData) ? productsData : (productsData.data || []));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      // Handle different response formats for categories
      const categoriesData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await api.delete(`/products/${productId}`);
      if (response.data.success) {
        setProducts(products.filter(p => p.id !== productId));
        alert(response.data.message || 'Product deleted successfully');
      } else {
        alert('Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert(error.response?.data?.message || 'Failed to delete product');
    }
  };

  const filteredProducts = (Array.isArray(products) ? products : []).filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              {isAuthenticated && user?.role === 'seller' ? 'My Products' : 'Our Products'}
            </h1>
            <p className="text-gray-600 text-lg">
              {isAuthenticated && user?.role === 'seller'
                ? 'Manage your products and track their status' 
                : 'Discover our delicious collection of cakes and pastries'
              }
            </p>
          </div>
          <div className="flex gap-3">
            {isAuthenticated && user?.role === 'seller' && (
              <Link 
                to="/add-product"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Product
              </Link>
            )}
            <Link 
              to="/categories"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-medium rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Browse Categories
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8 bg-white p-6 rounded-xl shadow-md">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
            />
          </div>

          {/* Category Filter */}
          <div className="md:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSearchParams({ category: e.target.value });
              }}
              className="input-field"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="card overflow-hidden group">
              <div className="relative h-64 bg-gray-200 overflow-hidden">
                {product.images?.[0]?.url ? (
                  <img
                    src={product.images[0].url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">
                    🎂
                  </div>
                )}
                {product.discount_price && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    Sale
                  </div>
                )}
                {/* Show status badge for sellers */}
                {isAuthenticated && user?.role === 'seller' && (
                  <div className="absolute top-4 left-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(product.approval_status || product.status)}`}>
                      {(product.approval_status || product.status)?.charAt(0).toUpperCase() + (product.approval_status || product.status)?.slice(1)}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-pink-600">
                      ${product.discount_price || product.price}
                    </span>
                    {product.discount_price && (
                      <span className="text-gray-400 line-through ml-2">${product.price}</span>
                    )}
                  </div>
                  {isAuthenticated && user?.role === 'seller' ? (
                    <div className="flex gap-2">
                      <Link
                        to={`/edit-product/${product.id}`}
                        className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <Link
                      to={`/products/${product.id}`}
                      className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
                    >
                      View
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <div className="text-6xl mb-4">
            {isAuthenticated && user?.role === 'seller' ? '📦' : '🔍'}
          </div>
          <h3 className="text-2xl font-bold mb-2">
            {isAuthenticated && user?.role === 'seller' ? 'No products yet' : 'No products found'}
          </h3>
          <p className="text-gray-600 mb-6">
            {isAuthenticated && user?.role === 'seller'
              ? 'Start by adding your first product to showcase your creations'
              : 'Try adjusting your search or filters'
            }
          </p>
          {isAuthenticated && user?.role === 'seller' && (
            <Link to="/add-product" className="btn-primary">
              Add Your First Product
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

