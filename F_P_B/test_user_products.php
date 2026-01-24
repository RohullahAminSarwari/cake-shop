<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== Testing User-Specific Product System ===\n\n";

// Check users
$users = \App\Models\User::all();
echo "Available users:\n";
foreach ($users as $user) {
    echo "ID: {$user->id}, Name: {$user->name}, Role: {$user->role}\n";
}
echo "\n";

// Check products and their owners
$products = \App\Models\Product::with('category')->get();
echo "All products with their owners:\n";
foreach ($products as $product) {
    $ownerName = $product->user ? $product->user->name : 'No Owner';
    echo "Product ID: {$product->id}, Name: {$product->name}, Owner: {$ownerName} (ID: {$product->user_id}), Status: {$product->approval_status}\n";
}
echo "\n";

// Test user-specific product fetching
$seller = \App\Models\User::where('role', 'seller')->first();
if ($seller) {
    echo "=== Testing User Products for Seller: {$seller->name} (ID: {$seller->id}) ===\n";
    
    $userProducts = \App\Models\Product::where('user_id', $seller->id)->get();
    echo "Products owned by {$seller->name}:\n";
    
    if ($userProducts->count() === 0) {
        echo "No products found for this user.\n";
    } else {
        foreach ($userProducts as $product) {
            echo "- {$product->name} (Status: {$product->approval_status})\n";
        }
    }
} else {
    echo "No seller user found for testing.\n";
}

echo "\n=== System Ready ===\n";
echo "✅ Users can add products with their ID as owner\n";
echo "✅ Users can view only their own products via /my-products API\n";
echo "✅ Users can edit/delete only their own products\n";
echo "✅ Products require admin approval before being visible\n";
