<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Test cart functionality
use App\Models\Cart;
use Illuminate\Support\Facades\Session;

echo "Testing cart functionality...\n";

// Start a session
Session::start();
echo "Session started\n";

// Create a test cart identifier
$sessionId = 'test_session_' . time();
Session::put('cart_session_id', $sessionId);
echo "Session ID set: " . Session::get('cart_session_id') . "\n";

// Try to create/find cart
$cartIdentifier = ['session_id' => Session::get('cart_session_id')];
echo "Cart identifier: " . json_encode($cartIdentifier) . "\n";

try {
    $cart = Cart::firstOrCreate($cartIdentifier);
    echo "Cart created/found with ID: " . $cart->id . "\n";
    echo "Test successful!\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}
