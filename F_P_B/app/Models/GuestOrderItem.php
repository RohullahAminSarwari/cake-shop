<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GuestOrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'guest_order_id',
        'product_id',
        'product_name',
        'quantity',
        'price',
        'total',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'total' => 'decimal:2',
        'quantity' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the guest order that owns the item.
     */
    public function guestOrder()
    {
        return $this->belongsTo(GuestOrder::class);
    }

    /**
     * Get the product for this order item.
     */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Get the formatted price.
     */
    public function getFormattedPriceAttribute()
    {
        return '$' . number_format($this->price, 2);
    }

    /**
     * Get the formatted total.
     */
    public function getFormattedTotalAttribute()
    {
        return '$' . number_format($this->total, 2);
    }

    /**
     * Get the product with images.
     */
    public function productWithImages()
    {
        return $this->product()->with('images');
    }
}
