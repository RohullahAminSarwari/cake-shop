<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();
        $query = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc');

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filter unread only
        if ($request->has('unread') && $request->unread) {
            $query->where('is_read', false);
        }

        $notifications = $query->paginate(20);

        return response()->json($notifications);
    }

    public function markAsRead($id)
    {
        $notification = Notification::findOrFail($id);
        
        // Check if notification belongs to user
        if ($notification->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $notification->is_read = true;
        $notification->save();

        return response()->json($notification);
    }

    public function markAllAsRead()
    {
        Notification::where('user_id', Auth::id())
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json(['message' => 'All notifications marked as read']);
    }

    public function getUnreadCount()
    {
        $count = Notification::where('user_id', Auth::id())
            ->where('is_read', false)
            ->count();

        return response()->json(['count' => $count]);
    }

    public function approveProduct(Request $request, $productId)
    {
        $product = Product::findOrFail($productId);
        
        if ($product->approval_status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Product is not pending approval'
            ], 400);
        }

        $product->approve(Auth::id());

        return response()->json([
            'success' => true,
            'message' => 'Product approved successfully',
            'data' => $product->fresh()
        ]);
    }

    public function rejectProduct(Request $request, $productId)
    {
        $request->validate([
            'reason' => 'required|string|max:500'
        ]);

        $product = Product::findOrFail($productId);
        
        if ($product->approval_status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Product is not pending approval'
            ], 400);
        }

        $product->reject($request->reason);

        return response()->json([
            'success' => true,
            'message' => 'Product rejected successfully',
            'data' => $product->fresh()
        ]);
    }

    public function getPendingProducts()
    {
        $products = Product::with(['category', 'user'])
            ->pending()
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $products
        ]);
    }

    public function delete($id)
    {
        $notification = Notification::findOrFail($id);
        
        // Check if notification belongs to user
        if ($notification->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $notification->delete();

        return response()->json(['message' => 'Notification deleted']);
    }
}
