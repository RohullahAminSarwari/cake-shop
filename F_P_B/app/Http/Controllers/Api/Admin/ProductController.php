<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::with(['category', 'images', 'shop'])->latest()->get();
        
        return response()->json($products);
    }
    
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category_id' => 'required|exists:categories,id',
            // 'shop_id' => 'nullable|exists:shops,id',
            'status' => 'required|in:active,inactive',
        ]);
        
        $product = Product::create($request->only([
            'name', 'description', 'price', 'discount_price', 'stock',
            'sku', 'category_id', 'status'
        ]));
        
        $product->load(['category', 'images', 'shop']);
        
        return response()->json($product, 201);
    }
    
    public function show($id)
    {
        $product = Product::with(['category', 'images', 'shop', 'reviews'])->findOrFail($id);
        
        return response()->json($product);
    }
    
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'price' => 'sometimes|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0',
            'stock' => 'sometimes|integer|min:0',
            'category_id' => 'sometimes|exists:categories,id',
            // 'shop_id' => 'nullable|exists:shops,id',
            'status' => 'sometimes|in:active,inactive',
        ]);
        
        $product->update($request->only([
            'name', 'description', 'price', 'discount_price', 'stock',
             'category_id',  'status'
        ]));
        
        $product->load(['category', 'images',]);
        
        return response()->json($product);
    }
    
    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();
        
        return response()->json(['message' => 'Product deleted successfully']);
    }
}
