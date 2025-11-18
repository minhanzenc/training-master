<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $arr = [];
        for ($i = 1; $i <= 100; $i++) {
            $arr[] = [
                'product_id' => 'P' . str_pad($i, 9, '0', STR_PAD_LEFT),
                'product_name' => 'Product ' . $i,
                'product_image' => null,
                'product_image_public_id' => null,
                'product_price' => rand(0, 1000000),
                'is_sales' => rand(0, 2),
                'description' => 'user',
            ];
        }
        Product::insert($arr);
    }
}
