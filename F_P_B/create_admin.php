<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

// Create admin user
$admin = User::create([
    'name' => 'Admin User',
    'email' => 'admin@gmail.com',
    'password' => Hash::make('12341234'),
    'role' => 'admin',
    'status' => 'active'
]);

echo "Admin user created successfully!\n";
echo "Email: " . $admin->email . "\n";
echo "Name: " . $admin->name . "\n";
echo "Role: " . $admin->role . "\n";
echo "User ID: " . $admin->id . "\n";