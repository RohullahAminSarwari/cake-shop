# Cake Shop Digitalization - React Frontend

This is a React.js application with Tailwind CSS, configured to work with a Laravel backend.

## Features

- ⚛️ React 18
- 🎨 Tailwind CSS 3
- ⚡ Vite (fast build tool)
- 🔌 Laravel API integration ready
- 📦 Axios for API calls
- 🛣️ React Router DOM

## Installation

1. Install dependencies:
```bash
npm install
```

## Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Building for Production

Build the production bundle:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Laravel Integration

### API Configuration

1. Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```

2. Update the `VITE_API_BASE_URL` in `.env` to match your Laravel backend URL.

### Laravel Backend Setup

Make sure your Laravel backend has:

1. **CORS Configuration** - Update `config/cors.php`:
```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_origins' => ['http://localhost:3000'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
'supports_credentials' => true,
```

2. **API Routes** - Your Laravel routes should be prefixed with `/api`

3. **Sanctum (Optional)** - If using Laravel Sanctum for authentication:
   - Install Sanctum: `composer require laravel/sanctum`
   - Publish config: `php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"`
   - Update `config/sanctum.php` to allow your frontend domain

### Using the API Service

Import and use the API service in your components:

```javascript
import { apiService } from './services/apiService';

// Example usage
const fetchCakes = async () => {
  try {
    const cakes = await apiService.getCakes();
    console.log(cakes);
  } catch (error) {
    console.error('Error fetching cakes:', error);
  }
};
```

## Project Structure

```
├── src/
│   ├── config/
│   │   └── api.js          # Axios configuration
│   ├── services/
│   │   └── apiService.js    # API service functions
│   ├── App.jsx             # Main App component
│   ├── App.css             # App styles
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles with Tailwind
├── index.html              # HTML template
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
└── package.json            # Dependencies
```

## Development Proxy

The Vite dev server is configured to proxy `/api` requests to `http://localhost:8000` (your Laravel backend). This means:

- Frontend: `http://localhost:3000`
- API calls to `/api/*` will be proxied to `http://localhost:8000/api/*`

## License

MIT

