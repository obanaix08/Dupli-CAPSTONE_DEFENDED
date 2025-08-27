<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\User;
use App\Models\Product; // 👈 import Product model

class ProductionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::inRandomOrder()->first()->id ?? User::factory(),
            'product_id' => Product::inRandomOrder()->first()->id ?? Product::factory(), // 👈 FIX here
            'product_name'   => $this->faker->randomElement([
                "Wooden Chair", "Dining Table", "Bookshelf", "Cabinet", 
                "Bed Frame", "Coffee Table", "Stool", "Wardrobe"
            ]),
            'date'           => $this->faker->dateTimeBetween('-15 days', 'now')->format('Y-m-d'),
            'stage'          => $this->faker->randomElement(["Preparation", "Assembly", "Finishing", "Quality Control"]),
            'status'         => $this->faker->randomElement(["Pending", "In Progress", "Completed", "Hold"]),
            'quantity'       => $this->faker->numberBetween(5, 50),
            'resources_used' => [
                'wood'  => $this->faker->numberBetween(5, 20) . " pcs",
                'nails' => $this->faker->numberBetween(10, 100) . " pcs",
                'paint' => $this->faker->numberBetween(1, 5) . " liters",
            ],
            'notes'          => $this->faker->randomElement(["Urgent order", "Standard priority"]),
        ];
    }
}
