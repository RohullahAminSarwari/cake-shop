# Laravel Integration Guide

This document provides step-by-step instructions for connecting this React frontend with your Laravel backend.

## 1. Laravel CORS Configuration

Update your Laravel `config/cors.php` file:

```php
<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:3000'], // Your React dev server
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
```

## 2. Laravel Sanctum Setup (For Authentication)

If you want to use Laravel Sanctum for authentication:

### Install Sanctum:
```bash
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

### Update `config/sanctum.php`:
```php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
    '%s%s',
    'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1',
    env('APP_URL') ? ','.parse_url(env('APP_URL'), PHP_URL_HOST) : ''
))),
```

### Add to `.env`:
```
SANCTUM_STATEFUL_DOMAINS=localhost:3000
SESSION_DOMAIN=localhost
```

### Update `app/Http/Kernel.php`:
```php
'api' => [
    \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
    'throttle:api',
    \Illuminate\Routing\Middleware\SubstituteBindings::class,
],
```

## 3. API Routes Setup

In your Laravel `routes/api.php`, ensure routes are properly set up:

```php
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Example API routes
Route::prefix('cakes')->group(function () {
    Route::get('/', [CakeController::class, 'index']);
    Route::get('/{id}', [CakeController::class, 'show']);
    Route::post('/', [CakeController::class, 'store'])->middleware('auth:sanctum');
    Route::put('/{id}', [CakeController::class, 'update'])->middleware('auth:sanctum');
    Route::delete('/{id}', [CakeController::class, 'destroy'])->middleware('auth:sanctum');
});
```

## 4. Frontend Environment Setup

1. Create a `.env` file in the React project root:
```
VITE_API_BASE_URL=http://localhost:8000/api
```

2. The Vite dev server is already configured to proxy `/api` requests to `http://localhost:8000`

## 5. CSRF Token Setup (If using Sanctum)

For the first request, you may need to fetch the CSRF cookie:

```javascript
// In your React app, before making authenticated requests
await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
  withCredentials: true
});
```

## 6. Authentication Flow

### Login Example:
```javascript
import { apiService } from './services/apiService';

const handleLogin = async (email, password) => {
  try {
    // First, get CSRF cookie
    await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
      withCredentials: true
    });
    
    // Then login
    const response = await apiService.login({ email, password });
    console.log('Logged in:', response);
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

## 7. Production Deployment

For production:

1. Build the React app:
```bash
npm run build
```

2. Copy the `dist` folder contents to Laravel's `public` folder, or serve it separately

3. Update CORS to allow your production domain

4. Update `VITE_API_BASE_URL` in your production `.env` to your production API URL

## 8. Testing the Connection

1. Start Laravel backend:
```bash
php artisan serve
```

2. Start React frontend:
```bash
npm run dev
```

3. Test API connection in browser console:
```javascript
import api from './src/config/api';
api.get('/cakes').then(res => console.log(res.data));
```

