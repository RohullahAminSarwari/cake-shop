import { Link, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';

export default function MyProducts() {
  const { user, isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyProducts();
      fetchCategories();
    }
  }, [selectedCategory, isAuthenticated]);

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'all') {
        params.category_id = selectedCategory;
      }
      const response = await api.get('/my-products', { params });
      // Handle the response format from UserProductController
      const productsData = response.data?.data || response.data || [];
      setProducts(Array.isArray(productsData) ? productsData : (productsData.data || []));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching my products:', error);
      setProducts([]);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      const categoriesData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filteredProducts = (Array.isArray(products) ? products : []).filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">My Products</h1>
          <p className="text-gray-600 mb-8">Please log in to view your products</p>
          <Link to="/login" className="btn-primary">
            Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Products</h1>
            <p className="text-gray-600 text-lg">Manage your products and track their status</p>
          </div>
          <Link to="/add-product" className="btn-primary">
            Add New Product
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search your products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setSearchParams({ category: e.target.value });
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        </div>
      )}

      {/* Products Grid */}
      {!loading && (
        <>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {products.length === 0 ? 'No products yet' : 'No products found'}
              </h3>
              <p className="text-gray-600 mb-6">
                {products.length === 0 
                  ? 'Start by adding your first product to showcase your creations'
                  : 'Try adjusting your search or filters'
                }
              </p>
              {products.length === 0 && (
                <Link to="/add-product" className="btn-primary">
                  Add Your First Product
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    {product.image && (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(product.approval_status || product.status)}`}>
                        {(product.approval_status || product.status)?.charAt(0).toUpperCase() + (product.approval_status || product.status)?.slice(1)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        {product.discount_price ? (
                          <>
                            <span className="text-lg font-bold text-pink-600">${product.discount_price}</span>
                            <span className="text-sm text-gray-500 line-through ml-2">${product.price}</span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-pink-600">${product.price}</span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                    </div>

                    <div className="flex gap-2">
                      <Link 
                        to={`/edit-product/${product.id}`}
                        className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center text-sm"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
