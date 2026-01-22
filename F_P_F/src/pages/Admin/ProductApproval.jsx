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
      console.error('Error fetching pending products:', error);
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
      console.error('Error approving product:', error);
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
      console.error('Error rejecting product:', error);
      alert('Error rejecting product: ' + (error.response?.data?.message || 'Unknown error'));
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
          <p className="mt-4 text-gray-600">Loading pending products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Product Approval</h1>
        <p className="text-gray-600">Review and approve products submitted by users</p>
      </div>

      {pendingProducts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-2xl font-bold mb-2">No Pending Products</h3>
          <p className="text-gray-600">All products have been reviewed.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <h3 className="text-xl font-bold text-gray-800">{product.name}</h3>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">
                      Pending
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">{product.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Price</p>
                      <p className="font-semibold">${product.price}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Stock</p>
                      <p className="font-semibold">{product.stock}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Category</p>
                      <p className="font-semibold">{product.category?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Submitted by</p>
                      <p className="font-semibold">{product.user?.name || 'Unknown'}</p>
                    </div>
                  </div>

                  {product.discount_price && (
                    <div className="mb-4">
                      <span className="text-sm text-gray-500">Discount Price: </span>
                      <span className="font-semibold text-green-600">${product.discount_price}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => handleApprove(product.id)}
                    disabled={processingId === product.id}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {processingId === product.id ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleReject(product.id)}
                    disabled={processingId === product.id}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
