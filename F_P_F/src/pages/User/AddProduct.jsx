import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';

export default function AddProduct() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  
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
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      const data = response.data?.data || response.data || [];
      setCategories(Array.isArray(data) ? data : []);
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
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
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

      const response = await api.post('/products', productData);
      
      if (response.data.success) {
        alert(response.data.message || 'Product submitted successfully! It will be visible once approved by an admin.');
        navigate('/my-products');
      } else {
        alert('Failed to submit product. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting product:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit product';
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingCategories) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
          <p className="mt-4 text-gray-600">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Add New Product</h1>
        <p className="text-gray-600">Submit your product for admin approval</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold mb-2">Product Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                placeholder="Enter product name"
                required
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block font-semibold mb-2">Category *</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className={`input-field ${errors.category_id ? 'border-red-500' : ''}`}
                required
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category_id && <p className="text-red-500 text-sm mt-1">{errors.category_id}</p>}
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-2">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`input-field ${errors.description ? 'border-red-500' : ''}`}
              rows="4"
              placeholder="Describe your product..."
              required
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block font-semibold mb-2">Price ($) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className={`input-field ${errors.price ? 'border-red-500' : ''}`}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block font-semibold mb-2">Discount Price ($)</label>
              <input
                type="number"
                name="discount_price"
                value={formData.discount_price}
                onChange={handleChange}
                className={`input-field ${errors.discount_price ? 'border-red-500' : ''}`}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
              {errors.discount_price && <p className="text-red-500 text-sm mt-1">{errors.discount_price}</p>}
            </div>

            <div>
              <label className="block font-semibold mb-2">Stock *</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className={`input-field ${errors.stock ? 'border-red-500' : ''}`}
                placeholder="0"
                min="0"
                required
              />
              {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-2">Status *</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="text-yellow-600 text-xl">ℹ️</span>
              <div>
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Your product will be submitted for admin approval before it becomes visible in the shop.
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  You'll receive a notification once it's reviewed.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Product'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/my-products')}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
