import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import guestCartService from '../services/guestCartService';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const r = await api.get(`/products/${id}`);
        setProduct(r.data?.data || r.data || null);
      } catch { setProduct(null); }
      finally { setLoading(false); }
    })();
  }, [id]);

  const addToCart = async () => {
    if (!product || (product.stock !== undefined && product.stock === 0)) return;
    try {
      setAddingToCart(true);
      if (isAuthenticated) await api.post('/cart/add', { product_id: id, quantity });
      else { guestCartService.addItem(product, quantity); window.dispatchEvent(new CustomEvent('cartUpdated')); }
      alert('Added to cart!');
    } catch (err) { alert('Failed: ' + (err.response?.data?.message || err.message)); }
    finally { setAddingToCart(false); }
  };

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex justify-center">
      <div className="w-8 h-8 border-2 border-cream-300 border-t-terra-600 rounded-full animate-spin" />
    </div>
  );

  if (!product) return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
      <div className="card p-12 max-w-md mx-auto">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="font-display text-2xl text-bark-900 mb-2">Product not found</h2>
        <p className="text-sm text-bark-500 mb-6">This product may have been removed.</p>
        <button onClick={() => navigate('/products')} className="btn-primary">Back to Products</button>
      </div>
    </div>
  );

  const images = product.images || [];
  const hasDiscount = !!product.discount_price;
  const discountPct = hasDiscount ? Math.round(((product.price - product.discount_price) / product.price) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-bark-500 mb-8">
        <Link to="/" className="hover:text-terra-700 transition-colors">Marketplace</Link>
        <span className="text-bark-300">›</span>
        {product.category && (
          <>
            <Link to={`/products?category=${product.category.id}`} className="hover:text-terra-700 transition-colors">{product.category.name}</Link>
            <span className="text-bark-300">›</span>
          </>
        )}
        <span className="text-bark-800 font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Images */}
        <div>
          <div className="relative aspect-square bg-cream-100 rounded-2xl overflow-hidden mb-4">
            {product.approval_status === 'approved' && (
              <span className="absolute top-4 left-4 z-10 bg-terra-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-md">Bestseller</span>
            )}
            {images[selectedImage] ? (
              <img src={typeof images[selectedImage] === 'string' ? images[selectedImage] : images[selectedImage]?.url}
                alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl bg-gradient-to-br from-cream-100 to-cream-200">🎂</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${selectedImage === i ? 'border-terra-600 ring-2 ring-terra-500/20' : 'border-cream-300 hover:border-bark-300'}`}>
                  <img src={typeof img === 'string' ? img : img?.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 className="font-display text-3xl lg:text-4xl text-bark-950 mb-4">{product.name}</h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="font-display text-3xl text-terra-700">${product.discount_price || product.price}</span>
            {hasDiscount && (
              <>
                <span className="text-lg text-bark-400 line-through">${product.price}</span>
                <span className="badge bg-terra-50 text-terra-700">{discountPct}% off</span>
              </>
            )}
          </div>

          {/* Description */}
          <p className="text-bark-600 leading-relaxed mb-6">{product.description}</p>

          {/* Tags */}
          {product.category && (
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="badge bg-cream-200 text-bark-700">{product.category.name}</span>
            </div>
          )}

          {/* Quantity & Cart */}
          <div className="card p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <span className="text-sm font-medium text-bark-700">Quantity</span>
              <div className="inline-flex items-center border border-cream-300 rounded-xl overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-bark-600 hover:bg-cream-100 transition-colors text-lg">−</button>
                <span className="w-12 text-center font-semibold text-bark-900 border-x border-cream-300">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center text-bark-600 hover:bg-cream-100 transition-colors text-lg">+</button>
              </div>
            </div>

            <button onClick={addToCart} disabled={addingToCart || (product.stock !== undefined && product.stock === 0)}
              className="btn-primary w-full py-4 text-base">
              {addingToCart ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Adding...
                </span>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                  Reserve for Pickup
                </>
              )}
            </button>

            <p className="text-xs text-bark-400 mt-3 text-center flex items-center justify-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
              Reservation only. Payment at the boutique during pickup.
            </p>
          </div>

          {/* Stock */}
          {product.stock !== undefined && (
            <div className="flex items-center gap-2 mb-4">
              <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-700' : 'text-red-700'}`}>
                {product.stock > 0 ? `In stock (${product.stock} available)` : 'Out of stock'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
