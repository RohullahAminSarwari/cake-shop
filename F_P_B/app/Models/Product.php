<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Product extends Model
{
    use HasFactory;
   
    protected $fillable = [
        'category_id','name','description',
        'price','discount_price','stock','status'
    ];

    // public function shop()
    // {
    //     return $this->belongsTo(Shop::class);
    // }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}
