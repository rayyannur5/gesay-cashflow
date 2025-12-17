<?php

namespace App\Http\Controllers;

use App\Models\Balance;
use App\Models\Transfer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TransferController extends Controller
{
    public function index()
    {
        $transfers = Transfer::with(['fromBalance', 'toBalance'])
            ->orderBy('transfer_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        $balances = Balance::orderBy('name')->get();

        return Inertia::render('Transfers/Index', [
            'transfers' => $transfers,
            'balances' => $balances,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'from_balance_id' => 'required|exists:balances,id',
            'to_balance_id' => 'required|exists:balances,id|different:from_balance_id',
            'amount' => 'required|numeric|min:0.01',
            'description' => 'nullable|string|max:255',
            'transfer_date' => 'required|date',
        ]);

        $fromBalance = Balance::findOrFail($validated['from_balance_id']);

        // Check if source balance has enough funds
        if ($fromBalance->amount < $validated['amount']) {
            return redirect()->back()->withErrors([
                'amount' => 'Saldo tidak mencukupi untuk transfer'
            ]);
        }

        DB::transaction(function () use ($validated, $fromBalance) {
            $toBalance = Balance::findOrFail($validated['to_balance_id']);

            // Create transfer record
            Transfer::create($validated);

            // Update balances
            $fromBalance->decrement('amount', $validated['amount']);
            $toBalance->increment('amount', $validated['amount']);
        });

        return redirect()->back()->with('success', 'Transfer berhasil dilakukan');
    }

    public function destroy(Transfer $transfer)
    {
        DB::transaction(function () use ($transfer) {
            // Reverse the transfer
            $fromBalance = $transfer->fromBalance;
            $toBalance = $transfer->toBalance;

            $fromBalance->increment('amount', $transfer->amount);
            $toBalance->decrement('amount', $transfer->amount);

            $transfer->delete();
        });

        return redirect()->back()->with('success', 'Transfer berhasil dibatalkan');
    }
}
