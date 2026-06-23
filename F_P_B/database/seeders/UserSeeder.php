<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run()
    {
        $users = [
            [
                'name' => 'Admin User',
                'email' => 'admin@system.com',
                'phone' => '0700000000',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'status' => 'active',
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Seller User',
                'email' => 'seller@example.com',
                'phone' => '0700000001',
                'password' => Hash::make('seller123'),
                'role' => 'seller',
                'status' => 'active',
                'email_verified_at' => now(),
            ],
            [
                'name' => 'Seller Two',
                'email' => 'seller2@example.com',
                'phone' => '0700000002',
                'password' => Hash::make('seller123'),
                'role' => 'seller',
                'status' => 'active',
                'email_verified_at' => now(),
            ],
        ];

        foreach ($users as $user) {
            User::create($user);
        }
    }
}
