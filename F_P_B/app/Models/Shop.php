<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Shop extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id','shop_name','description','address','status'
    ];

    public function owner()
    {
        return $this->belongsTo(User::class,'user_id');
    }

    // public function products()
    // {
    //     return $this->hasMany(Product::class);
    // }
}
