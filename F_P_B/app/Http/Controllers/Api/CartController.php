<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Str;

class CartController extends Controller
{
    private function getCartIdentifier()
    {
        // Start session if not started
        if (!Session::has('cart_session_id')) {
            Session::put('cart_session_id', Str::random(40));
        }
        
        // If user is authenticated, use user ID
        if (auth()->check()) {
            return ['user_id' => auth()->id()];
        }
        // Otherwise use session ID for guest users
        return ['session_id' => Session::get('cart_session_id')];
    }

    public function index(Request $request)
    {
        $cartIdentifier = $this->getCartIdentifier();
        $cart = Cart::firstOrCreate($cartIdentifier);
        $items = $cart->items()->with('product.images')->get();
        
        return response()->json([
            'items' => $items,
            'total' => $this->calculateTotal($items),
            'is_guest' => !auth()->check(),
        ]);
    }
    
    public function add(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);
        
        $cartIdentifier = $this->getCartIdentifier();
        $cart = Cart::firstOrCreate($cartIdentifier);
        
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
        
        $cartIdentifier = $this->getCartIdentifier();
        $cartItem = CartItem::whereHas('cart', function($query) use ($cartIdentifier) {
            foreach ($cartIdentifier as $key => $value) {
                $query->where($key, $value);
            }
        })->findOrFail($id);
        
        $cartItem->quantity = $request->quantity;
        $cartItem->save();
        
        $cartItem->load('product.images');
        
        return response()->json($cartItem);
    }
    
    public function remove($id)
    {
        $cartIdentifier = $this->getCartIdentifier();
        $cartItem = CartItem::whereHas('cart', function($query) use ($cartIdentifier) {
            foreach ($cartIdentifier as $key => $value) {
                $query->where($key, $value);
            }
        })->findOrFail($id);
        
        $cartItem->delete();
        
        return response()->json(['message' => 'Item removed from cart']);
    }
    
    public function clear(Request $request)
    {
        $cartIdentifier = $this->getCartIdentifier();
        $cart = Cart::where($cartIdentifier)->first();
        
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

