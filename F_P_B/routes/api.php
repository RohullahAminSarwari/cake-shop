<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\Admin\ProductController;
use App\Http\Controllers\Api\Admin\OrderController;
use App\Http\Controllers\Api\Admin\NotificationController as AdminNotificationController;
use App\Http\Controllers\Api\ProductController as CustomerProductController;
use App\Http\Controllers\Api\UserProductController;
use App\Http\Controllers\Api\UserCategoryController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController as CustomerOrderController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\GuestOrderController;
use Illuminate\Support\Facades\Route;
  
// Public Routes 
Route::get('/products', [CustomerProductController::class, 'index']);
Route::get('/products/{id}', [CustomerProductController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);
Route::get('/categories-tree', [CategoryController::class, 'tree']);

// Cart Routes (Public - for guests and users)
Route::get('/cart', [\App\Http\Controllers\Api\CartController::class, 'index']);
Route::post('/cart/add', [\App\Http\Controllers\Api\CartController::class, 'add']);
Route::put('/cart/items/{id}', [\App\Http\Controllers\Api\CartController::class, 'update']);
Route::delete('/cart/items/{id}', [\App\Http\Controllers\Api\CartController::class, 'remove']);
Route::delete('/cart', [\App\Http\Controllers\Api\CartController::class, 'clear']);

// Guest Order Routes (Public)
Route::post('/guest-orders', [GuestOrderController::class, 'store']);

// Auth Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected Routes (Customer)
Route::middleware('auth:sanctum')->group(function () {
    
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Customer Order Routes
    Route::get('/orders', [CustomerOrderController::class, 'index']);
    Route::get('/orders/{id}', [CustomerOrderController::class, 'show']);
    Route::post('/orders', [CustomerOrderController::class, 'store']);
    
    // User Product Routes (for sellers/vendors)
    Route::get('/my-products', [UserProductController::class, 'myProducts']);
    Route::post('/products', [UserProductController::class, 'store']);
    Route::put('/products/{id}', [UserProductController::class, 'update']);
    Route::delete('/products/{id}', [UserProductController::class, 'destroy']);
    
    // User Category Routes (for sellers/vendors)
    Route::get('/my-categories', [UserCategoryController::class, 'myCategories']);
    Route::post('/categories', [UserCategoryController::class, 'store']);
    Route::put('/categories/{id}', [UserCategoryController::class, 'update']);
    Route::delete('/categories/{id}', [UserCategoryController::class, 'destroy']);
    
    // Notification Routes
    Route::get('/notifications', [AdminNotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [AdminNotificationController::class, 'getUnreadCount']);
    Route::put('/notifications/{id}/read', [AdminNotificationController::class, 'markAsRead']);
    Route::put('/notifications/read-all', [AdminNotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [AdminNotificationController::class, 'delete']);
    
    // Guest Order Management Routes (for product creators and admins)
    Route::get('/guest-orders', [GuestOrderController::class, 'index']);
    Route::get('/guest-orders/{id}', [GuestOrderController::class, 'show']);
    Route::put('/guest-orders/{id}/status', [GuestOrderController::class, 'updateStatus']);
    
    // Admin Routes
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);
        
        Route::apiResource('/products', ProductController::class);
        Route::apiResource('/categories', CategoryController::class);
        Route::apiResource('/orders', OrderController::class)->only(['index', 'show', 'update']);
        
        // Admin Notification Routes
        Route::get('/notifications', [AdminNotificationController::class, 'index']);
        Route::get('/notifications/unread-count', [AdminNotificationController::class, 'getUnreadCount']);
        Route::put('/notifications/{id}/read', [AdminNotificationController::class, 'markAsRead']);
        Route::put('/notifications/read-all', [AdminNotificationController::class, 'markAllAsRead']);
        Route::delete('/notifications/{id}', [AdminNotificationController::class, 'delete']);
        
        // Product Approval Routes
        Route::get('/pending-products', [AdminNotificationController::class, 'getPendingProducts']);
        Route::put('/products/{id}/approve', [AdminNotificationController::class, 'approveProduct']);
        Route::put('/products/{id}/reject', [AdminNotificationController::class, 'rejectProduct']);
        
        // Dashboard Stats
        Route::get('/dashboard/stats', [OrderController::class, 'stats']);
    });
});
