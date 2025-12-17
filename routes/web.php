<?php

use App\Http\Controllers\BalanceController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\TransferController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('dashboard');
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    // Profile routes
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Transaction routes
    Route::resource('transactions', TransactionController::class)->except(['show']);

    // Category routes
    Route::resource('categories', CategoryController::class)->except(['show', 'create', 'edit']);

    // Balance routes
    Route::resource('balances', BalanceController::class)->except(['show', 'create', 'edit']);
    Route::post('/balances/{balance}/set-default', [BalanceController::class, 'setDefault'])->name('balances.setDefault');

    // Transfer routes
    Route::resource('transfers', TransferController::class)->except(['show', 'create', 'edit', 'update']);
});

require __DIR__.'/auth.php';

