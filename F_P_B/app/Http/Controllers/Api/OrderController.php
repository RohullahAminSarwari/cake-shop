<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Cart;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    private function getCartIdentifier()
    {
        // If user is authenticated, use user ID
        if (auth()->check()) {
            return ['user_id' => auth()->id()];
        }
        // Otherwise use session ID for guest users
        return ['session_id' => Session::getId()];
    }

    public function index(Request $request)
    {
        $cartIdentifier = $this->getCartIdentifier();
        $orders = Order::where($cartIdentifier)
            ->with('items.product.images')
            ->latest()
            ->get();
        
        return response()->json($orders);
    }
     
    public function show($id)
    {
        $cartIdentifier = $this->getCartIdentifier();
        $order = Order::where($cartIdentifier)
            ->with('items.product.images', 'payment', 'shipment')
            ->findOrFail($id);
        
        return response()->json($order);
    }
    
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email',
            'phone' => 'required|string',
            'address' => 'required|string',
            'city' => 'required|string',
            'postal_code' => 'required|string',
            'country' => 'required|string',
            'payment_method' => 'required|string',
        ]);
        
        $cartIdentifier = $this->getCartIdentifier();
        $cart = Cart::where($cartIdentifier)->first();
        
        if (!$cart || $cart->items()->count() === 0) {
            return response()->json(['message' => 'Cart is empty'], 400);
        }
        
        // Calculate total and track product creators
        $total = 0;
        $productCreators = [];
        
        foreach ($cart->items as $item) {
            $price = $item->product->discount_price ?? $item->product->price;
            $total += $price * $item->quantity;
            
            // Track which users created the products
            $productCreatorId = $item->product->user_id;
            if ($productCreatorId) {
                if (!isset($productCreators[$productCreatorId])) {
                    $productCreators[$productCreatorId] = [
                        'user_id' => $productCreatorId,
                        'total_amount' => 0,
                        'product_count' => 0
                    ];
                }
                $productCreators[$productCreatorId]['total_amount'] += $price * $item->quantity;
                $productCreators[$productCreatorId]['product_count'] += $item->quantity;
            }
        }
        
        // Create order
        $orderData = [
            'order_number' => 'ORD-' . strtoupper(Str::random(8)),
            'total_price' => $total,
            'status' => 'pending',
            'payment_status' => 'pending',
            'customer_name' => $request->name,
            'customer_email' => $request->email,
            'customer_phone' => $request->phone,
            'customer_address' => $request->address,
            'customer_city' => $request->city,
            'customer_postal_code' => $request->postal_code,
            'customer_country' => $request->country,
            'payment_method' => $request->payment_method,
        ];
        
        // Add user ID if authenticated, otherwise leave null for guest
        if (auth()->check()) {
            $orderData['user_id'] = auth()->id();
        }
        
        $order = Order::create($orderData);
        
        // Create order items
        foreach ($cart->items as $item) {
            $price = $item->product->discount_price ?? $item->product->price;
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $item->product_id,
                'quantity' => $item->quantity,
                'price' => $price,
                'product_creator_id' => $item->product->user_id, // Track who created the product
            ]);
        }
        
        // Create notifications for product creators
        foreach ($productCreators as $creatorId => $creatorInfo) {
            if ($creatorId) { // Only notify if product has a creator
                Notification::createNewOrderNotification($creatorId, $order->id, $creatorInfo);
            }
        }
        
        // Clear cart
        $cart->items()->delete();
        
        $order->load('items.product.images');
        
        return response()->json($order, 201);
    }
}

