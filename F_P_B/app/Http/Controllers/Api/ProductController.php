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
        
        // Only active and approved products
        $query->where('status', 'active')->where('approval_status', 'approved');
        
        $products = $query->latest()->paginate($request->get('per_page', 15));
        
        return response()->json($products);
    }
    
    public function show($id)
    {
        $product = Product::with(['category', 'images', 'reviews'])
            ->where('status', 'active')
            ->where('approval_status', 'approved')
            ->findOrFail($id);
        
        return response()->json($product);
    }

    public function myProducts(Request $request)
    {
        $user = auth()->user();
        $query = Product::with(['category', 'images'])->where('user_id', $user->id);
        
        // Filter by category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        
        // Search
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }
        
        $products = $query->latest()->paginate($request->get('per_page', 15));
        
        return response()->json($products);
    }

    public function store(Request $request)
    {
        $user = auth()->user();
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category_id' => 'required|exists:categories,id',
            'status' => 'required|in:active,inactive',
        ]);

        $product = Product::create([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'price' => $validated['price'],
            'discount_price' => $validated['discount_price'],
            'stock' => $validated['stock'],
            'category_id' => $validated['category_id'],
            'status' => $validated['status'],
            'user_id' => $user->id,
            'approval_status' => 'pending', // Requires admin approval
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Product submitted successfully! It will be visible once approved by an admin.',
            'data' => $product
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = auth()->user();
        $product = Product::where('user_id', $user->id)->findOrFail($id);
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category_id' => 'required|exists:categories,id',
            'status' => 'required|in:active,inactive',
        ]);

        $product->update($validated);
        
        // Reset approval status if product was modified
        $product->update(['approval_status' => 'pending']);

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully! It will be re-reviewed by admin.',
            'data' => $product
        ]);
    }

    public function destroy($id)
    {
        $user = auth()->user();
        $product = Product::where('user_id', $user->id)->findOrFail($id);
        
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully'
        ]);
    }
}

