import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import guestCartService from '../services/guestCartService';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      console.log('Fetching product with ID:', id);
      const response = await api.get(`/products/${id}`);
      console.log('Product response:', response.data);
      // Handle different response formats for single product
      const productData = response.data?.data || response.data || null;
      console.log('Product data:', productData);
      setProduct(productData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching product:', error);
      setLoading(false);
    }
  };


  const addToCart = async () => {
    console.log('Add to cart clicked', { product, isAuthenticated, quantity, id });
    
    if (!product) {
      console.error('Product is null/undefined');
      alert('Product not available');
      return;
    }

    if (product.stock !== undefined && product.stock === 0) {
      console.log('Product out of stock');
      alert('Product is out of stock');
      return;
    }

    if (quantity < 1) {
      console.log('Invalid quantity:', quantity);
      alert('Please select a valid quantity');
      return;
    }

    try {
      setAddingToCart(true);
      console.log('Adding to cart...');
      
      if (isAuthenticated) {
        // Authenticated user - use API
        console.log('Using API for authenticated user');
        await api.post('/cart/add', { product_id: id, quantity });
      } else {
        // Guest user - use local storage
        console.log('Using guest cart service');
        const result = guestCartService.addItem(product, quantity);
        console.log('Guest cart result:', result);
        // Dispatch event to update cart count in navigation
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      }
      
      setAddingToCart(false);
      console.log('Product added successfully');
      alert('Product added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add product to cart: ' + (error.response?.data?.message || error.message));
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <button onClick={() => navigate('/products')} className="btn-primary">
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid md:grid-cols-2 gap-12">
        {/* Product Images */}
        <div>
          <div className="aspect-square bg-gray-200 rounded-xl overflow-hidden mb-4">
            {product.images?.[selectedImage] ? (
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-9xl">
                🎂
              </div>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-pink-600' : 'border-gray-200'
                  }`}
                >
                  <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
          <div className="flex items-center gap-4 mb-6">
            <span className="text-3xl font-bold text-pink-600">
              ${product.discount_price || product.price}
            </span>
            {product.discount_price && (
              <>
                <span className="text-2xl text-gray-400 line-through">${product.price}</span>
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {Math.round(((product.price - product.discount_price) / product.price) * 100)}% OFF
                </span>
              </>
            )}
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          {product.stock !== undefined && (
            <div className="mb-6">
              <span className={`font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
              </span>
            </div>
          )}

          <div className="mb-6">
            <label className="block font-semibold mb-2">Quantity</label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                -
              </button>
              <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={addToCart}
              disabled={addingToCart || (product.stock !== undefined && product.stock === 0)}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addingToCart ? 'Adding...' : 'Add to Cart'}
            </button>
            <button 
              onClick={() => console.log('Test button clicked')}
              className="btn-secondary"
            >
              ❤️ Wishlist
            </button>
            {/* Debug button */}
            <button 
              onClick={() => {
                console.log('Debug info:', { 
                  product, 
                  isAuthenticated, 
                  quantity, 
                  id, 
                  addingToCart,
                  stock: product?.stock 
                });
                alert('Debug info logged to console');
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Debug
            </button>
          </div>

          {product.category && (
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-600">
                Category: <span className="font-semibold">{product.category.name}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

