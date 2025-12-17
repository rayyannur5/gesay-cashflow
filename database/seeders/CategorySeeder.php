<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            // Income categories
            ['name' => 'Gaji', 'type' => 'income', 'icon' => '💼', 'color' => '#10B981'],
            ['name' => 'Freelance', 'type' => 'income', 'icon' => '💻', 'color' => '#3B82F6'],
            ['name' => 'Investasi', 'type' => 'income', 'icon' => '📈', 'color' => '#8B5CF6'],
            ['name' => 'Bonus', 'type' => 'income', 'icon' => '🎁', 'color' => '#F59E0B'],
            ['name' => 'Lainnya', 'type' => 'income', 'icon' => '💰', 'color' => '#6366F1'],
            
            // Expense categories
            ['name' => 'Makanan', 'type' => 'expense', 'icon' => '🍔', 'color' => '#EF4444'],
            ['name' => 'Transportasi', 'type' => 'expense', 'icon' => '🚗', 'color' => '#F97316'],
            ['name' => 'Belanja', 'type' => 'expense', 'icon' => '🛒', 'color' => '#EC4899'],
            ['name' => 'Tagihan', 'type' => 'expense', 'icon' => '📄', 'color' => '#14B8A6'],
            ['name' => 'Hiburan', 'type' => 'expense', 'icon' => '🎮', 'color' => '#A855F7'],
            ['name' => 'Kesehatan', 'type' => 'expense', 'icon' => '💊', 'color' => '#06B6D4'],
            ['name' => 'Pendidikan', 'type' => 'expense', 'icon' => '📚', 'color' => '#0EA5E9'],
            ['name' => 'Lainnya', 'type' => 'expense', 'icon' => '📦', 'color' => '#64748B'],
        ];

        foreach ($categories as $category) {
            Category::create($category);
        }
    }
}
