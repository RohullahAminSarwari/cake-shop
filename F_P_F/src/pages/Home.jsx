import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../config/api';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/products').then(r => {
        const d = Array.isArray(r.data) ? r.data : (r.data?.data || []);
        setProducts(d.slice(0, 4));
      }).catch(() => {}),
      api.get('/categories').then(r => {
        const d = Array.isArray(r.data) ? r.data : (r.data?.data || []);
        setCategories(d.slice(0, 3));
      }).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-cream-200/60 min-h-[520px] md:min-h-[600px] flex items-center">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=1400&q=80"
            alt="Hero cake"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-bark-950/70 via-bark-950/40 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="max-w-xl">
            <span className="inline-block bg-terra-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-6">
              New Arrivals
            </span>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl text-white leading-[1.1] mb-6">
              Crafting Moments of Pure Decadence.
            </h1>
            <p className="text-cream-300 text-base md:text-lg leading-relaxed max-w-md mb-8">
              Discover artisan pastries and bespoke cakes from the world's most talented bakers, delivered to your door.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products" className="btn-primary px-8 py-4 text-base">
                Explore Collections
              </Link>
              <Link to="/categories" className="btn-secondary border-cream-400/50 text-white hover:bg-white/10 px-8 py-4 text-base">
                Our Story
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Occasion */}
      {categories.length > 0 && (
        <section className="py-20 bg-cream-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="section-title">Shop by Occasion</h2>
                <p className="section-subtitle">Curated selections for your most meaningful moments</p>
              </div>
              <Link to="/categories" className="hidden sm:flex items-center text-sm font-medium text-terra-700 hover:text-terra-800 transition-colors">
                View All
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
              {categories.map((cat) => (
                <Link key={cat.id} to={`/products?category=${cat.id}`}
                  className="group relative h-64 sm:h-72 rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-bark-700 to-bark-900">
                    <div className="absolute inset-0 flex items-center justify-center text-8xl opacity-20 group-hover:opacity-30 group-hover:scale-110 transition-all duration-500">
                      {cat.icon || '🎂'}
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-bark-950/80 via-transparent to-transparent" />
                  <div className="relative h-full flex flex-col justify-end p-6">
                    <h3 className="font-display text-2xl text-white mb-1">{cat.name}</h3>
                    <p className="text-cream-400 text-sm">
                      {cat.description || `Explore our ${cat.name.toLowerCase()} collection`}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trending Treats */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">Trending Treats</h2>
            <p className="section-subtitle mx-auto">Hand-picked by our editors and loved by our community. These are the flavors defining the season.</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-cream-300 border-t-terra-600 rounded-full animate-spin" />
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
                {products.map((product) => (
                  <Link key={product.id} to={`/products/${product.id}`} className="group">
                    <div className="relative aspect-square bg-cream-100 rounded-2xl overflow-hidden mb-4">
                      {product.images?.[0] ? (
                        <img
                          src={typeof product.images[0] === 'string' ? product.images[0] : product.images[0]?.url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-cream-100 to-cream-200">🎂</div>
                      )}
                      <button className="absolute top-3 right-3 w-9 h-9 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-bark-500 hover:text-terra-600 hover:bg-white transition-all shadow-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                      </button>
                      {product.discount_price && (
                        <span className="absolute top-3 left-3 bg-terra-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">Sale</span>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-bark-400 mb-1">
                        {product.category?.name || 'Artisan'}
                      </p>
                      <h3 className="font-display text-lg text-bark-900 group-hover:text-terra-700 transition-colors mb-1">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-bark-900">${product.discount_price || product.price}</span>
                        {product.discount_price && (
                          <span className="text-sm text-bark-400 line-through">${product.price}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="text-center mt-10">
                <Link to="/products" className="btn-secondary">Show More Treats</Link>
              </div>
            </>
          ) : (
            <div className="text-center py-16 card p-12">
              <div className="text-5xl mb-4">🎂</div>
              <p className="text-bark-500">No products available yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA — Newsletter */}
      <section className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="relative bg-terra-400/90 rounded-3xl overflow-hidden">
            <div className="absolute right-0 top-0 w-1/2 h-full hidden md:block">
              <img
                src="https://images.unsplash.com/photo-1556217477-d325251ece38?w=600&q=80"
                alt="Baking"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-terra-400/90 to-transparent" />
            </div>
            <div className="relative px-8 sm:px-12 py-14 max-w-lg">
              <h2 className="font-display text-3xl text-white mb-3">Join the Connoisseur's Club</h2>
              <p className="text-white/80 text-sm mb-6 leading-relaxed">
                Get early access to seasonal collections, exclusive bakery collabs, and artisan recipes directly in your inbox.
              </p>
              <div className="flex gap-3">
                <input type="email" placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-white/90 rounded-xl text-bark-900 placeholder:text-bark-400 text-sm focus:outline-none focus:ring-2 focus:ring-white" />
                <button className="px-6 py-3 bg-bark-900 text-white font-semibold rounded-xl hover:bg-bark-950 transition-colors text-sm">
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="h-12" />
    </div>
  );
}
