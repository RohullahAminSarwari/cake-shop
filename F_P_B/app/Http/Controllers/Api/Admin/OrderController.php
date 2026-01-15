<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with(['user', 'items.product.images']);
        
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        if ($request->has('limit')) {
            $orders = $query->latest()->limit($request->limit)->get();
        } else {
            $orders = $query->latest()->get();
        }
        
        return response()->json($orders);
    }
    
    public function show($id)
    {
        $order = Order::with(['user', 'items.product.images', 'payment', 'shipment'])
            ->findOrFail($id);
        
        return response()->json($order);
    }
    
    public function update(Request $request, $id)
    {
        $order = Order::findOrFail($id);
        
        $request->validate([
            'status' => 'sometimes|in:pending,processing,completed,cancelled',
            'payment_status' => 'sometimes|in:pending,paid,failed',
        ]);
        
        $order->update($request->only(['status', 'payment_status']));
        
        $order->load(['user', 'items.product.images', 'payment', 'shipment']);
        
        return response()->json($order);
    }
    
    public function stats()
    {
        $stats = [
            'totalUsers' => \App\Models\User::count(),
            'totalProducts' => \App\Models\Product::count(),
            'totalOrders' => Order::count(),
            'totalRevenue' => Order::where('status', 'completed')->sum('total_price'),
        ];
        
        return response()->json($stats);
    }
}
