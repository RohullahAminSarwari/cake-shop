import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../config/api';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch featured products - you'll need to add this endpoint to your backend
    // For now, using placeholder
    fetchFeaturedProducts();
    fetchCategories();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      // This will need a products endpoint in your backend
      // const response = await api.get('/products?featured=true&limit=6');
      // setFeaturedProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      const categoriesData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      // Show only first 4 categories on home page
      setCategories(categoriesData.slice(0, 4));
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-rose-500 opacity-90"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="fade-in">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white leading-tight">
                Sweet Dreams
                <span className="block text-yellow-300">Made Real</span>
              </h1>
              <p className="text-xl mb-8 text-white/90 leading-relaxed">
                Discover our handcrafted cakes, pastries, and desserts made with love and the finest ingredients.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/products" className="btn-primary bg-white text-purple-600 hover:bg-yellow-50 text-center shadow-xl">
                  Shop Now
                </Link>
                <Link to="/categories" className="btn-secondary bg-purple-700 hover:bg-purple-800 text-white text-center border-2 border-white/30">
                  Browse Categories
                </Link>
              </div>
            </div>
            <div className="hidden md:block fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-3xl transform rotate-6 backdrop-blur-sm"></div>
                <div className="relative glass p-8 shadow-2xl rounded-3xl">
                  <div className="text-9xl text-center transform hover:scale-110 transition-transform duration-500">🎂</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card text-center group hover:scale-105 transition-transform duration-300">
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">🚚</div>
              <h3 className="text-2xl font-bold mb-3 gradient-text">Fast Delivery</h3>
              <p className="text-gray-600">Fresh cakes delivered to your doorstep</p>
            </div>
            <div className="card text-center group hover:scale-105 transition-transform duration-300">
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">✨</div>
              <h3 className="text-2xl font-bold mb-3 gradient-text">Premium Quality</h3>
              <p className="text-gray-600">Made with finest ingredients and care</p>
            </div>
            <div className="card text-center group hover:scale-105 transition-transform duration-300">
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">🎨</div>
              <h3 className="text-2xl font-bold mb-3 gradient-text">Custom Designs</h3>
              <p className="text-gray-600">Personalized cakes for special occasions</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Preview Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 fade-in">
            <h2 className="text-5xl font-bold mb-4 gradient-text">Popular Categories</h2>
            <p className="text-gray-600 text-xl">Explore our delicious collections</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                to={`/products?category=${category.id}`}
                className="card p-6 text-center group hover:scale-105 transition-all duration-300 fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {category.icon || '🎂'}
                </div>
                <h3 className="font-bold text-xl mb-2 group-hover:text-purple-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-gray-600">Delicious treats</p>
              </Link>
            ))}
          </div>
          
          <div className="text-center fade-in">
            <Link 
              to="/categories" 
              className="btn-primary inline-flex items-center shadow-xl hover:shadow-2xl"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              View All Categories
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 fade-in">
            <h2 className="text-5xl font-bold mb-4 gradient-text">Featured Products</h2>
            <p className="text-gray-600 text-xl">Handpicked favorites from our collection</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="spinner mx-auto"></div>
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product, index) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="card overflow-hidden group hover:scale-105 transition-all duration-300 fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="relative h-64 bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden">
                    {product.images?.[0] ? (
                      <img
                        src={typeof product.images[0] === 'string' ? product.images[0] : product.images[0]?.url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-7xl">
                        🎂
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-xl mb-2 group-hover:text-purple-600 transition-colors">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-bold gradient-text">
                        ${product.discount_price || product.price}
                      </span>
                      {product.discount_price && (
                        <span className="text-gray-400 line-through text-lg">${product.price}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 card">
              <div className="text-6xl mb-4">🎂</div>
              <p className="text-gray-500 text-lg">No products available yet. Check back soon!</p>
            </div>
          )}

          <div className="text-center mt-12 fade-in">
            <Link to="/products" className="btn-primary shadow-xl hover:shadow-2xl">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-purple-600 via-pink-500 to-rose-500 text-white relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center fade-in">
          <h2 className="text-5xl font-bold mb-6">Ready to Order?</h2>
          <p className="text-2xl mb-10 text-white/90">
            Create something sweet for your special day
          </p>
          <Link to="/products" className="btn-primary bg-white text-purple-600 hover:bg-yellow-50 shadow-xl hover:shadow-2xl">
            Start Shopping
          </Link>
        </div>
      </section>
    </div>
  );
}