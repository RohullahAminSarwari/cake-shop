<?php

require_once 'vendor/autoload.php';

use Illuminate\Http\Request;
use App\Http\Controllers\Api\GuestOrderController;

// Test guest order data with realistic information
$guestOrderData = [
    'guest_info' => [
        'name' => 'Sarah Johnson',
        'email' => 'sarah.johnson@email.com',
        'phone' => '+1 (555) 123-4567',
        'address' => '456 Oak Avenue, Apartment 12B',
        'city' => 'Los Angeles',
        'postal_code' => '90210',
        'notes' => 'Please deliver after 6 PM. I need this for a birthday party tomorrow. Call me before delivery.'
    ],
    'items' => [
        [
            'product_id' => 1,
            'product_name' => 'Chocolate Birthday Cake',
            'quantity' => 1,
            'price' => 45.00,
            'total' => 45.00
        ],
        [
            'product_id' => 3,
            'product_name' => 'Vanilla Cupcakes (6-pack)',
            'quantity' => 2,
            'price' => 18.00,
            'total' => 36.00
        ]
    ],
    'subtotal' => 81.00,
    'tax' => 8.10,
    'total' => 89.10
];

echo "🎂 Testing Guest Order Notification System...\n\n";

// Create a mock request
$request = new Request();
$request->merge($guestOrderData);

try {
    $controller = new GuestOrderController();
    $response = $controller->store($request);
    
    $responseData = json_decode($response->getContent(), true);
    
    if ($responseData['success']) {
        echo "✅ Guest Order Created Successfully!\n";
        echo "📋 Order Number: " . $responseData['order_number'] . "\n";
        echo "🆔 Order ID: " . $responseData['order_id'] . "\n";
        echo "💰 Total Amount: $" . $guestOrderData['total'] . "\n";
        echo "👤 Customer: " . $guestOrderData['guest_info']['name'] . "\n";
        echo "📧 Email: " . $guestOrderData['guest_info']['email'] . "\n";
        echo "📞 Phone: " . $guestOrderData['guest_info']['phone'] . "\n";
        echo "🏠 Address: " . $guestOrderData['guest_info']['address'] . "\n";
        echo "🌆 City: " . $guestOrderData['guest_info']['city'] . "\n";
        echo "📮 Postal Code: " . $guestOrderData['guest_info']['postal_code'] . "\n";
        echo "📝 Notes: " . $guestOrderData['guest_info']['notes'] . "\n\n";
        
        echo "📦 Ordered Items:\n";
        foreach ($guestOrderData['items'] as $item) {
            echo "  • " . $item['product_name'] . " (Qty: " . $item['quantity'] . ") - $" . $item['total'] . "\n";
        }
        
        echo "\n🔔 Notifications have been sent to product creators!\n";
        echo "📧 Email notifications would be sent if email service is configured.\n";
        echo "📱 Creators can view this order in their notification center.\n";
        
    } else {
        echo "❌ Order creation failed: " . $responseData['message'] . "\n";
    }
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "📁 File: " . $e->getFile() . "\n";
    echo "📍 Line: " . $e->getLine() . "\n";
}

echo "\n" . str_repeat("=", 60) . "\n";
echo "🎯 Next Steps for Product Creators:\n";
echo "1. Log in to the application\n";
echo "2. Check the Notifications page\n";
echo "3. View guest customer contact information\n";
echo "4. Contact the customer to arrange payment and delivery\n";
echo "5. Update order status as needed\n";
echo str_repeat("=", 60) . "\n";
