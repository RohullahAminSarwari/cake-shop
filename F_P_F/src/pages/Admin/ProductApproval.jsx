import { useEffect, useState } from 'react';
import api from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';

export default function ProductApproval() {
  const { user } = useAuth();
  const [pendingProducts, setPendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchPendingProducts();
  }, []);

  const fetchPendingProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/pending-products');
      // Handle paginated response
      const data = response.data?.data?.data || response.data?.data || [];
      setPendingProducts(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const handleApprove = async (productId) => {
    try {
      setProcessingId(productId);
      const response = await api.put(`/admin/products/${productId}/approve`);
      
      if (response.data.success) {
        setPendingProducts(pendingProducts.filter(p => p.id !== productId));
        alert('Product approved successfully!');
      }
    } catch (error) {
      alert('Error approving product: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (productId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      setProcessingId(productId);
      const response = await api.put(`/admin/products/${productId}/reject`, { reason });
      
      if (response.data.success) {
        setPendingProducts(pendingProducts.filter(p => p.id !== productId));
        alert('Product rejected successfully!');
      }
    } catch (error) {
      alert('Error rejecting product: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-2 border-cream-300 border-t-terra-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-bark-950">Product Approval</h1>
        <p className="text-bark-500 text-sm mt-1">Review and approve products submitted by users</p>
      </div>

      {pendingProducts.length === 0 ? (
        <div className="text-center py-16 card fade-in">
          <div className="text-8xl mb-6">✅</div>
          <h3 className="text-3xl font-bold mb-3 gradient-text">No Pending Products</h3>
          <p className="text-gray-600 text-xl">All products have been reviewed.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingProducts.map((product, index) => (
            <div key={product.id} className="card p-8 hover:scale-102 transition-all duration-300 fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <h3 className="text-2xl font-bold text-gray-800">{product.name}</h3>
                    <span className="badge badge-warning">
                      Pending
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-6 line-clamp-3 text-lg">{product.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl">
                      <p className="text-sm text-gray-500">Price</p>
                      <p className="font-bold text-xl gradient-text">${product.price}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-xl">
                      <p className="text-sm text-gray-500">Stock</p>
                      <p className="font-bold text-xl text-blue-600">{product.stock}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl">
                      <p className="text-sm text-gray-500">Category</p>
                      <p className="font-bold text-xl text-green-600">{product.category?.name || 'N/A'}</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-4 rounded-xl">
                      <p className="text-sm text-gray-500">Submitted by</p>
                      <p className="font-bold text-xl text-orange-600">{product.user?.name || 'Unknown'}</p>
                    </div>
                  </div>

                  {product.discount_price && (
                    <div className="mb-4 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl">
                      <span className="text-sm text-gray-500">Discount Price: </span>
                      <span className="font-bold text-green-600 text-xl">${product.discount_price}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 ml-6">
                  <button
                    onClick={() => handleApprove(product.id)}
                    disabled={processingId === product.id}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg font-semibold"
                  >
                    {processingId === product.id ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleReject(product.id)}
                    disabled={processingId === product.id}
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg font-semibold"
                  >
                    {processingId === product.id ? 'Processing...' : 'Reject'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
