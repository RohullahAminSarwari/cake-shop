<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        $cart = Cart::firstOrCreate(['user_id' => $user->id]);
        $items = $cart->items()->with('product.images')->get();
        
        return response()->json([
            'items' => $items,
            'total' => $this->calculateTotal($items),
        ]);
    }
    
    public function add(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);
        
        $user = $request->user();
        $cart = Cart::firstOrCreate(['user_id' => $user->id]);
        
        $product = Product::findOrFail($request->product_id);
        
        // Check if item already exists in cart
        $cartItem = $cart->items()->where('product_id', $request->product_id)->first();
        
        if ($cartItem) {
            $cartItem->quantity += $request->quantity;
            $cartItem->save();
        } else {
            $cartItem = $cart->items()->create([
                'product_id' => $request->product_id,
                'quantity' => $request->quantity,
            ]);
        }
        
        $cartItem->load('product.images');
        
        return response()->json($cartItem, 201);
    }
    
    public function update(Request $request, $id)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);
        
        $user = $request->user();
        $cartItem = CartItem::whereHas('cart', function($query) use ($user) {
            $query->where('user_id', $user->id);
        })->findOrFail($id);
        
        $cartItem->quantity = $request->quantity;
        $cartItem->save();
        
        $cartItem->load('product.images');
        
        return response()->json($cartItem);
    }
    
    public function remove($id)
    {
        $user = request()->user();
        $cartItem = CartItem::whereHas('cart', function($query) use ($user) {
            $query->where('user_id', $user->id);
        })->findOrFail($id);
        
        $cartItem->delete();
        
        return response()->json(['message' => 'Item removed from cart']);
    }
    
    public function clear(Request $request)
    {
        $user = $request->user();
        $cart = Cart::where('user_id', $user->id)->first();
        
        if ($cart) {
            $cart->items()->delete();
        }
        
        return response()->json(['message' => 'Cart cleared']);
    }
    
    private function calculateTotal($items)
    {
        $total = 0;
        foreach ($items as $item) {
            $price = $item->product->discount_price ?? $item->product->price;
            $total += $price * $item->quantity;
        }
        return $total;
    }
}

