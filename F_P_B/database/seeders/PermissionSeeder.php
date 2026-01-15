<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Permission;

class PermissionSeeder extends Seeder
{
    public function run()
    {
        $permissions = [
            'manage_users',
            'manage_shops',
            'manage_products',
            'manage_orders',
            'manage_payments',
            'manage_discounts',
            'manage_reviews',
            'view_reports',
            'system_settings'
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }
    }
}
