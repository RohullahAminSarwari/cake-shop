<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Product extends Model
{
    use HasFactory;
   
    protected $fillable = [
        'category_id','name','description',
        'price','discount_price','stock','status',
        'approval_status','rejection_reason','approved_by','approved_at','user_id'
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

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function notifications()
    {
        return $this->morphMany(Notification::class, 'notifiable');
    }

    // Scopes for approval status
    public function scopePending($query)
    {
        return $query->where('approval_status', 'pending');
    }

    public function scopeApproved($query)
    {
        return $query->where('approval_status', 'approved');
    }

    public function scopeRejected($query)
    {
        return $query->where('approval_status', 'rejected');
    }

    // Check if product is approved
    public function isApproved()
    {
        return $this->approval_status === 'approved';
    }

    // Approve product
    public function approve($adminId)
    {
        $this->update([
            'approval_status' => 'approved',
            'approved_by' => $adminId,
            'approved_at' => now(),
            'rejection_reason' => null,
        ]);

        // Create notification for product owner
        Notification::createProductApproved($this);
    }

    // Reject product
    public function reject($reason)
    {
        $this->update([
            'approval_status' => 'rejected',
            'rejection_reason' => $reason,
        ]);

        // Create notification for product owner
        Notification::createProductRejected($this, $reason);
    }
}
