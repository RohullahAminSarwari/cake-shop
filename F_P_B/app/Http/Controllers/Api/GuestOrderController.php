<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GuestOrder;
use App\Models\GuestOrderItem;
use App\Models\Product;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;

class GuestOrderController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'guest_info.name' => 'required|string|max:255',
            'guest_info.email' => 'required|email|max:255',
            'guest_info.phone' => 'required|string|max:20',
            'guest_info.address' => 'required|string|max:500',
            'guest_info.city' => 'required|string|max:100',
            'guest_info.postal_code' => 'required|string|max:20',
            'guest_info.notes' => 'nullable|string|max:1000',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'subtotal' => 'required|numeric|min:0',
            'tax' => 'required|numeric|min:0',
            'total' => 'required|numeric|min:0',
        ]);

        try {
            DB::beginTransaction();

            // Create guest order
            $guestOrder = GuestOrder::create([
                'order_number' => 'GO-' . strtoupper(uniqid()),
                'guest_name' => $request->guest_info['name'],
                'guest_email' => $request->guest_info['email'],
                'guest_phone' => $request->guest_info['phone'],
                'guest_address' => $request->guest_info['address'],
                'guest_city' => $request->guest_info['city'],
                'guest_postal_code' => $request->guest_info['postal_code'],
                'guest_notes' => $request->guest_info['notes'] ?? null,
                'subtotal' => $request->subtotal,
                'tax' => $request->tax,
                'total' => $request->total,
                'status' => 'pending',
            ]);

            // Create order items and group by product creator
            $creatorOrders = [];
            foreach ($request->items as $item) {
                $product = Product::find($item['product_id']);
                
                GuestOrderItem::create([
                    'guest_order_id' => $guestOrder->id,
                    'product_id' => $item['product_id'],
                    'product_name' => $item['product_name'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'total' => $item['total'],
                ]);

                // Group by creator for notifications
                $creatorId = $product->user_id;
                if (!isset($creatorOrders[$creatorId])) {
                    $creatorOrders[$creatorId] = [
                        'creator_id' => $creatorId,
                        'items' => [],
                        'total' => 0
                    ];
                }
                $creatorOrders[$creatorId]['items'][] = $item;
                $creatorOrders[$creatorId]['total'] += $item['total'];
            }

            // Send notifications to product creators
            foreach ($creatorOrders as $creatorOrder) {
                $this->notifyProductCreator($guestOrder, $creatorOrder);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'order_id' => $guestOrder->id,
                'order_number' => $guestOrder->order_number,
                'message' => 'Guest order placed successfully'
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to place order: ' . $e->getMessage()
            ], 500);
        }
    }

    private function notifyProductCreator($guestOrder, $creatorOrder)
    {
        try {
            $creator = User::find($creatorOrder['creator_id']);
            
            if (!$creator) {
                return;
            }

            // Create notification for product creator
            $notification = Notification::create([
                'user_id' => $creatorOrder['creator_id'],
                'notifiable_type' => 'App\Models\User',
                'notifiable_id' => $creatorOrder['creator_id'],
                'type' => 'guest_order',
                'title' => '🎂 New Guest Order Received',
                'message' => "You have a new guest order #{$guestOrder->order_number} for \${$creatorOrder['total']}. Customer: {$guestOrder->guest_name}",
                'data' => [
                    'type' => 'guest_order',
                    'order_id' => $guestOrder->id,
                    'order_number' => $guestOrder->order_number,
                    'guest_name' => $guestOrder->guest_name,
                    'guest_email' => $guestOrder->guest_email,
                    'guest_phone' => $guestOrder->guest_phone,
                    'guest_address' => $guestOrder->guest_address,
                    'guest_city' => $guestOrder->guest_city,
                    'guest_postal_code' => $guestOrder->guest_postal_code,
                    'guest_notes' => $guestOrder->guest_notes,
                    'items' => $creatorOrder['items'],
                    'total' => $creatorOrder['total']
                ],
                'is_read' => false
            ]);

            // Send email notification (if email service is configured)
            $this->sendEmailNotification($creator, $guestOrder, $creatorOrder);

            // Log the notification for debugging
            \Log::info('Guest order notification created', [
                'notification_id' => $notification->id,
                'creator_id' => $creatorOrder['creator_id'],
                'order_number' => $guestOrder->order_number,
                'guest_email' => $guestOrder->guest_email
            ]);

        } catch (\Exception $e) {
            // Log error but don't fail the order
            \Log::error('Failed to send notification to creator: ' . $e->getMessage());
        }
    }

    private function sendEmailNotification($creator, $guestOrder, $creatorOrder)
    {
        try {
            // This would integrate with an email service like SendGrid, Mailgun, etc.
            // For now, we'll just log the email content
            $emailData = [
                'to' => $creator->email,
                'subject' => "New Guest Order - {$guestOrder->order_number}",
                'guest_name' => $guestOrder->guest_name,
                'guest_email' => $guestOrder->guest_email,
                'guest_phone' => $guestOrder->guest_phone,
                'guest_address' => $guestOrder->guest_address,
                'guest_city' => $guestOrder->guest_city,
                'guest_postal_code' => $guestOrder->guest_postal_code,
                'guest_notes' => $guestOrder->guest_notes,
                'order_number' => $guestOrder->order_number,
                'items' => $creatorOrder['items'],
                'total' => $creatorOrder['total']
            ];

            // Log email data for debugging
            \Log::info('Guest order email notification', $emailData);

            // Uncomment below when email service is configured
            /*
            Mail::send('emails.guest-order', $emailData, function($message) use ($creator, $guestOrder) {
                $message->to($creator->email)
                        ->subject("New Guest Order - {$guestOrder->order_number}");
            });
            */

        } catch (\Exception $e) {
            \Log::error('Failed to send email notification: ' . $e->getMessage());
        }
    }

    public function index(Request $request)
    {
        // Admin can view all guest orders
        if ($request->user() && $request->user()->role === 'admin') {
            $orders = GuestOrder::with('items.product')
                ->orderBy('created_at', 'desc')
                ->paginate(20);
        } 
        // Product creators can view guest orders for their products
        elseif ($request->user()) {
            $orders = GuestOrder::whereHas('items.product', function($query) use ($request) {
                $query->where('user_id', $request->user()->id);
            })
            ->with(['items' => function($query) use ($request) {
                $query->whereHas('product', function($subQuery) use ($request) {
                    $subQuery->where('user_id', $request->user()->id);
                });
            }, 'items.product'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);
        } else {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        return response()->json($orders);
    }

    public function show(Request $request, $id)
    {
        $order = GuestOrder::with('items.product')->findOrFail($id);

        // Check permissions
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Admin can view all orders
        if ($request->user()->role === 'admin') {
            return response()->json($order);
        }

        // Product creators can only view orders for their products
        $hasAccess = $order->items->contains(function($item) use ($request) {
            return $item->product && $item->product->user_id === $request->user()->id;
        });

        if (!$hasAccess) {
            return response()->json(['message' => 'Access denied'], 403);
        }

        return response()->json($order);
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,processing,shipped,delivered,cancelled'
        ]);

        $order = GuestOrder::findOrFail($id);

        // Check permissions
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Admin can update all orders
        if ($request->user()->role !== 'admin') {
            // Product creators can only update orders for their products
            $hasAccess = $order->items->contains(function($item) use ($request) {
                return $item->product && $item->product->user_id === $request->user()->id;
            });

            if (!$hasAccess) {
                return response()->json(['message' => 'Access denied'], 403);
            }
        }

        $order->status = $request->status;
        $order->save();

        return response()->json([
            'message' => 'Order status updated successfully',
            'order' => $order
        ]);
    }
}
