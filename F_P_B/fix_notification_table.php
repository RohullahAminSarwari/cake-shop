<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== Checking Notification Table Structure ===\n\n";

// Get the table structure
$columns = \Illuminate\Support\Facades\Schema::getColumnListing('notifications');

echo "Current columns in notifications table:\n";
foreach ($columns as $column) {
    echo "- $column\n";
}

echo "\n=== Checking if notifiable_type column exists ===\n";
if (\Illuminate\Support\Facades\Schema::hasColumn('notifications', 'notifiable_type')) {
    echo "✅ notifiable_type column exists\n";
} else {
    echo "❌ notifiable_type column missing\n";
    
    echo "\nAdding notifiable_type column...\n";
    \Illuminate\Support\Facades\Schema::table('notifications', function ($table) {
        $table->string('notifiable_type')->nullable()->after('user_id');
    });
    echo "✅ Added notifiable_type column\n";
}

echo "\n=== Updated Notification Table Structure ===\n";
$updatedColumns = \Illuminate\Support\Facades\Schema::getColumnListing('notifications');
foreach ($updatedColumns as $column) {
    echo "- $column\n";
}
