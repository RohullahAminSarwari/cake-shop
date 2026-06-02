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
        
        // Transform products to include full image URLs
        $products->getCollection()->transform(function ($product) {
            $product->images = $product->images->map(function ($image) {
                return [
                    'id' => $image->id,
                    'image_path' => $image->image_path,
                    'url' => 'http://localhost:8000/storage/' . $image->image_path
                ];
            });
            return $product;
        });
        
        return response()->json($products);
    }
    
    public function show($id)
    {
        $product = Product::with(['category', 'images', 'reviews'])
            ->where('status', 'active')
            ->where('approval_status', 'approved')
            ->findOrFail($id);
        
        // Transform images to include full URLs
        $transformedImages = $product->images->map(function ($image) {
            return [
                'id' => $image->id,
                'image_path' => $image->image_path,
                'url' => 'http://localhost:8000/storage/' . $image->image_path
            ];
        });
        
        // Create a new array response to avoid any model serialization issues
        $response = [
            'id' => $product->id,
            'category_id' => $product->category_id,
            'name' => $product->name,
            'description' => $product->description,
            'price' => $product->price,
            'discount_price' => $product->discount_price,
            'stock' => $product->stock,
            'status' => $product->status,
            'approval_status' => $product->approval_status,
            'rejection_reason' => $product->rejection_reason,
            'created_at' => $product->created_at,
            'updated_at' => $product->updated_at,
            'approved_by' => $product->approved_by,
            'approved_at' => $product->approved_at,
            'user_id' => $product->user_id,
            'images' => $transformedImages,
            'category' => $product->category,
            'reviews' => $product->reviews
        ];
        
        return response()->json($response);
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
        
        // Transform products to include full image URLs
        $products->getCollection()->transform(function ($product) {
            $product->images = $product->images->map(function ($image) {
                return [
                    'id' => $image->id,
                    'image_path' => $image->image_path,
                    'url' => 'http://localhost:8000/storage/' . $image->image_path
                ];
            });
            return $product;
        });
        
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
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB max
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

        // Handle image uploads
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                if ($image->isValid()) {
                    // Generate unique filename
                    $filename = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                    
                    // Create the products directory if it doesn't exist
                    $productsDir = storage_path('app/public/products');
                    if (!is_dir($productsDir)) {
                        mkdir($productsDir, 0755, true);
                    }
                    
                    // Move the file
                    $path = 'products/' . $filename;
                    $image->move($productsDir, $filename);
                    
                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_path' => $path,
                    ]);
                }
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Product submitted successfully! It will be visible once approved by an admin.',
            'data' => $product->load('images')
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
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB max
        ]);

        $product->update($validated);

        // Handle image uploads
        if ($request->hasFile('images')) {
            // Delete old images
            $product->images()->delete();
            
            // Add new images
            foreach ($request->file('images') as $image) {
                if ($image->isValid()) {
                    // Generate unique filename
                    $filename = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                    
                    // Create the products directory if it doesn't exist
                    $productsDir = storage_path('app/public/products');
                    if (!is_dir($productsDir)) {
                        mkdir($productsDir, 0755, true);
                    }
                    
                    // Move the file
                    $path = 'products/' . $filename;
                    $image->move($productsDir, $filename);
                    
                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_path' => $path,
                    ]);
                }
            }
        }
        
        // Reset approval status if product was modified
        $product->update(['approval_status' => 'pending']);

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully! It will be re-reviewed by admin.',
            'data' => $product->load('images')
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

