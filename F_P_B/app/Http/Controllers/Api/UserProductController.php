<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserProductController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'category_id' => 'required|exists:categories,id',
            'status' => 'required|in:active,inactive',
            'images' => 'array',
            'images.*' => 'image|mimes:jpeg,jpg,png,gif,webp|max:5120', // 5MB max
        ]);
        
        $productData = $request->only([
            'name', 'description', 'price', 'discount_price', 'stock',
            'category_id', 'status'
        ]);
        
        // Set user_id and approval status
        $productData['user_id'] = Auth::id();
        $productData['approval_status'] = 'pending';
        
        $product = Product::create($productData);
        
        // Handle product images if any
        if ($request->hasFile('images')) {
            $images = $request->file('images');
            \Log::info('Images received:', ['count' => is_array($images) ? count($images) : 0]);
            if (is_array($images)) {
                foreach ($images as $index => $image) {
                    if ($image && $image->isValid()) {
                        \Log::info('Processing image:', ['index' => $index, 'original_name' => $image->getClientOriginalName()]);
                        $path = $image->store('products', 'public');
                        \Log::info('Image stored at:', ['path' => $path]);
                        ProductImage::create([
                            'product_id' => $product->id,
                            'image_path' => $path,
                        ]);
                    } else {
                        \Log::error('Invalid image:', ['index' => $index, 'error' => $image ? $image->getError() : 'null']);
                    }
                }
            }
        } else {
            \Log::info('No images received in request');
        }
        
        // Create notification for admins
        Notification::createProductPending($product);
        
        $product->load(['category', 'images']);
        
        return response()->json([
            'success' => true,
            'message' => 'Product submitted for approval. It will be visible once approved by an admin.',
            'data' => $product
        ], 201);
    }
    
    public function update(Request $request, $id)
    {
        $product = Product::where('user_id', Auth::id())->findOrFail($id);
        
        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'price' => 'sometimes|required|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0',
            'stock' => 'sometimes|required|integer|min:0',
            'category_id' => 'sometimes|required|exists:categories,id',
            'status' => 'sometimes|required|in:active,inactive',
            'images' => 'array',
            'images.*' => 'image|mimes:jpeg,jpg,png,gif,webp|max:5120', // 5MB max
        ]);
        
        $product->update($request->only([
            'name', 'description', 'price', 'discount_price', 'stock',
            'category_id', 'status'
        ]));
        
        // Handle product images if any (replace all existing images)
        if ($request->hasFile('images')) {
            // Delete existing images
            ProductImage::where('product_id', $product->id)->delete();
            
            // Upload new images
            foreach ($request->file('images') as $image) {
                $path = $image->store('products', 'public');
                ProductImage::create([
                    'product_id' => $product->id,
                    'image_path' => $path,
                ]);
            }
        }
        
        // If product was previously rejected, set back to pending
        if ($product->approval_status === 'rejected') {
            $product->update(['approval_status' => 'pending']);
            Notification::createProductPending($product);
        }
        
        $product->load(['category', 'images']);
        
        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully.',
            'data' => $product
        ]);
    }
    
    public function destroy($id)
    {
        $product = Product::where('user_id', Auth::id())->findOrFail($id);
        
        // Only allow deletion of pending or rejected products
        if ($product->approval_status === 'approved') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete approved product. Please contact admin.'
            ], 403);
        }
        
        $product->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Product deleted successfully'
        ]);
    }
    
    public function myProducts(Request $request)
    {
        $query = Product::with(['category', 'images'])
            ->where('user_id', Auth::id());
        
        // Filter by approval status
        if ($request->has('approval_status')) {
            $query->where('approval_status', $request->approval_status);
        }
        
        $products = $query->latest()->paginate($request->get('per_page', 15));
        
        return response()->json([
            'success' => true,
            'data' => $products
        ]);
    }
}
