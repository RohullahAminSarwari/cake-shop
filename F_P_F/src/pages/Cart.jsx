import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import guestCartService from '../services/guestCartService';

export default function Cart() {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      
      if (isAuthenticated) {
        // Authenticated user - fetch from API
        const response = await api.get('/cart');
        const cartData = response.data?.data || response.data || {};
        setCartItems(cartData.items || []);
        setIsGuest(cartData.is_guest || false);
      } else {
        // Guest user - fetch from local storage
        const guestCart = guestCartService.getCart();
        setCartItems(guestCart.items || []);
        setIsGuest(true);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cart:', error);
      // Fallback to guest cart if API fails
      const guestCart = guestCartService.getCart();
      setCartItems(guestCart.items || []);
      setIsGuest(true);
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) {
      removeItem(itemId);
      return;
    }

    try {
      setUpdating(itemId);
      
      if (isAuthenticated) {
        // Authenticated user - use API
        await api.put(`/cart/items/${itemId}`, { quantity });
        await fetchCart();
      } else {
        // Guest user - use local storage
        guestCartService.updateQuantity(itemId, quantity);
        await fetchCart();
      }
      
      setUpdating(null);
    } catch (error) {
      console.error('Error updating cart:', error);
      setUpdating(null);
    }
  };

  const removeItem = async (itemId) => {
    try {
      setUpdating(itemId);
      
      if (isAuthenticated) {
        // Authenticated user - use API
        await api.delete(`/cart/items/${itemId}`);
        await fetchCart();
      } else {
        // Guest user - use local storage
        guestCartService.removeItem(itemId);
        await fetchCart();
      }
      
      setUpdating(null);
    } catch (error) {
      console.error('Error removing item:', error);
      setUpdating(null);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (item.product?.discount_price || item.product?.price || 0) * item.quantity;
  }, 0);

  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center fade-in">
          <div className="spinner mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h1 className="text-5xl font-bold mb-12 gradient-text fade-in">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="card p-16 text-center fade-in">
          <div className="text-8xl mb-6">🛒</div>
          <h2 className="text-3xl font-bold mb-4 gradient-text">Your cart is empty</h2>
          <p className="text-gray-600 text-xl mb-8">Start adding some delicious cakes to your cart!</p>
          <Link to="/products" className="btn-primary shadow-xl hover:shadow-2xl">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="md:col-span-2 space-y-6">
            {cartItems.map((item, index) => (
              <div key={item.id} className="card p-6 flex gap-6 hover:scale-102 transition-all duration-300 fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <Link to={`/products/${item.product?.id}`} className="flex-shrink-0">
                  <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl overflow-hidden shadow-md">
                    {item.product?.images?.[0] ? (
                      <img
                        src={typeof item.product.images[0] === 'string' ? item.product.images[0] : item.product.images[0]?.url}
                        alt={item.product.name}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl">
                        🎂
                      </div>
                    )}
                  </div>
                </Link>

                <div className="flex-1">
                  <Link to={`/products/${item.product?.id}`}>
                    <h3 className="text-2xl font-bold mb-2 hover:text-purple-600 transition-colors">
                      {item.product?.name}
                    </h3>
                  </Link>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {item.product?.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl font-bold gradient-text">
                        ${(item.product?.discount_price || item.product?.price || 0) * item.quantity}
                      </span>
                      <span className="text-gray-400 text-lg">
                        ${item.product?.discount_price || item.product?.price} each
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center border-2 border-purple-200 rounded-xl overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={updating === item.id}
                          className="w-12 h-12 hover:bg-purple-100 disabled:opacity-50 transition-colors text-xl font-bold"
                        >
                          -
                        </button>
                        <span className="w-16 text-center font-bold text-xl">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={updating === item.id}
                          className="w-12 h-12 hover:bg-purple-100 disabled:opacity-50 transition-colors text-xl font-bold"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={updating === item.id}
                        className="text-red-600 hover:text-red-700 font-semibold disabled:opacity-50 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="card p-8 h-fit sticky top-24 shadow-xl fade-in">
            <h2 className="text-3xl font-bold mb-6 gradient-text">Order Summary</h2>

            {isGuest && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-purple-800">
                  <strong>Guest Checkout Available:</strong> You can complete your purchase as a guest. 
                  <Link to="/login" className="text-purple-600 hover:underline font-semibold">
                    Log in
                  </Link> 
                  {' '}to save your order history.
                </p>
              </div>
            )}

            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-lg">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="text-gray-600">Tax</span>
                <span className="font-semibold">${tax.toFixed(2)}</span>
              </div>
              <div className="border-t-2 border-purple-200 pt-4 flex justify-between text-2xl">
                <span className="font-bold">Total</span>
                <span className="font-bold gradient-text">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                if (isGuest) {
                  navigate('/guest-checkout');
                } else {
                  navigate('/checkout');
                }
              }}
              className="btn-primary w-full mb-4 shadow-xl hover:shadow-2xl text-lg"
            >
              {isGuest ? 'Proceed to Guest Checkout' : 'Proceed to Checkout'}
            </button>

            <Link to="/products" className="btn-secondary w-full text-center block">
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

