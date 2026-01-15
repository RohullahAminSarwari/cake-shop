<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Address extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id','city','street','details'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
