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
    const fetch = async () => {
      try {
        setLoading(true);
        const r = await api.get(`/products/${id}`);
        setProduct(r.data?.data || r.data || null);
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const addToCart = async () => {
    if (!product) return;
    if (product.stock !== undefined && product.stock === 0) return;

    try {
      setAddingToCart(true);
      if (isAuthenticated) {
        await api.post('/cart/add', { product_id: id, quantity });
      } else {
        guestCartService.addItem(product, quantity);
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      }
      alert('Added to cart!');
    } catch (err) {
      alert('Failed to add to cart: ' + (err.response?.data?.message || err.message));
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex justify-center">
          <div className="w-8 h-8 border-2 border-stone-200 border-t-brand-600 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center card p-12 max-w-md mx-auto">
          <div className="w-14 h-14 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-stone-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-stone-900 mb-2">Product not found</h2>
          <p className="text-sm text-stone-500 mb-6">This product may have been removed.</p>
          <button onClick={() => navigate('/products')} className="btn-primary">Back to Products</button>
        </div>
      </div>
    );
  }

  const images = product.images || [];
  const hasDiscount = !!product.discount_price;
  const discountPct = hasDiscount
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-stone-500 mb-8">
        <Link to="/products" className="hover:text-stone-900 transition-colors">Products</Link>
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <span className="text-stone-900 font-medium truncate">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Images */}
        <div>
          <div className="aspect-square bg-stone-100 rounded-2xl overflow-hidden mb-4">
            {images[selectedImage] ? (
              <img
                src={typeof images[selectedImage] === 'string' ? images[selectedImage] : images[selectedImage]?.url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-8xl bg-gradient-to-br from-stone-50 to-stone-100">
                🎂
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === i ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <img src={typeof img === 'string' ? img : img?.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.category && (
            <Link
              to={`/products?category=${product.category.id}`}
              className="inline-block badge bg-brand-50 text-brand-700 mb-4 hover:bg-brand-100 transition-colors"
            >
              {product.category.name}
            </Link>
          )}

          <h1 className="text-3xl font-bold text-stone-900 mb-4">{product.name}</h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-stone-900">${product.discount_price || product.price}</span>
            {hasDiscount && (
              <>
                <span className="text-lg text-stone-400 line-through">${product.price}</span>
                <span className="badge bg-red-100 text-red-700">{discountPct}% off</span>
              </>
            )}
          </div>

          {/* Description */}
          <div className="card p-6 mb-6">
            <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-2">Description</h3>
            <p className="text-stone-700 leading-relaxed">{product.description}</p>
          </div>

          {/* Stock */}
          {product.stock !== undefined && (
            <div className="flex items-center gap-2 mb-6">
              <span className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={`text-sm font-medium ${product.stock > 0 ? 'text-green-700' : 'text-red-700'}`}>
                {product.stock > 0 ? `In stock (${product.stock} available)` : 'Out of stock'}
              </span>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-8">
            <label className="text-sm font-medium text-stone-700 mb-2 block">Quantity</label>
            <div className="inline-flex items-center border border-stone-300 rounded-xl overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-11 h-11 flex items-center justify-center text-stone-600 hover:bg-stone-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                </svg>
              </button>
              <span className="w-14 text-center font-semibold text-stone-900 border-x border-stone-300">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-11 h-11 flex items-center justify-center text-stone-600 hover:bg-stone-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={addToCart}
              disabled={addingToCart || (product.stock !== undefined && product.stock === 0)}
              className="btn-primary flex-1 py-4 text-base"
            >
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
                  Add to Cart
                </>
              )}
            </button>
            <button className="btn-secondary px-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
