<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\Admin\ProductController;
use App\Http\Controllers\Api\Admin\OrderController;
use App\Http\Controllers\Api\ProductController as CustomerProductController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController as CustomerOrderController;
use App\Http\Controllers\Api\CategoryController;
use Illuminate\Support\Facades\Route;

// Public Routes 
Route::get('/products', [CustomerProductController::class, 'index']);
Route::get('/products/{id}', [CustomerProductController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);

// Auth Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected Routes (Customer)
Route::middleware('auth:sanctum')->group(function () {
    
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Cart Routes
    Route::get('/cart', [CartController::class, 'index']);
    Route::post('/cart/add', [CartController::class, 'add']);
    Route::put('/cart/items/{id}', [CartController::class, 'update']);
    Route::delete('/cart/items/{id}', [CartController::class, 'remove']);
    Route::delete('/cart', [CartController::class, 'clear']);
    
    // Customer Order Routes
    Route::get('/orders', [CustomerOrderController::class, 'index']);
    Route::get('/orders/{id}', [CustomerOrderController::class, 'show']);
    Route::post('/orders', [CustomerOrderController::class, 'store']);
    
    // Admin Routes
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);
        
        Route::apiResource('/products', ProductController::class);
        Route::apiResource('/orders', OrderController::class)->only(['index', 'show', 'update']);
        
        // Dashboard Stats
        Route::get('/dashboard/stats', [OrderController::class, 'stats']);
    });
});
