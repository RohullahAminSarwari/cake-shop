<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Test adding to cart
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Support\Facades\Session;

echo "Testing cart add functionality...\n";

// Start a session
Session::start();

// Create a test cart identifier
$sessionId = 'test_session_' . time();
Session::put('cart_session_id', $sessionId);

$cartIdentifier = ['session_id' => Session::get('cart_session_id')];
$cart = Cart::firstOrCreate($cartIdentifier);

echo "Cart ID: " . $cart->id . "\n";

// Test adding a product
try {
    $product = Product::find(1); // Assuming product with ID 1 exists
    if ($product) {
        $cartItem = $cart->items()->create([
            'product_id' => 1,
            'quantity' => 2,
        ]);
        echo "Added item to cart: " . $cartItem->id . "\n";
        echo "Product: " . $product->name . "\n";
        echo "Quantity: " . $cartItem->quantity . "\n";
    } else {
        echo "Product not found\n";
    }
    echo "Test successful!\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}
