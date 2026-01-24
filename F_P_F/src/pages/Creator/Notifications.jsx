import { useState, useEffect } from 'react';
import api from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';

export default function CreatorNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [filter, setFilter] = useState('all'); // all, unread, guest_orders

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications');
      let allNotifications = response.data.data || response.data || [];
      
      // Apply filters
      let filteredNotifications = allNotifications;
      if (filter === 'unread') {
        filteredNotifications = allNotifications.filter(n => !n.is_read);
      } else if (filter === 'guest_orders') {
        filteredNotifications = allNotifications.filter(n => n.type === 'guest_order');
      }
      
      setNotifications(filteredNotifications);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Set empty array on error to prevent crashes
      setNotifications([]);
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      alert('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      alert('Failed to mark all notifications as read');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (selectedNotification?.id === notificationId) {
        setSelectedNotification(null);
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      alert('Failed to delete notification');
    }
  };

  const formatNotificationData = (data) => {
    if (!data) return null;
    
    if (data.type === 'guest_order') {
      return {
        guestName: data.guest_name,
        guestEmail: data.guest_email,
        guestPhone: data.guest_phone,
        guestAddress: `${data.guest_address}, ${data.guest_city} ${data.guest_postal_code}`,
        guestNotes: data.guest_notes,
        orderNumber: data.order_number,
        orderId: data.order_id,
        items: data.items,
        total: data.total
      };
    }
    return data;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Notifications</h1>
        <div className="flex gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="all">All Notifications</option>
            <option value="unread">Unread Only</option>
            <option value="guest_orders">Guest Orders</option>
          </select>
          <button
            onClick={markAllAsRead}
            className="btn-secondary"
          >
            Mark All as Read
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Notifications List */}
        <div className="md:col-span-1 space-y-4">
          {notifications.length === 0 ? (
            <div className="card p-6 text-center">
              <div className="text-6xl mb-4">🔔</div>
              <h3 className="text-xl font-semibold mb-2">No notifications</h3>
              <p className="text-gray-600">
                {filter === 'unread' ? 'No unread notifications' : 
                 filter === 'guest_orders' ? 'No guest orders yet' : 
                 'You have no notifications'}
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => {
                  setSelectedNotification(notification);
                  if (!notification.is_read) {
                    markAsRead(notification.id);
                  }
                }}
                className={`card p-4 cursor-pointer transition-all hover:shadow-lg ${
                  !notification.is_read ? 'bg-blue-50 border-blue-200' : ''
                } ${selectedNotification?.id === notification.id ? 'ring-2 ring-pink-500' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-sm flex-1">{notification.title}</h3>
                  {!notification.is_read && (
                    <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">New</span>
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{notification.message}</p>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{formatDate(notification.created_at)}</span>
                  <span className="capitalize bg-gray-100 px-2 py-1 rounded">
                    {notification.type.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Notification Details */}
        <div className="md:col-span-2">
          {selectedNotification ? (
            <div className="card p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{selectedNotification.title}</h2>
                  <p className="text-gray-600">{formatDate(selectedNotification.created_at)}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => deleteNotification(selectedNotification.id)}
                    className="text-red-600 hover:text-red-700 font-semibold"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-lg mb-4">{selectedNotification.message}</p>
                
                {selectedNotification.type === 'guest_order' && selectedNotification.data && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-green-800 mb-4">🎂 Guest Order Details</h3>
                    
                    {(() => {
                      const orderData = formatNotificationData(selectedNotification.data);
                      if (!orderData) return null;
                      
                      return (
                        <div className="space-y-4">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-semibold text-green-700 mb-2">Customer Information</h4>
                              <div className="space-y-2 text-sm">
                                <p><strong>Name:</strong> {orderData.guestName}</p>
                                <p><strong>Email:</strong> 
                                  <a href={`mailto:${orderData.guestEmail}`} className="text-pink-600 hover:underline ml-1">
                                    {orderData.guestEmail}
                                  </a>
                                </p>
                                <p><strong>Phone:</strong> 
                                  <a href={`tel:${orderData.guestPhone}`} className="text-pink-600 hover:underline ml-1">
                                    {orderData.guestPhone}
                                  </a>
                                </p>
                                <p><strong>Address:</strong> {orderData.guestAddress}</p>
                                {orderData.guestNotes && (
                                  <p><strong>Notes:</strong> {orderData.guestNotes}</p>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold text-green-700 mb-2">Order Information</h4>
                              <div className="space-y-2 text-sm">
                                <p><strong>Order Number:</strong> {orderData.orderNumber}</p>
                                <p><strong>Total Amount:</strong> <span className="text-pink-600 font-bold">${orderData.total}</span></p>
                              </div>
                            </div>
                          </div>
                          
                          {orderData.items && orderData.items.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-green-700 mb-2">Ordered Items</h4>
                              <div className="space-y-2">
                                {orderData.items.map((item, index) => (
                                  <div key={index} className="bg-white p-3 rounded border border-green-200">
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <p className="font-medium">{item.product_name}</p>
                                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                      </div>
                                      <p className="font-bold text-pink-600">${item.total}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                            <p className="text-sm text-yellow-800">
                              <strong>Next Steps:</strong> Contact the customer to arrange payment and delivery details.
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card p-12 text-center">
              <div className="text-6xl mb-4">📬</div>
              <h3 className="text-xl font-semibold mb-2">Select a notification</h3>
              <p className="text-gray-600">Choose a notification from the list to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
