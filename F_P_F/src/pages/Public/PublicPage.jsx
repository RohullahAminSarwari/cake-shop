import { useState, useEffect } from 'react';
import api from '../../config/api';

const PublicPage = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await api.get('/public/content');
      setContent(response.data);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading content...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-gray-800">Cake Shop</h1>
          <p className="text-gray-600">Welcome to our online store</p>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex space-x-6 py-4">
            <a href="/" className="text-blue-600 hover:text-blue-800 font-medium">
              Home
            </a>
            <a href="/login" className="text-gray-600 hover:text-gray-800">
              Login
            </a>
            <a href="/register" className="text-gray-600 hover:text-gray-800">
              Register
            </a>
          </div>
        </div>
      </nav>

      {/* Content Grid */}
      <main className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Our Products</h2>
        
        {content.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No content available yet.</p>
            <p className="text-gray-400 mt-2">Check back later for updates!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {item.image && (
                  <div className="h-64 bg-gray-200 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title || 'Product'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                      }}
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2 text-gray-800">
                    {item.title || 'Untitled'}
                  </h3>
                  {item.description && (
                    <p className="text-gray-600 mb-2 line-clamp-3">
                      {item.description}
                    </p>
                  )}
                  {item.price && (
                    <p className="text-lg font-bold text-blue-600">
                      ${item.price}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-12">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center">&copy; 2024 Cake Shop. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicPage;

