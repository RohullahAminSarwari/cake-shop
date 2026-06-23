import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../config/api';

const FEATURES = [
  { icon: '🚚', title: 'Fast Delivery', desc: 'Fresh cakes delivered to your doorstep within hours' },
  { icon: '✨', title: 'Premium Quality', desc: 'Made with the finest ingredients sourced locally' },
  { icon: '🎨', title: 'Custom Designs', desc: 'Personalized cakes crafted for your occasion' },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/products').then(r => {
        const d = Array.isArray(r.data) ? r.data : (r.data?.data || []);
        setProducts(d.slice(0, 8));
      }).catch(() => {}),
      api.get('/categories').then(r => {
        const d = Array.isArray(r.data) ? r.data : (r.data?.data || []);
        setCategories(d.slice(0, 6));
      }).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-stone-900">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-900/20 to-warm-500/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-36">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-stone-300 font-medium">Fresh baked daily</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-[1.1]">
              Sweet Dreams
              <span className="block text-brand-400">Made Real</span>
            </h1>
            <p className="mt-6 text-lg text-stone-400 leading-relaxed max-w-lg">
              Discover our handcrafted cakes, pastries, and desserts — made with love and the finest ingredients for every occasion.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/products" className="btn-primary bg-white text-stone-900 hover:bg-stone-100 px-8 py-4 text-base">
                Shop Now
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link to="/categories" className="btn-secondary border-stone-700 text-stone-300 hover:bg-stone-800 hover:text-white px-8 py-4 text-base">
                Browse Categories
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 stagger-children">
            {FEATURES.map(({ icon, title, desc }) => (
              <div key={title} className="flex gap-4 p-6 rounded-2xl hover:bg-stone-50 transition-colors">
                <div className="text-3xl shrink-0">{icon}</div>
                <div>
                  <h3 className="font-semibold text-stone-900 mb-1">{title}</h3>
                  <p className="text-sm text-stone-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-20 bg-stone-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="section-title">Shop by Category</h2>
                <p className="section-subtitle">Find exactly what you're craving</p>
              </div>
              <Link to="/categories" className="hidden sm:flex btn-ghost text-sm text-brand-600 hover:text-brand-700">
                View all
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 stagger-children">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/products?category=${cat.id}`}
                  className="card-hover group p-6 text-center"
                >
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                    {cat.icon || '🎂'}
                  </div>
                  <h3 className="font-semibold text-sm text-stone-900 group-hover:text-brand-600 transition-colors">
                    {cat.name}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="section-title">Featured Products</h2>
              <p className="section-subtitle">Handpicked favorites from our collection</p>
            </div>
            <Link to="/products" className="hidden sm:flex btn-ghost text-sm text-brand-600 hover:text-brand-700">
              View all
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-stone-200 border-t-brand-600 rounded-full animate-spin" />
            </div>
          ) : products.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
              {products.map((product) => (
                <Link key={product.id} to={`/products/${product.id}`} className="card-hover group overflow-hidden">
                  <div className="aspect-square bg-stone-100 overflow-hidden">
                    {product.images?.[0] ? (
                      <img
                        src={typeof product.images[0] === 'string' ? product.images[0] : product.images[0]?.url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-stone-50 to-stone-100">
                        🎂
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-stone-900 mb-1 group-hover:text-brand-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-stone-500 line-clamp-2 mb-3">{product.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-stone-900">
                        ${product.discount_price || product.price}
                      </span>
                      {product.discount_price && (
                        <span className="text-sm text-stone-400 line-through">${product.price}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 card p-12">
              <div className="text-5xl mb-4">🎂</div>
              <p className="text-stone-500">No products available yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-stone-900 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to order?</h2>
          <p className="text-stone-400 text-lg mb-8 max-w-xl mx-auto">
            Create something sweet for your special day. Browse our collection or design your own.
          </p>
          <Link to="/products" className="btn-primary bg-white text-stone-900 hover:bg-stone-100 px-8 py-4 text-base">
            Start Shopping
          </Link>
        </div>
      </section>
    </div>
  );
}
