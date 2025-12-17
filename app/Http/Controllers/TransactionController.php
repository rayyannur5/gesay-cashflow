<?php

namespace App\Http\Controllers;

use App\Models\Balance;
use App\Models\Category;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $query = Transaction::with(['category', 'balance'])
            ->orderBy('transaction_date', 'desc')
            ->orderBy('created_at', 'desc');

        // Filter by type
        if ($request->has('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        // Filter by date range
        if ($request->has('start_date') && $request->start_date) {
            $query->where('transaction_date', '>=', $request->start_date);
        }

        if ($request->has('end_date') && $request->end_date) {
            $query->where('transaction_date', '<=', $request->end_date);
        }

        // Filter by category
        if ($request->has('category_id') && $request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by balance
        if ($request->has('balance_id') && $request->balance_id) {
            $query->where('balance_id', $request->balance_id);
        }

        $transactions = $query->paginate(15)->withQueryString();

        $categories = Category::all();
        $balances = Balance::orderBy('name')->get();

        return Inertia::render('Transactions/Index', [
            'transactions' => $transactions,
            'categories' => $categories,
            'balances' => $balances,
            'filters' => $request->only(['type', 'start_date', 'end_date', 'category_id', 'balance_id']),
        ]);
    }

    public function create()
    {
        $categories = Category::all();
        $balances = Balance::orderBy('name')->get();
        $defaultBalance = Balance::where('is_default', true)->first();

        return Inertia::render('Transactions/Create', [
            'categories' => $categories,
            'balances' => $balances,
            'defaultBalanceId' => $defaultBalance?->id,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'balance_id' => 'required|exists:balances,id',
            'type' => 'required|in:income,expense',
            'amount' => 'required|numeric|min:0',
            'description' => 'nullable|string|max:500',
            'transaction_date' => 'required|date',
        ]);

        DB::transaction(function () use ($validated) {
            // Create transaction
            Transaction::create($validated);

            // Update balance
            $balance = Balance::find($validated['balance_id']);
            if ($validated['type'] === 'income') {
                $balance->increment('amount', $validated['amount']);
            } else {
                $balance->decrement('amount', $validated['amount']);
            }
        });

        return redirect()->route('transactions.index')
            ->with('success', 'Transaksi berhasil ditambahkan!');
    }

    public function edit(Transaction $transaction)
    {
        $categories = Category::all();
        $balances = Balance::orderBy('name')->get();

        return Inertia::render('Transactions/Edit', [
            'transaction' => $transaction->load(['category', 'balance']),
            'categories' => $categories,
            'balances' => $balances,
        ]);
    }

    public function update(Request $request, Transaction $transaction)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'balance_id' => 'required|exists:balances,id',
            'type' => 'required|in:income,expense',
            'amount' => 'required|numeric|min:0',
            'description' => 'nullable|string|max:500',
            'transaction_date' => 'required|date',
        ]);

        DB::transaction(function () use ($validated, $transaction) {
            // Reverse old transaction from old balance
            $oldBalance = Balance::find($transaction->balance_id);
            if ($oldBalance) {
                if ($transaction->type === 'income') {
                    $oldBalance->decrement('amount', (float) $transaction->amount);
                } else {
                    $oldBalance->increment('amount', (float) $transaction->amount);
                }
            }

            // Apply new transaction to new balance
            $newBalance = Balance::find($validated['balance_id']);
            if ($validated['type'] === 'income') {
                $newBalance->increment('amount', $validated['amount']);
            } else {
                $newBalance->decrement('amount', $validated['amount']);
            }

            // Update transaction
            $transaction->update($validated);
        });

        return redirect()->route('transactions.index')
            ->with('success', 'Transaksi berhasil diupdate!');
    }

    public function destroy(Transaction $transaction)
    {
        DB::transaction(function () use ($transaction) {
            // Reverse transaction from balance
            $balance = Balance::find($transaction->balance_id);
            if ($balance) {
                if ($transaction->type === 'income') {
                    $balance->decrement('amount', (float) $transaction->amount);
                } else {
                    $balance->increment('amount', (float) $transaction->amount);
                }
            }

            $transaction->delete();
        });

        return redirect()->route('transactions.index')
            ->with('success', 'Transaksi berhasil dihapus!');
    }
}
