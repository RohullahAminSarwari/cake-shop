<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Test creating a product
use App\Models\Product;
use App\Models\User;

echo "Testing product creation...\n";

// Get first user
$user = User::first();
if (!$user) {
    echo "No users found in database\n";
    exit;
}

echo "Found user: " . $user->name . " (ID: " . $user->id . ")\n";

// Create a test product
$product = Product::create([
    'name' => 'Test Product ' . date('Y-m-d H:i:s'),
    'description' => 'Test description',
    'price' => 10.99,
    'stock' => 5,
    'category_id' => 1,
    'status' => 'active',
    'user_id' => $user->id,
    'approval_status' => 'pending'
]);

echo "Created product: " . $product->name . " (ID: " . $product->id . ")\n";
echo "Approval status: " . $product->approval_status . "\n";
echo "User ID: " . $product->user_id . "\n";

// Test pending products query
$pendingProducts = Product::with('user')->pending()->get();
echo "\nPending products count: " . $pendingProducts->count() . "\n";

foreach ($pendingProducts as $pending) {
    echo "- " . $pending->name . " by " . ($pending->user ? $pending->user->name : 'Unknown') . "\n";
}
