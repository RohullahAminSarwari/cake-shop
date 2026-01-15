<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Shipment extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'order_id','shipping_method','shipping_cost','status'
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
