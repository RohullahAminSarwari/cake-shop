import NavBar from './NavBar';
import { Link } from 'react-router-dom';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-cream-100">
      <NavBar />
      <main className="flex-1">{children}</main>
      <footer className="bg-cream-200/60 border-t border-cream-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <span className="text-lg font-display text-terra-800 italic">The Modern Patisserie</span>
              <p className="text-sm text-bark-500 leading-relaxed mt-3">
                Elevating the art of baking through technology and passion. Connecting you with the finest artisans worldwide.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-bark-900 mb-3">Marketplace</h4>
              <div className="space-y-2">
                <Link to="/products" className="block text-sm text-bark-500 hover:text-terra-700 transition-colors">All Pastries</Link>
                <Link to="/categories" className="block text-sm text-bark-500 hover:text-terra-700 transition-colors">Collections</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-bark-900 mb-3">For Bakers</h4>
              <div className="space-y-2">
                <Link to="/login" className="block text-sm text-bark-500 hover:text-terra-700 transition-colors">Become a Vendor</Link>
                <Link to="/dashboard" className="block text-sm text-bark-500 hover:text-terra-700 transition-colors">Seller Dashboard</Link>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-bark-900 mb-3">Support</h4>
              <div className="space-y-2">
                <Link to="/orders" className="block text-sm text-bark-500 hover:text-terra-700 transition-colors">Order Tracking</Link>
                <Link to="/cart" className="block text-sm text-bark-500 hover:text-terra-700 transition-colors">My Cart</Link>
              </div>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-cream-300 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-bark-400">&copy; {new Date().getFullYear()} The Modern Patisserie. All rights reserved.</p>
            <div className="flex gap-6">
              <span className="text-xs text-bark-400 hover:text-bark-600 cursor-pointer transition-colors">Privacy Policy</span>
              <span className="text-xs text-bark-400 hover:text-bark-600 cursor-pointer transition-colors">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
