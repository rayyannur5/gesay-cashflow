<?php

namespace Database\Seeders;

use App\Models\Balance;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class BalanceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $balances = [
            [
                'name' => 'Cash',
                'icon' => '💵',
                'color' => '#22C55E',
                'amount' => 0,
                'is_default' => true,
            ],
            [
                'name' => 'Bank',
                'icon' => '🏦',
                'color' => '#3B82F6',
                'amount' => 0,
                'is_default' => false,
            ],
            [
                'name' => 'E-Wallet',
                'icon' => '📱',
                'color' => '#8B5CF6',
                'amount' => 0,
                'is_default' => false,
            ],
        ];

        foreach ($balances as $balance) {
            Balance::create($balance);
        }
    }
}
