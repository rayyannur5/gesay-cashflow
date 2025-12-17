<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $month = $request->get('month', Carbon::now()->month);
        $year = $request->get('year', Carbon::now()->year);

        $startDate = Carbon::createFromDate($year, $month, 1)->startOfMonth();
        $endDate = Carbon::createFromDate($year, $month, 1)->endOfMonth();

        // Get total income for the month
        $totalIncome = Transaction::where('type', 'income')
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->sum('amount');

        // Get total expense for the month
        $totalExpense = Transaction::where('type', 'expense')
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->sum('amount');

        // Get balance
        $balance = $totalIncome - $totalExpense;

        // Get recent transactions
        $recentTransactions = Transaction::with('category')
            ->orderBy('transaction_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // Get expense by category for chart
        $expenseByCategory = Transaction::where('type', 'expense')
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->selectRaw('category_id, SUM(amount) as total')
            ->groupBy('category_id')
            ->with('category')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->category->name,
                    'value' => (float) $item->total,
                    'color' => $item->category->color,
                    'icon' => $item->category->icon,
                ];
            });

        // Get income by category for chart
        $incomeByCategory = Transaction::where('type', 'income')
            ->whereBetween('transaction_date', [$startDate, $endDate])
            ->selectRaw('category_id, SUM(amount) as total')
            ->groupBy('category_id')
            ->with('category')
            ->get()
            ->map(function ($item) {
                return [
                    'name' => $item->category->name,
                    'value' => (float) $item->total,
                    'color' => $item->category->color,
                    'icon' => $item->category->icon,
                ];
            });

        return Inertia::render('Dashboard', [
            'totalIncome' => (float) $totalIncome,
            'totalExpense' => (float) $totalExpense,
            'balance' => (float) $balance,
            'recentTransactions' => $recentTransactions,
            'expenseByCategory' => $expenseByCategory,
            'incomeByCategory' => $incomeByCategory,
            'currentMonth' => $month,
            'currentYear' => $year,
        ]);
    }
}
