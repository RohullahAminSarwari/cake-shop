<?php



namespace App\Http\Controllers\Api;



use App\Http\Controllers\Controller;

use App\Models\Order;

use App\Models\OrderItem;

use App\Models\Cart;

use Illuminate\Http\Request;

use Illuminate\Support\Str;



class OrderController extends Controller

{

    public function index(Request $request)

    {

        $user = $request->user();

        $orders = Order::where('user_id', $user->id)

            ->with('items.product.images')

            ->latest()

            ->get();

        

        return response()->json($orders);

    }

     

    public function show($id)

    {

        $user = request()->user();

        $order = Order::where('user_id', $user->id)

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

        

        $user = $request->user();

        $cart = Cart::where('user_id', $user->id)->first();

        

        if (!$cart || $cart->items()->count() === 0) {

            return response()->json(['message' => 'Cart is empty'], 400);

        }

        

        // Calculate total

        $total = 0;

        foreach ($cart->items as $item) {

            $price = $item->product->discount_price ?? $item->product->price;

            $total += $price * $item->quantity;

        }

        

        // Create order

        $order = Order::create([

            'user_id' => $user->id,

            'order_number' => 'ORD-' . strtoupper(Str::random(8)),

            'total_price' => $total,

            'status' => 'pending',

            'payment_status' => 'pending',

        ]);

        

        // Create order items

        foreach ($cart->items as $item) {

            $price = $item->product->discount_price ?? $item->product->price;

            OrderItem::create([

                'order_id' => $order->id,

                'product_id' => $item->product_id,

                'quantity' => $item->quantity,

                'price' => $price,

            ]);

        }

        

        // Create address (if you have an addresses table)

        // Address::create([...]);

        

        // Clear cart

        $cart->items()->delete();

        

        $order->load('items.product.images');

        

        return response()->json($order, 201);

    }

}



