# Quick Start Guide

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Environment File
Create a `.env` file in the root directory:
```
VITE_API_BASE_URL=http://localhost:8000/api
```

### 3. Start Development Server
```bash
npm run dev
```

Your React app will be running at `http://localhost:3000`

## 📁 Project Structure

```
F_P_F/
├── public/              # Static assets
├── src/
│   ├── config/
│   │   └── api.js       # Axios configuration for Laravel
│   ├── services/
│   │   └── apiService.js  # API service functions
│   ├── App.jsx         # Main App component
│   ├── App.css         # App styles
│   ├── main.jsx        # Entry point
│   └── index.css       # Global styles (Tailwind)
├── index.html          # HTML template
├── vite.config.js      # Vite configuration (with Laravel proxy)
├── tailwind.config.js  # Tailwind CSS configuration
├── postcss.config.js   # PostCSS configuration
└── package.json        # Dependencies
```

## 🔌 Laravel Connection

The app is pre-configured to connect to Laravel:

- **API Proxy**: Requests to `/api/*` are automatically proxied to `http://localhost:8000/api/*`
- **Axios Setup**: Pre-configured with authentication headers and error handling
- **CORS Ready**: Configured for Laravel CORS setup

See `LARAVEL_INTEGRATION.md` for detailed Laravel backend setup instructions.

## 🎨 Using Tailwind CSS

Tailwind is fully configured and ready to use:

```jsx
<div className="bg-blue-500 text-white p-4 rounded-lg">
  Hello Tailwind!
</div>
```

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## ✅ Next Steps

1. Install dependencies: `npm install`
2. Configure your Laravel backend (see `LARAVEL_INTEGRATION.md`)
3. Start coding your components!
4. Use `apiService` from `src/services/apiService.js` to connect to Laravel APIs

