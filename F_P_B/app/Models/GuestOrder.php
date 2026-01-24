<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GuestOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'guest_name',
        'guest_email',
        'guest_phone',
        'guest_address',
        'guest_city',
        'guest_postal_code',
        'guest_notes',
        'subtotal',
        'tax',
        'total',
        'status',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'total' => 'decimal:2',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the items for the guest order.
     */
    public function items()
    {
        return $this->hasMany(GuestOrderItem::class);
    }

    /**
     * Get the formatted total amount.
     */
    public function getFormattedTotalAttribute()
    {
        return '$' . number_format($this->total, 2);
    }

    /**
     * Get the formatted subtotal amount.
     */
    public function getFormattedSubtotalAttribute()
    {
        return '$' . number_format($this->subtotal, 2);
    }

    /**
     * Get the formatted tax amount.
     */
    public function getFormattedTaxAttribute()
    {
        return '$' . number_format($this->tax, 2);
    }

    /**
     * Get the full address as a single string.
     */
    public function getFullAddressAttribute()
    {
        return "{$this->guest_address}, {$this->guest_city} {$this->guest_postal_code}";
    }

    /**
     * Scope a query to only include orders with a specific status.
     */
    public function scopeWithStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to only include recent orders.
     */
    public function scopeRecent($query, $days = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($days));
    }
}
