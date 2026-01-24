<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== Checking Notifications ===\n\n";

// Check total notifications
$totalNotifications = \App\Models\Notification::count();
echo "Total notifications in database: {$totalNotifications}\n\n";

// Get recent notifications
$notifications = \App\Models\Notification::latest()->take(5)->get();

if ($notifications->count() > 0) {
    echo "Recent notifications:\n";
    foreach ($notifications as $notification) {
        echo "ID: {$notification->id}\n";
        echo "User ID: {$notification->user_id}\n";
        echo "Type: {$notification->type}\n";
        echo "Title: {$notification->title}\n";
        echo "Message: {$notification->message}\n";
        echo "Is Read: " . ($notification->is_read ? 'Yes' : 'No') . "\n";
        echo "Created At: {$notification->created_at}\n";
        echo "---\n";
    }
} else {
    echo "No notifications found in database.\n";
}

// Check guest orders
echo "\n=== Checking Guest Orders ===\n";
$guestOrders = \App\Models\GuestOrder::latest()->take(3)->get();

foreach ($guestOrders as $order) {
    echo "Order ID: {$order->id}\n";
    echo "Order Number: {$order->order_number}\n";
    echo "Guest Name: {$order->guest_name}\n";
    echo "Guest Email: {$order->guest_email}\n";
    echo "Total: \${$order->total}\n";
    echo "Status: {$order->status}\n";
    echo "---\n";
}

// Check products and their creators
echo "\n=== Checking Products ===\n";
$products = \App\Models\Product::take(3)->get();

foreach ($products as $product) {
    echo "Product ID: {$product->id}\n";
    echo "Product Name: {$product->name}\n";
    echo "User ID (Creator): {$product->user_id}\n";
    echo "---\n";
}
