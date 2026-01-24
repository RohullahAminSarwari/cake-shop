import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { orderId, isGuest, guestInfo } = location.state || {};

  useEffect(() => {
    if (!orderId) {
      navigate('/');
    }
  }, [orderId, navigate]);

  if (!orderId) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <div className="text-6xl mb-6">✅</div>
        <h1 className="text-4xl font-bold mb-4 text-green-600">Order Confirmed!</h1>
        
        <div className="card p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Order Details</h2>
          <p className="text-lg mb-2">
            <strong>Order ID:</strong> #{orderId}
          </p>
          
          {isGuest ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-blue-800 mb-2">Guest Order Information</h3>
              <p className="text-blue-700">
                Thank you for your order! The product creator will contact you shortly at:
              </p>
              <ul className="text-left mt-2 space-y-1">
                <li><strong>Email:</strong> {guestInfo?.email}</li>
                <li><strong>Phone:</strong> {guestInfo?.phone}</li>
                <li><strong>Address:</strong> {guestInfo?.address}, {guestInfo?.city} {guestInfo?.postal_code}</li>
              </ul>
            </div>
          ) : (
            <p className="text-gray-600 mb-4">
              You can view your order details in your account dashboard.
            </p>
          )}
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">What happens next?</h3>
            <ul className="text-left space-y-2 text-yellow-700">
              <li>• The product creator will review your order</li>
              <li>• You'll receive contact information for delivery arrangements</li>
              <li>• Payment and delivery details will be coordinated directly</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/products')}
            className="btn-primary"
          >
            Continue Shopping
          </button>
          
          {!isGuest && (
            <button
              onClick={() => navigate('/orders')}
              className="btn-secondary"
            >
              View My Orders
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
