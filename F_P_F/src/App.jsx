import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Products from './pages/Products';
import Categories from './pages/Categories';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Auth/Login';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import GuestCheckout from './pages/GuestCheckout';
import OrderConfirmation from './pages/OrderConfirmation';
import Orders from './pages/Orders';
import CreatorNotifications from './pages/Creator/Notifications';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminProducts from './pages/Admin/Products';
import AdminCategories from './pages/Admin/Categories';
import AdminOrders from './pages/Admin/Orders';
import AdminUsers from './pages/Admin/Users';
import ProductApproval from './pages/Admin/ProductApproval';
import AddProduct from './pages/User/AddProduct';
import AddCategory from './pages/User/AddCategory';
import MyProducts from './pages/User/MyProducts';
import EditProduct from './pages/User/EditProduct';
import UserDashboard from './pages/User/Dashboard';
import DashboardTest from './pages/User/DashboardTest';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Layout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        
        {/* Public Cart Routes - accessible to both guests and authenticated users */}
        <Route path="/cart" element={<Cart />} />
        <Route path="/guest-checkout" element={<GuestCheckout />} />
        <Route path="/order-confirmation" element={<OrderConfirmation />} />

        {/* Protected Customer Routes */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/creator/notifications"
          element={
            <ProtectedRoute>
              <CreatorNotifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-product"
          element={
            <ProtectedRoute>
              <AddProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-category"
          element={
            <ProtectedRoute>
              <AddCategory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-products"
          element={
            <ProtectedRoute>
              <MyProducts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-product/:id"
          element={
            <ProtectedRoute>
              <EditProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard-test"
          element={
            <ProtectedRoute>
              <DashboardTest />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute adminOnly>
              <AdminProducts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute adminOnly>
              <AdminCategories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute adminOnly>
              <AdminOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute adminOnly>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/product-approval"
          element={
            <ProtectedRoute adminOnly>
              <ProductApproval />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Layout>
  );
}

export default App;
