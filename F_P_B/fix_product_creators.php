<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== Fixing Product User IDs ===\n\n";

// Get users to assign as creators
$users = \App\Models\User::all();
echo "Available users:\n";
foreach ($users as $user) {
    echo "ID: {$user->id}, Name: {$user->name}, Role: {$user->role}\n";
}
echo "\n";

// Get products with null user_id
$products = \App\Models\Product::whereNull('user_id')->get();

if ($products->count() > 0) {
    echo "Products without creator:\n";
    foreach ($products as $product) {
        echo "Product ID: {$product->id}, Name: {$product->name}\n";
    }
    
    // Assign first seller user as creator for these products
    $seller = \App\Models\User::where('role', 'seller')->first();
    if ($seller) {
        echo "\nAssigning User ID {$seller->id} ({$seller->name}) as creator for these products...\n";
        
        \App\Models\Product::whereNull('user_id')->update(['user_id' => $seller->id]);
        
        echo "✅ Updated {$products->count()} products\n";
    } else {
        echo "❌ No seller user found. Creating one...\n";
        
        // Create a seller user
        $seller = \App\Models\User::create([
            'name' => 'Product Creator',
            'email' => 'creator@example.com',
            'password' => bcrypt('password'),
            'role' => 'seller'
        ]);
        
        echo "✅ Created seller user: ID {$seller->id}\n";
        
        \App\Models\Product::whereNull('user_id')->update(['user_id' => $seller->id]);
        echo "✅ Updated {$products->count()} products\n";
    }
} else {
    echo "✅ All products have creators assigned\n";
}

// Check products again
echo "\n=== Updated Products ===\n";
$updatedProducts = \App\Models\Product::take(5)->get();

foreach ($updatedProducts as $product) {
    echo "Product ID: {$product->id}, Name: {$product->name}, Creator ID: {$product->user_id}\n";
}
