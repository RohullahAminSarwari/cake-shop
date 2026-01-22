<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'user_id','session_id','order_number','total_price',
        'status','payment_status','customer_name','customer_email',
        'customer_phone','customer_address','customer_city',
        'customer_postal_code','customer_country','payment_method'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payment()
    {
        return $this->hasOne(Payment::class);
    }

    public function shipment()
    {
        return $this->hasOne(Shipment::class);
    }

    // Scope for finding orders by cart identifier (user or session)
    public function scopeByCartIdentifier($query, $identifier)
    {
        return $query->where($identifier);
    }
}
