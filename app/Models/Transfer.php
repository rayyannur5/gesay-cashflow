<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transfer extends Model
{
    protected $fillable = [
        'from_balance_id',
        'to_balance_id',
        'amount',
        'description',
        'transfer_date',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'transfer_date' => 'date',
    ];

    public function fromBalance(): BelongsTo
    {
        return $this->belongsTo(Balance::class, 'from_balance_id');
    }

    public function toBalance(): BelongsTo
    {
        return $this->belongsTo(Balance::class, 'to_balance_id');
    }
}
