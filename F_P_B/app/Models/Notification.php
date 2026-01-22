<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'title',
        'message',
        'notifiable_type',
        'notifiable_id',
        'data',
        'is_read',
    ];

    protected $casts = [
        'data' => 'array',
        'is_read' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function notifiable(): MorphTo
    {
        return $this->morphTo();
    }

    // Scopes for different notification types
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    // Mark as read
    public function markAsRead()
    {
        $this->update(['is_read' => true]);
    }

    // Create notification helper methods
    public static function createProductPending($product)
    {
        $admins = User::where('role', 'admin')->get();
        
        foreach ($admins as $admin) {
            self::create([
                'user_id' => $admin->id,
                'type' => 'product_pending',
                'title' => 'New Product Pending Approval',
                'message' => "Product '{$product->name}' is pending approval.",
                'notifiable_type' => Product::class,
                'notifiable_id' => $product->id,
                'data' => [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'user_id' => $product->user_id ?? null,
                ],
            ]);
        }
    }

    public static function createProductApproved($product)
    {
        if ($product->user_id) {
            self::create([
                'user_id' => $product->user_id,
                'type' => 'product_approved',
                'title' => 'Product Approved',
                'message' => "Your product '{$product->name}' has been approved.",
                'notifiable_type' => Product::class,
                'notifiable_id' => $product->id,
                'data' => [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                ],
            ]);
        }
    }

    public static function createProductRejected($product, $reason)
    {
        if ($product->user_id) {
            self::create([
                'user_id' => $product->user_id,
                'type' => 'product_rejected',
                'title' => 'Product Rejected',
                'message' => "Your product '{$product->name}' has been rejected.",
                'notifiable_type' => Product::class,
                'notifiable_id' => $product->id,
                'data' => [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'rejection_reason' => $reason,
                ],
            ]);
        }
    }

    public static function createCategoryPending($category)
    {
        $admins = User::where('role', 'admin')->get();
        
        foreach ($admins as $admin) {
            self::create([
                'user_id' => $admin->id,
                'type' => 'category_pending',
                'title' => 'New Category Pending Approval',
                'message' => "Category '{$category->name}' is pending approval.",
                'notifiable_type' => Category::class,
                'notifiable_id' => $category->id,
                'data' => [
                    'category_id' => $category->id,
                    'category_name' => $category->name,
                    'user_id' => $category->user_id ?? null,
                ],
            ]);
        }
    }

    public static function createCategoryApproved($category)
    {
        if ($category->user_id) {
            self::create([
                'user_id' => $category->user_id,
                'type' => 'category_approved',
                'title' => 'Category Approved',
                'message' => "Your category '{$category->name}' has been approved.",
                'notifiable_type' => Category::class,
                'notifiable_id' => $category->id,
                'data' => [
                    'category_id' => $category->id,
                    'category_name' => $category->name,
                ],
            ]);
        }
    }

    public static function createCategoryRejected($category, $reason)
    {
        if ($category->user_id) {
            self::create([
                'user_id' => $category->user_id,
                'type' => 'category_rejected',
                'title' => 'Category Rejected',
                'message' => "Your category '{$category->name}' has been rejected.",
                'notifiable_type' => Category::class,
                'notifiable_id' => $category->id,
                'data' => [
                    'category_id' => $category->id,
                    'category_name' => $category->name,
                    'rejection_reason' => $reason,
                ],
            ]);
        }
    }

    public static function createNewOrderNotification($productCreatorId, $orderId, $creatorInfo)
    {
        self::create([
            'user_id' => $productCreatorId,
            'type' => 'new_order',
            'title' => 'New Order Received',
            'message' => "You've received a new order for your products! Total: ${$creatorInfo['total_amount']} for {$creatorInfo['product_count']} items.",
            'notifiable_type' => 'App\Models\Order',
            'notifiable_id' => $orderId,
            'data' => [
                'order_id' => $orderId,
                'total_amount' => $creatorInfo['total_amount'],
                'product_count' => $creatorInfo['product_count'],
            ],
        ]);
    }
}
