import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // State for creating new order
  const [orderData, setOrderData] = useState({
    user_id: '',
    shipping_name: '',
    shipping_email: '',
    shipping_phone: '',
    shipping_address: '',
    shipping_city: '',
    shipping_postal_code: '',
    shipping_country: '',
    payment_method: 'cash_on_delivery',
    status: 'pending',
    items: [],
  });
  
  // State for order items
  const [orderItem, setOrderItem] = useState({
    product_id: '',
    quantity: 1,
    price: '',
  });
  
  // State for users and products
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);
  
  // Fetch users and products for the create form
  useEffect(() => {
    if (showCreateForm) {
      fetchUsers();
      fetchProducts();
    }
  }, [showCreateForm]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const response = await api.get('/admin/orders', { params });
      // Handle different response formats
      const ordersData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setOrders(ordersData);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };
  
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await api.get('/admin/users');
      const usersData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setUsers(usersData);
    } catch (error) {
    } finally {
      setUsersLoading(false);
    }
  };
  
  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await api.get('/products');
      const productsData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setProducts(productsData);
    } catch (error) {
    } finally {
      setProductsLoading(false);
    }
  };
  
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}`, { status: newStatus });
      fetchOrders();
    } catch (error) {
      alert('Failed to update order status');
    }
  };
  
  const handleOrderSubmit = async (e) => {
    e.preventDefault();
      
    try {
      // Validate required fields
      if (orderData.items.length === 0) {
        alert('Please add at least one item to the order');
        return;
      }
        
      // Calculate total price
      const totalPrice = orderData.items.reduce((sum, item) => sum + (parseFloat(item.price) * parseInt(item.quantity)), 0);
        
      const orderPayload = {
        ...orderData,
        total_price: totalPrice,
      };
        
      // Submit as multipart form data to handle various field types
      const formData = new FormData();
        
      // Add scalar values
      Object.keys(orderPayload).forEach(key => {
        if (key !== 'items') {
          formData.append(key, orderPayload[key]);
        }
      });
        
      // Add items as JSON string since complex nested objects need special handling
      formData.append('items', JSON.stringify(orderPayload.items));
        
      await api.post('/admin/orders', formData);
      alert('Order created successfully!');
        
      // Reset form
      setOrderData({
        user_id: '',
        shipping_name: '',
        shipping_email: '',
        shipping_phone: '',
        shipping_address: '',
        shipping_city: '',
        shipping_postal_code: '',
        shipping_country: '',
        payment_method: 'cash_on_delivery',
        status: 'pending',
        items: [],
      });
      setShowCreateForm(false);
      fetchOrders(); // Refresh the orders list
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to create order';
      alert(`Error: ${errorMessage}`);
    }
  };
    
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderData({
      ...orderData,
      [name]: value,
    });
  };
    
  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setOrderItem({
      ...orderItem,
      [name]: value,
    });
      
    // If product is selected, auto-populate price
    if (name === 'product_id' && value) {
      const product = products.find(p => p.id == value);
      if (product) {
        setOrderItem(prev => ({
          ...prev,
          price: product.discount_price || product.price,
        }));
      }
    }
  };
    
  const handleAddItem = () => {
    if (!orderItem.product_id || !orderItem.quantity || !orderItem.price) {
      alert('Please fill in all item fields');
      return;
    }
      
    // Check if item already exists in the order
    const existingItemIndex = orderData.items.findIndex(
      item => item.product_id == orderItem.product_id
    );
      
    if (existingItemIndex >= 0) {
      // Update quantity if item already exists
      const updatedItems = [...orderData.items];
      updatedItems[existingItemIndex].quantity = parseInt(updatedItems[existingItemIndex].quantity) + parseInt(orderItem.quantity);
      setOrderData({
        ...orderData,
        items: updatedItems,
      });
    } else {
      // Add new item
      setOrderData({
        ...orderData,
        items: [...orderData.items, { ...orderItem }],
      });
    }
      
    // Reset item form
    setOrderItem({
      product_id: '',
      quantity: 1,
      price: '',
    });
  };
    
  const handleRemoveItem = (index) => {
    const updatedItems = orderData.items.filter((_, i) => i !== index);
    setOrderData({
      ...orderData,
      items: updatedItems,
    });
  };
  


  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter(order => order.status?.toLowerCase() === statusFilter.toLowerCase());

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl text-bark-950">Orders</h1>
          <p className="text-bark-500 text-sm mt-1">Manage and track customer orders</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn-primary"
          >
            {showCreateForm ? 'Cancel' : '+ Create Order'}
          </button>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field md:w-48"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      
      {/* Create Order Form */}
      {showCreateForm && (
        <div className="card p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Create New Order</h2>
          
          <form onSubmit={handleOrderSubmit} className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
              
              <div className="mb-4">
                <label className="block font-semibold mb-2">User (Optional)</label>
                {usersLoading ? (
                  <div className="text-gray-500">Loading...</div>
                ) : (
                  <select
                    name="user_id"
                    value={orderData.user_id}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="">Select a user (optional)</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block font-semibold mb-2">Full Name *</label>
                <input
                  type="text"
                  name="shipping_name"
                  value={orderData.shipping_name}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                />
              </div>
              
              <div className="mb-4">
                <label className="block font-semibold mb-2">Email *</label>
                <input
                  type="email"
                  name="shipping_email"
                  value={orderData.shipping_email}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                />
              </div>
              
              <div className="mb-4">
                <label className="block font-semibold mb-2">Phone *</label>
                <input
                  type="tel"
                  name="shipping_phone"
                  value={orderData.shipping_phone}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Shipping Information</h3>
              
              <div className="mb-4">
                <label className="block font-semibold mb-2">Address *</label>
                <input
                  type="text"
                  name="shipping_address"
                  value={orderData.shipping_address}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block font-semibold mb-2">City *</label>
                  <input
                    type="text"
                    name="shipping_city"
                    value={orderData.shipping_city}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                  />
                </div>
                
                <div>
                  <label className="block font-semibold mb-2">Postal Code *</label>
                  <input
                    type="text"
                    name="shipping_postal_code"
                    value={orderData.shipping_postal_code}
                    onChange={handleInputChange}
                    required
                    className="input-field"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block font-semibold mb-2">Country *</label>
                <input
                  type="text"
                  name="shipping_country"
                  value={orderData.shipping_country}
                  onChange={handleInputChange}
                  required
                  className="input-field"
                />
              </div>
              
              <div className="mb-4">
                <label className="block font-semibold mb-2">Status</label>
                <select
                  name="status"
                  value={orderData.status}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block font-semibold mb-2">Payment Method</label>
                <select
                  name="payment_method"
                  value={orderData.payment_method}
                  onChange={handleInputChange}
                  className="input-field"
                >
                  <option value="cash_on_delivery">Cash on Delivery</option>
                  <option value="card">Credit/Debit Card</option>
                </select>
              </div>
            </div>
            
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold mb-4">Order Items</h3>
              
              <div className="grid md:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block font-semibold mb-2">Product *</label>
                  {productsLoading ? (
                    <div className="text-gray-500">Loading...</div>
                  ) : (
                    <select
                      name="product_id"
                      value={orderItem.product_id}
                      onChange={handleItemChange}
                      className="input-field"
                    >
                      <option value="">Select a product</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} - ${product.discount_price || product.price}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                
                <div>
                  <label className="block font-semibold mb-2">Quantity *</label>
                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    value={orderItem.quantity}
                    onChange={handleItemChange}
                    className="input-field"
                  />
                </div>
                
                <div>
                  <label className="block font-semibold mb-2">Price *</label>
                  <input
                    type="number"
                    name="price"
                    step="0.01"
                    min="0"
                    value={orderItem.price}
                    onChange={handleItemChange}
                    className="input-field"
                  />
                </div>
                
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="btn-primary w-full"
                  >
                    Add Item
                  </button>
                </div>
              </div>
              
              {/* Selected Items List */}
              {orderData.items.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-2">Added Items:</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="py-2 px-4 text-left">Product</th>
                          <th className="py-2 px-4 text-left">Price</th>
                          <th className="py-2 px-4 text-left">Qty</th>
                          <th className="py-2 px-4 text-left">Total</th>
                          <th className="py-2 px-4 text-left">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderData.items.map((item, index) => {
                          const product = products.find(p => p.id == item.product_id);
                          const itemTotal = parseFloat(item.price) * parseInt(item.quantity);
                          return (
                            <tr key={index} className="border-b">
                              <td className="py-2 px-4">{product ? product.name : `Product ID: ${item.product_id}`}</td>
                              <td className="py-2 px-4">${parseFloat(item.price).toFixed(2)}</td>
                              <td className="py-2 px-4">{item.quantity}</td>
                              <td className="py-2 px-4 font-semibold">${itemTotal.toFixed(2)}</td>
                              <td className="py-2 px-4">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(index)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                        <tr>
                          <td colSpan="3" className="py-2 px-4 text-right font-semibold">Order Total:</td>
                          <td className="py-2 px-4 font-semibold">
                            ${orderData.items.reduce((sum, item) => sum + (parseFloat(item.price) * parseInt(item.quantity)), 0).toFixed(2)}
                          </td>
                          <td className="py-2 px-4"></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Create Order
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold">Order #</th>
                  <th className="text-left py-4 px-6 font-semibold">Customer</th>
                  <th className="text-left py-4 px-6 font-semibold">Items</th>
                  <th className="text-left py-4 px-6 font-semibold">Total</th>
                  <th className="text-left py-4 px-6 font-semibold">Status</th>
                  <th className="text-left py-4 px-6 font-semibold">Date</th>
                  <th className="text-left py-4 px-6 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-gray-600">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <Link to={`/admin/orders/${order.id}`} className="text-pink-600 hover:text-pink-700 font-semibold">
                          #{order.order_number}
                        </Link>
                      </td>
                      <td className="py-4 px-6">{order.user?.name || 'N/A'}</td>
                      <td className="py-4 px-6">{order.items?.length || 0} item(s)</td>
                      <td className="py-4 px-6 font-semibold">${order.total_price}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          className="text-sm border rounded px-2 py-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

