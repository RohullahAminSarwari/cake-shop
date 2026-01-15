<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {  
        $query = Product::with(['category', 'images']);
        
        // Filter by category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        
        // Filter by featured
        if ($request->has('featured')) {
            // You can add a featured field to products table later
        }
        
        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }
        
        // Only active products
        $query->where('status', 'active');
        
        $products = $query->latest()->paginate($request->get('per_page', 15));
        
        return response()->json($products);
    }
    
    public function show($id)
    {
        $product = Product::with(['category', 'images', 'reviews'])->findOrFail($id);
        
        return response()->json($product);
    }
}

