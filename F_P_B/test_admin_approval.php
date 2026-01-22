<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Test admin approval endpoint
use App\Models\Product;

echo "Testing admin approval endpoint...\n";

// Test the getPendingProducts method directly
$controller = new App\Http\Controllers\Api\Admin\NotificationController();

// Create a mock request
class MockRequest {
    public function get($key, $default = null) {
        return $default;
    }
    
    public function all() {
        return [];
    }
}

$request = new MockRequest();

try {
    // Call the method directly
    $response = $controller->getPendingProducts();
    
    echo "Response status: " . $response->getStatusCode() . "\n";
    echo "Response content:\n";
    echo $response->getContent() . "\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}

// Test the query directly
echo "\nTesting direct query:\n";
$products = Product::with(['category', 'user'])
    ->pending()
    ->orderBy('created_at', 'desc')
    ->limit(10)
    ->get();

echo "Found " . $products->count() . " pending products:\n";
foreach ($products as $product) {
    echo "- ID: " . $product->id . ", Name: " . $product->name . "\n";
    echo "  User: " . ($product->user ? $product->user->name : 'NULL') . " (ID: " . $product->user_id . ")\n";
    echo "  Category: " . ($product->category ? $product->category->name : 'NULL') . "\n";
    echo "  Status: " . $product->approval_status . "\n\n";
}
