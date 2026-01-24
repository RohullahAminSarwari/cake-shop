<?php

require_once 'vendor/autoload.php';

use Illuminate\Http\Request;
use App\Http\Controllers\Api\GuestOrderController;

// Test data for guest order
$guestOrderData = [
    'guest_info' => [
        'name' => 'John Doe',
        'email' => 'john.doe@example.com',
        'phone' => '+1234567890',
        'address' => '123 Main Street, Apt 4B',
        'city' => 'New York',
        'postal_code' => '10001',
        'notes' => 'Please deliver after 5 PM'
    ],
    'items' => [
        [
            'product_id' => 1,
            'product_name' => 'Chocolate Cake',
            'quantity' => 2,
            'price' => 25.00,
            'total' => 50.00
        ],
        [
            'product_id' => 2,
            'product_name' => 'Vanilla Cupcake',
            'quantity' => 6,
            'price' => 5.00,
            'total' => 30.00
        ]
    ],
    'subtotal' => 80.00,
    'tax' => 8.00,
    'total' => 88.00
];

echo "Testing Guest Order API...\n\n";

// Create a mock request
$request = new Request();
$request->merge($guestOrderData);

try {
    $controller = new GuestOrderController();
    $response = $controller->store($request);
    
    echo "✅ Guest Order Created Successfully!\n";
    echo "Response Status: " . $response->getStatusCode() . "\n";
    echo "Response Data: " . $response->getContent() . "\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}

echo "\nTest completed.\n";
