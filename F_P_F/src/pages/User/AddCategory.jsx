import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';

export default function AddCategory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '🎂',
    status: 'active',
  });

  const [errors, setErrors] = useState({});

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
      newErrors.name = 'Category name is required';
    }
    
    if (formData.name.length > 255) {
      newErrors.name = 'Category name must be less than 255 characters';
    }
    
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }
    
    if (formData.icon && formData.icon.length > 10) {
      newErrors.icon = 'Icon must be less than 10 characters';
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
      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        icon: formData.icon.trim() || '🎂',
        status: formData.status,
      };

      const response = await api.post('/categories', categoryData);
      
      if (response.data.success) {
        alert('Category submitted successfully! It will be available once approved by an admin.');
        navigate('/categories');
      } else {
        alert('Failed to submit category. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting category:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to submit category';
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const commonIcons = ['🎂', '🧁', '🍪', '🍰', '🍩', '🥧', '🍮', '🍭', '🍬', '🧈', '🍯', '☕', '🥤'];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Add New Category</h1>
        <p className="text-gray-600">Create a new product category</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-semibold mb-2">Category Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`input-field ${errors.name ? 'border-red-500' : ''}`}
              placeholder="e.g., Birthday Cakes"
              maxLength="255"
              required
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block font-semibold mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`input-field ${errors.description ? 'border-red-500' : ''}`}
              rows="3"
              placeholder="Describe this category..."
              maxLength="1000"
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            <p className="text-sm text-gray-500 mt-1">
              {formData.description.length}/1000 characters
            </p>
          </div>

          <div>
            <label className="block font-semibold mb-2">Icon Emoji</label>
            <div className="space-y-3">
              <input
                type="text"
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                className={`input-field ${errors.icon ? 'border-red-500' : ''}`}
                placeholder="🎂"
                maxLength="2"
              />
              {errors.icon && <p className="text-red-500 text-sm mt-1">{errors.icon}</p>}
              
              <div>
                <p className="text-sm text-gray-600 mb-2">Or choose from common icons:</p>
                <div className="flex flex-wrap gap-2">
                  {commonIcons.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, icon }))}
                      className={`w-10 h-10 text-lg border rounded hover:bg-gray-100 transition-colors ${
                        formData.icon === icon ? 'border-pink-500 bg-pink-50' : 'border-gray-300'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
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
                  <strong>Note:</strong> Your category will be submitted for admin approval before it becomes available.
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
              {loading ? 'Submitting...' : 'Submit Category'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/categories')}
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
