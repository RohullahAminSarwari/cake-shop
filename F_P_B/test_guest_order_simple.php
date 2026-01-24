<?php

echo "🎂 Testing Guest Order API via HTTP...\n\n";

// Test data
$guestOrderData = [
    'guest_info' => [
        'name' => 'Sarah Johnson',
        'email' => 'sarah.johnson@email.com',
        'phone' => '+1 (555) 123-4567',
        'address' => '456 Oak Avenue, Apartment 12B',
        'city' => 'Los Angeles',
        'postal_code' => '90210',
        'notes' => 'Please deliver after 6 PM. Birthday party tomorrow.'
    ],
    'items' => [
        [
            'product_id' => 1,
            'product_name' => 'Chocolate Birthday Cake',
            'quantity' => 1,
            'price' => 45.00,
            'total' => 45.00
        ]
    ],
    'subtotal' => 45.00,
    'tax' => 4.50,
    'total' => 49.50
];

// Convert to JSON
$jsonData = json_encode($guestOrderData);

// Use curl to test the API endpoint
$ch = curl_init('http://127.0.0.1:8000/api/guest-orders');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonData);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "📡 API Request Details:\n";
echo "URL: POST http://127.0.0.1:8000/api/guest-orders\n";
echo "HTTP Status: " . $httpCode . "\n\n";

echo "📋 Request Data:\n";
echo json_encode($guestOrderData, JSON_PRETTY_PRINT) . "\n\n";

echo "📬 API Response:\n";
echo $response . "\n\n";

$responseData = json_decode($response, true);

if ($httpCode === 201 && isset($responseData['success']) && $responseData['success']) {
    echo "✅ SUCCESS! Guest order created successfully!\n";
    echo "🆔 Order ID: " . $responseData['order_id'] . "\n";
    echo "📋 Order Number: " . $responseData['order_number'] . "\n";
    echo "🔔 Notifications sent to product creators!\n";
    
    echo "\n👤 Guest Customer Information:\n";
    echo "Name: " . $guestOrderData['guest_info']['name'] . "\n";
    echo "Email: " . $guestOrderData['guest_info']['email'] . "\n";
    echo "Phone: " . $guestOrderData['guest_info']['phone'] . "\n";
    echo "Address: " . $guestOrderData['guest_info']['address'] . "\n";
    echo "City: " . $guestOrderData['guest_info']['city'] . "\n";
    echo "Notes: " . $guestOrderData['guest_info']['notes'] . "\n";
    
} else {
    echo "❌ FAILED! Guest order creation failed.\n";
    if (isset($responseData['message'])) {
        echo "Error: " . $responseData['message'] . "\n";
    }
}

echo "\n" . str_repeat("=", 60) . "\n";
echo "🎯 Product Creators can now:\n";
echo "1. Log in and check their Notifications page\n";
echo "2. View the guest customer's contact details\n";
echo "3. See the order information and items\n";
echo "4. Contact the customer directly\n";
echo "5. Manage the order status\n";
echo str_repeat("=", 60) . "\n";
