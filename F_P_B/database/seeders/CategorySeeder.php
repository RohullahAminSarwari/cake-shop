<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run()
    {
        $categories = [
            ['name' => 'Birthday Cakes', 'description' => 'Custom birthday cakes for all ages', 'icon' => '🎂', 'status' => 'active', 'approval_status' => 'approved'],
            ['name' => 'Wedding Cakes', 'description' => 'Elegant wedding cakes for your special day', 'icon' => '💒', 'status' => 'active', 'approval_status' => 'approved'],
            ['name' => 'Cupcakes', 'description' => 'Delicious cupcakes in various flavors', 'icon' => '🧁', 'status' => 'active', 'approval_status' => 'approved'],
            ['name' => 'Pastries', 'description' => 'Fresh baked pastries and croissants', 'icon' => '🥐', 'status' => 'active', 'approval_status' => 'approved'],
            ['name' => 'Cookies', 'description' => 'Homemade cookies and biscuits', 'icon' => '🍪', 'status' => 'active', 'approval_status' => 'approved'],
            ['name' => 'Chocolate', 'description' => 'Premium chocolate treats and truffles', 'icon' => '🍫', 'status' => 'active', 'approval_status' => 'approved'],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
