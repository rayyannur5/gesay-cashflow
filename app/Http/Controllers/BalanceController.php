<?php

namespace App\Http\Controllers;

use App\Models\Balance;
use App\Models\Transfer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class BalanceController extends Controller
{
    public function index()
    {
        $balances = Balance::withCount('transactions')
            ->orderBy('is_default', 'desc')
            ->orderBy('name')
            ->get();

        $totalBalance = $balances->sum('amount');

        return Inertia::render('Balances/Index', [
            'balances' => $balances,
            'totalBalance' => $totalBalance,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'icon' => 'required|string|max:10',
            'color' => 'required|string|max:20',
            'amount' => 'required|numeric|min:0',
            'is_default' => 'boolean',
        ]);

        // If this is set as default, remove default from others
        if ($validated['is_default'] ?? false) {
            Balance::where('is_default', true)->update(['is_default' => false]);
        }

        // If this is the first balance, make it default
        if (Balance::count() === 0) {
            $validated['is_default'] = true;
        }

        Balance::create($validated);

        return redirect()->back()->with('success', 'Balance berhasil ditambahkan');
    }

    public function update(Request $request, Balance $balance)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'icon' => 'required|string|max:10',
            'color' => 'required|string|max:20',
            'amount' => 'required|numeric|min:0',
            'is_default' => 'boolean',
        ]);

        // If this is set as default, remove default from others
        if ($validated['is_default'] ?? false) {
            Balance::where('id', '!=', $balance->id)
                ->where('is_default', true)
                ->update(['is_default' => false]);
        }

        $balance->update($validated);

        return redirect()->back()->with('success', 'Balance berhasil diupdate');
    }

    public function destroy(Balance $balance)
    {
        // Check if balance has transactions
        if ($balance->transactions()->count() > 0) {
            return redirect()->back()->withErrors([
                'error' => 'Balance tidak bisa dihapus karena masih memiliki transaksi'
            ]);
        }

        // Check if this is the only balance
        if (Balance::count() <= 1) {
            return redirect()->back()->withErrors([
                'error' => 'Harus ada minimal satu balance'
            ]);
        }

        // If deleting default balance, set another as default
        if ($balance->is_default) {
            Balance::where('id', '!=', $balance->id)->first()->update(['is_default' => true]);
        }

        $balance->delete();

        return redirect()->back()->with('success', 'Balance berhasil dihapus');
    }

    public function setDefault(Balance $balance)
    {
        Balance::where('is_default', true)->update(['is_default' => false]);
        $balance->update(['is_default' => true]);

        return redirect()->back()->with('success', 'Default balance berhasil diubah');
    }
}
