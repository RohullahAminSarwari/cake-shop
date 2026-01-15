import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../config/api';

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cart');
      // Handle different response formats for cart
      const cartData = response.data?.data || response.data || {};
      setCartItems(cartData.items || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cart:', error);
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
      await api.put(`/cart/items/${itemId}`, { quantity });
      await fetchCart();
      setUpdating(null);
    } catch (error) {
      console.error('Error updating cart:', error);
      setUpdating(null);
    }
  };

  const removeItem = async (itemId) => {
    try {
      setUpdating(itemId);
      await api.delete(`/cart/items/${itemId}`);
      await fetchCart();
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Start adding some delicious cakes to your cart!</p>
          <Link to="/products" className="btn-primary">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="md:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="card p-6 flex gap-6">
                <Link to={`/products/${item.product?.id}`} className="flex-shrink-0">
                  <div className="w-32 h-32 bg-gray-200 rounded-lg overflow-hidden">
                    {item.product?.images?.[0] ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        🎂
                      </div>
                    )}
                  </div>
                </Link>

                <div className="flex-1">
                  <Link to={`/products/${item.product?.id}`}>
                    <h3 className="text-xl font-bold mb-2 hover:text-pink-600">
                      {item.product?.name}
                    </h3>
                  </Link>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {item.product?.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-pink-600">
                        ${(item.product?.discount_price || item.product?.price || 0) * item.quantity}
                      </span>
                      <span className="text-gray-400">
                        ${item.product?.discount_price || item.product?.price} each
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center border rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={updating === item.id}
                          className="w-10 h-10 hover:bg-gray-100 disabled:opacity-50"
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={updating === item.id}
                          className="w-10 h-10 hover:bg-gray-100 disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={updating === item.id}
                        className="text-red-600 hover:text-red-700 font-semibold disabled:opacity-50"
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
          <div className="card p-6 h-fit sticky top-24">
            <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-semibold">${tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-4 flex justify-between text-xl">
                <span className="font-bold">Total</span>
                <span className="font-bold text-pink-600">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn-primary w-full mb-4"
            >
              Proceed to Checkout
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

