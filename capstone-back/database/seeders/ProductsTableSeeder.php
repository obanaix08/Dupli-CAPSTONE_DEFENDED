<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductsTableSeeder extends Seeder
{
    public function run()
    {
        Product::insert([
            [
                'name' => 'Dining Table',
                'description' => '',
                'price' => 12500.00,
                'stock' => 5,
                'image' => 'storage/products/Ipon2025.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Wooden Chair',
                'description' => '', 
                'price' => 7500.00,
                'stock' => 3,
                'image' => 'storage/products/Ipon2025.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Alkansya',
                'description' => '',
                'price' => 159.00,
                'stock' => 10,
                'image' => 'storage/products/Ipon2025.jpg',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ]);
    }
}