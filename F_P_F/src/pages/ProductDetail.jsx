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
      const response = await api.get(`/products/${id}`);
      console.log(response.data);
      // Handle different response formats for single product
      const productData = response.data?.data || response.data || null;
      setProduct(productData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching product:', error);
      setLoading(false);
    }
  
  };


  const addToCart = async () => {
    if (!product) {
      console.error('Product is null/undefined');
      alert('Product not available');
      return;
    }

    if (product.stock !== undefined && product.stock === 0) {
      alert('Product is out of stock');
      return;
    }

    if (quantity < 1) {
      alert('Please select a valid quantity');
      return;
    }

    try {
      setAddingToCart(true);
      
      if (isAuthenticated) {
        // Authenticated user - use API
        await api.post('/cart/add', { product_id: id, quantity });
      } else {
        // Guest user - use local storage
        guestCartService.addItem(product, quantity);
        // Dispatch event to update cart count in navigation
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      }
      
      setAddingToCart(false);
      alert('Product added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add product to cart: ' + (error.response?.data?.message || error.message));
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center fade-in">
          <div className="spinner mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center card p-16 fade-in">
          <div className="text-8xl mb-6">🔍</div>
          <h2 className="text-3xl font-bold mb-4 gradient-text">Product not found</h2>
          <button onClick={() => navigate('/products')} className="btn-primary shadow-xl hover:shadow-2xl">
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="fade-in">
          <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl overflow-hidden mb-6 shadow-xl">
            {product.images?.[selectedImage] ? (
              <img
                src={typeof product.images[selectedImage] === 'string' ? product.images[selectedImage] : product.images[selectedImage]?.url}
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
                  className={`aspect-square rounded-xl overflow-hidden border-2 hover:scale-105 transition-all duration-300 ${
                    selectedImage === index ? 'border-purple-500 shadow-lg' : 'border-purple-200'
                  }`}
                >
                  <img 
                    src={typeof image === 'string' ? image : image?.url} 
                    alt={`${product.name} ${index + 1}`} 
                    className="w-full h-full object-cover" 
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="fade-in" style={{ animationDelay: '0.2s' }}>
          <h1 className="text-5xl font-bold mb-4 gradient-text">{product.name}</h1>
          <div className="flex items-center gap-4 mb-6">
            <span className="text-4xl font-bold gradient-text">
              ${product.discount_price || product.price}
            </span>
            {product.discount_price && (
              <>
                <span className="text-2xl text-gray-400 line-through">${product.price}</span>
                <span className="badge badge-danger">
                  {Math.round(((product.price - product.discount_price) / product.price) * 100)}% OFF
                </span>
              </>
            )}
          </div>

          <div className="card p-6 mb-6">
            <h3 className="text-lg font-bold mb-3 text-gray-700">Description</h3>
            <p className="text-gray-600 leading-relaxed text-lg">{product.description}</p>
          </div>

          {product.stock !== undefined && (
            <div className="mb-6">
              <span className={`font-bold text-lg ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
              </span>
            </div>
          )}

          <div className="card p-6 mb-6">
            <label className="block font-bold mb-3 text-gray-700">Quantity</label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 border-2 border-purple-200 rounded-xl hover:bg-purple-100 transition-colors text-xl font-bold"
              >
                -
              </button>
              <span className="text-2xl font-bold w-16 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-12 h-12 border-2 border-purple-200 rounded-xl hover:bg-purple-100 transition-colors text-xl font-bold"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={addToCart}
              disabled={addingToCart || (product.stock !== undefined && product.stock === 0)}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl text-lg"
            >
              {addingToCart ? 'Adding...' : 'Add to Cart'}
            </button>
            <button 
              className="btn-secondary shadow-md hover:shadow-lg"
            >
              ❤️ Wishlist
            </button>
          </div>

          {product.category && (
            <div className="mt-6 pt-6 border-t-2 border-purple-200">
              <p className="text-sm text-gray-600">
                Category: <span className="font-bold text-purple-600">{product.category.name}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

