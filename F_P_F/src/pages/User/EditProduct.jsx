import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';

export default function EditProduct() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  const [fetchingProduct, setFetchingProduct] = useState(true);
  const [product, setProduct] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount_price: '',
    stock: '',
    category_id: '',
    status: 'active',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isAuthenticated) {
      fetchProduct();
      fetchCategories();
    }
  }, [id, isAuthenticated]);

  const fetchProduct = async () => {
    try {
      setFetchingProduct(true);
      const response = await api.get(`/products/${id}`);
      const productData = response.data.data || response.data;
      
      // Check if product belongs to current user
      if (productData.user_id !== user.id) {
        alert('You can only edit your own products');
        navigate('/my-products');
        return;
      }
      
      setProduct(productData);
      setFormData({
        name: productData.name || '',
        description: productData.description || '',
        price: productData.price || '',
        discount_price: productData.discount_price || '',
        stock: productData.stock || '',
        category_id: productData.category_id || '',
        status: productData.status || 'active',
      });
      setFetchingProduct(false);
    } catch (error) {
      console.error('Error fetching product:', error);
      alert('Failed to load product');
      navigate('/my-products');
      setFetchingProduct(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setFetchingCategories(true);
      const response = await api.get('/categories');
      const categoriesData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setCategories(categoriesData);
      setFetchingCategories(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setFetchingCategories(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }
    
    if (formData.discount_price && parseFloat(formData.discount_price) <= 0) {
      newErrors.discount_price = 'Discount price must be greater than 0';
    }
    
    if (!formData.stock || parseInt(formData.stock) < 0) {
      newErrors.stock = 'Stock must be 0 or greater';
    }
    
    if (!formData.category_id) {
      newErrors.category_id = 'Please select a category';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
        stock: parseInt(formData.stock),
        category_id: parseInt(formData.category_id),
      };

      const response = await api.put(`/products/${id}`, productData);
      
      if (response.data.success) {
        alert(response.data.message || 'Product updated successfully!');
        navigate('/my-products');
      } else {
        alert('Failed to update product. Please try again.');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert(error.response?.data?.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Edit Product</h1>
          <p className="text-gray-600 mb-8">Please log in to edit products</p>
          <button onClick={() => navigate('/login')} className="btn-primary">
            Log In
          </button>
        </div>
      </div>
    );
  }

  if (fetchingProduct || fetchingCategories) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Edit Product</h1>
          <p className="text-gray-600 text-lg">Update your product information</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter product name"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Describe your product..."
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price ($) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
            </div>

            {/* Discount Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Price ($)
              </label>
              <input
                type="number"
                name="discount_price"
                value={formData.discount_price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                  errors.discount_price ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00 (optional)"
              />
              {errors.discount_price && <p className="mt-1 text-sm text-red-600">{errors.discount_price}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Quantity *
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                  errors.stock ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0"
              />
              {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                  errors.category_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category_id && <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Product'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/my-products')}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
