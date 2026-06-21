import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import guestCartService from '../services/guestCartService';
import api from '../config/api';
import notificationService from '../services/notificationService';

export default function GuestCheckout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [guestInfo, setGuestInfo] = useState({
    name: '', email: '', phone: '', address: '', city: '', postal_code: '', notes: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const guestCart = guestCartService.getCart();
    setCartItems(guestCart.items || []);
    setLoading(false);
  }, []);

  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (item.product?.discount_price || item.product?.price || 0) * item.quantity;
  }, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const validateForm = () => {
    const newErrors = {};
    if (!guestInfo.name.trim()) newErrors.name = 'Name is required';
    if (!guestInfo.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(guestInfo.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!guestInfo.phone.trim()) newErrors.phone = 'Phone is required';
    if (!guestInfo.address.trim()) newErrors.address = 'Address is required';
    if (!guestInfo.city.trim()) newErrors.city = 'City is required';
    if (!guestInfo.postal_code.trim()) newErrors.postal_code = 'Postal code is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGuestInfo(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || cartItems.length === 0) return;

    try {
      setSubmitting(true);
      const orderData = {
        guest_info: guestInfo,
        items: cartItems.map(item => ({
          product_id: item.product_id,
          product_name: item.product.name,
          quantity: item.quantity,
          price: item.product.discount_price || item.product.price,
          total: (item.product.discount_price || item.product.price) * item.quantity,
          product: item.product // Include full product data for notifications
        })),
        subtotal, tax, total, is_guest_order: true
      };

      const response = await api.post('/guest-orders', orderData);
      if (response.data.success) {
        // Send notifications to product creators
        const notificationResult = await notificationService.notifyProductCreator({
          ...orderData,
          order_id: response.data.order_id
        });

        guestCartService.clearCart();
        alert('Order placed successfully! The product creator will contact you soon.');
        navigate('/order-confirmation', { 
          state: { orderId: response.data.order_id, isGuest: true, guestInfo }
        });
      } else {
        alert('Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Error placing guest order:', error);
      alert(error.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
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

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <button onClick={() => navigate('/products')} className="btn-primary">
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold mb-8">Guest Checkout</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Order Items */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
          <div className="space-y-4 mb-6">
            {cartItems.map((item) => (
              <div key={item.id} className="card p-4 flex gap-4">
                <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                  {item.product?.images?.[0] ? (
                    <img 
                      src={typeof item.product.images[0] === 'string' ? item.product.images[0] : item.product.images[0]?.url} 
                      alt={item.product.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🎂</div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{item.product?.name}</h3>
                  <p className="text-gray-600">Quantity: {item.quantity}</p>
                  <p className="text-pink-600 font-bold">
                    ${(item.product?.discount_price || item.product?.price || 0) * item.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="card p-6">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>Total</span><span className="text-pink-600">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Guest Information Form */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Your Information</h2>
          <form onSubmit={handleSubmit} className="card p-6 space-y-4">
            <div>
              <label className="block font-semibold mb-2">Full Name *</label>
              <input
                type="text" name="name" value={guestInfo.name} onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="John Doe"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block font-semibold mb-2">Email *</label>
              <input
                type="email" name="email" value={guestInfo.email} onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="john@example.com"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block font-semibold mb-2">Phone Number *</label>
              <input
                type="tel" name="phone" value={guestInfo.phone} onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+1234567890"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block font-semibold mb-2">Delivery Address *</label>
              <textarea
                name="address" value={guestInfo.address} onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                  errors.address ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="123 Main Street, Apt 4B"
                rows="3"
              />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-2">City *</label>
                <input
                  type="text" name="city" value={guestInfo.city} onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                    errors.city ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="New York"
                />
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
              </div>

              <div>
                <label className="block font-semibold mb-2">Postal Code *</label>
                <input
                  type="text" name="postal_code" value={guestInfo.postal_code} onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                    errors.postal_code ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="10001"
                />
                {errors.postal_code && <p className="text-red-500 text-sm mt-1">{errors.postal_code}</p>}
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-2">Order Notes (Optional)</label>
              <textarea
                name="notes" value={guestInfo.notes} onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent border-gray-300"
                placeholder="Special instructions or delivery notes..."
                rows="3"
              />
            </div>

            <button
              type="submit" disabled={submitting}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Placing Order...' : 'Place Order'}
            </button>

            <p className="text-sm text-gray-600 text-center">
              By placing this order, you agree to be contacted by the product creator for delivery arrangements.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
