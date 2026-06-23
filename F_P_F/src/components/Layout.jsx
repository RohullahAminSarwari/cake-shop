import NavBar from './NavBar';
import { Link } from 'react-router-dom';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <NavBar />
      <main className="flex-1">{children}</main>
      <footer className="bg-white border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 bg-brand-600 rounded-xl flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <span className="text-lg font-bold text-stone-900">Sweet Dreams</span>
              </div>
              <p className="text-sm text-stone-500 leading-relaxed">
                Handcrafted cakes and pastries made with love and the finest ingredients.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-stone-900 mb-3">Shop</h4>
              <div className="space-y-2">
                <Link to="/products" className="block text-sm text-stone-500 hover:text-stone-900 transition-colors">All Products</Link>
                <Link to="/categories" className="block text-sm text-stone-500 hover:text-stone-900 transition-colors">Categories</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-stone-900 mb-3">Account</h4>
              <div className="space-y-2">
                <Link to="/login" className="block text-sm text-stone-500 hover:text-stone-900 transition-colors">Sign in</Link>
                <Link to="/orders" className="block text-sm text-stone-500 hover:text-stone-900 transition-colors">Orders</Link>
                <Link to="/cart" className="block text-sm text-stone-500 hover:text-stone-900 transition-colors">Cart</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-stone-900 mb-3">Sellers</h4>
              <div className="space-y-2">
                <Link to="/dashboard" className="block text-sm text-stone-500 hover:text-stone-900 transition-colors">Dashboard</Link>
                <Link to="/add-product" className="block text-sm text-stone-500 hover:text-stone-900 transition-colors">Add Product</Link>
              </div>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-stone-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-stone-400">&copy; {new Date().getFullYear()} Sweet Dreams Bakery. All rights reserved.</p>
            <div className="flex gap-6">
              <span className="text-xs text-stone-400 hover:text-stone-600 cursor-pointer transition-colors">Privacy</span>
              <span className="text-xs text-stone-400 hover:text-stone-600 cursor-pointer transition-colors">Terms</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
