# Cake Shop Frontend

A beautiful and modern React frontend for the Cake Shop Digitalization project.

## Features

### Customer Features
- 🏠 Beautiful homepage with hero section and featured products
- 🎂 Product catalog with search and category filtering
- 📦 Product detail pages with image galleries
- 🛒 Shopping cart with quantity management
- 💳 Checkout page with order summary
- 📋 Order history and tracking
- 🔐 User authentication (Login/Register)

### Admin Features
- 📊 Dashboard with statistics and recent orders
- 🎂 Product management (Create, Read, Update, Delete)
- 📦 Order management with status updates
- 👥 User management
- 🔒 Protected admin routes

## Tech Stack

- **React 18** - UI library
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Vite** - Build tool

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Configure API endpoint:
Create a `.env` file in the root directory:
```
VITE_API_BASE_URL=http://localhost:8000/api
```

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Backend Integration

This frontend is designed to work with the Laravel backend API. Make sure your backend has the following endpoints:

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout (protected)

### Products (Public)
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details

### Cart (Protected)
- `GET /api/cart` - Get cart items
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/items/:id` - Update cart item quantity
- `DELETE /api/cart/items/:id` - Remove item from cart

### Orders (Protected)
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order

### Admin Endpoints (Admin Only)
- `GET /api/admin/products` - List all products
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product
- `GET /api/admin/orders` - List all orders
- `PUT /api/admin/orders/:id` - Update order status
- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/dashboard/stats` - Get dashboard statistics

## Project Structure

```
src/
├── components/        # Reusable components
│   ├── Layout.jsx    # Main layout wrapper
│   ├── NavBar.jsx    # Navigation bar
│   └── ProtectedRoute.jsx  # Route protection
├── contexts/         # React contexts
│   └── AuthContext.jsx  # Authentication context
├── pages/            # Page components
│   ├── Home.jsx      # Homepage
│   ├── Products.jsx  # Product catalog
│   ├── ProductDetail.jsx  # Product detail page
│   ├── Cart.jsx      # Shopping cart
│   ├── Checkout.jsx  # Checkout page
│   ├── Orders.jsx    # User orders
│   ├── Auth/         # Authentication pages
│   │   ├── Login.jsx
│   │   └── Register.jsx
│   └── Admin/        # Admin pages
│       ├── Dashboard.jsx
│       ├── Products.jsx
│       ├── Orders.jsx
│       └── Users.jsx
├── config/           # Configuration
│   └── api.js        # API client setup
├── App.jsx           # Main app component
└── main.jsx          # Entry point
```

## Design Features

- 🎨 Modern, clean design with pink/rose color scheme
- 📱 Fully responsive (mobile, tablet, desktop)
- ⚡ Fast and smooth animations
- 🎯 User-friendly interface
- ♿ Accessible components

## Notes

- The frontend expects the backend API to return data in JSON format
- Authentication tokens are stored in localStorage
- All admin routes are protected and require admin role
- The UI is fully functional but requires backend API implementation for data persistence
