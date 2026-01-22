<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserCategoryController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
            'description' => 'nullable|string|max:1000',
            'icon' => 'nullable|string|max:10',
            'status' => 'required|in:active,inactive',
        ]);
        
        $categoryData = $request->only([
            'name', 'description', 'icon', 'status'
        ]);
        
        // Set user_id and approval status
        $categoryData['user_id'] = Auth::id();
        $categoryData['approval_status'] = 'pending';
        
        $category = Category::create($categoryData);
        
        // Create notification for admins
        Notification::createCategoryPending($category);
        
        return response()->json([
            'success' => true,
            'message' => 'Category submitted for approval. It will be available once approved by an admin.',
            'data' => $category
        ], 201);
    }
    
    public function update(Request $request, $id)
    {
        $category = Category::where('user_id', Auth::id())->findOrFail($id);
        
        $request->validate([
            'name' => 'sometimes|required|string|max:255|unique:categories,name,' . $id,
            'description' => 'nullable|string|max:1000',
            'icon' => 'nullable|string|max:10',
            'status' => 'sometimes|required|in:active,inactive',
        ]);
        
        $category->update($request->only([
            'name', 'description', 'icon', 'status'
        ]));
        
        // If category was previously rejected, set back to pending
        if ($category->approval_status === 'rejected') {
            $category->update(['approval_status' => 'pending']);
            Notification::createCategoryPending($category);
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Category updated successfully.',
            'data' => $category
        ]);
    }
    
    public function destroy($id)
    {
        $category = Category::where('user_id', Auth::id())->findOrFail($id);
        
        // Only allow deletion of pending or rejected categories
        if ($category->approval_status === 'approved') {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete approved category. Please contact admin.'
            ], 403);
        }
        
        $category->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Category deleted successfully'
        ]);
    }
    
    public function myCategories(Request $request)
    {
        $query = Category::where('user_id', Auth::id());
        
        // Filter by approval status
        if ($request->has('approval_status')) {
            $query->where('approval_status', $request->approval_status);
        }
        
        $categories = $query->latest()->paginate($request->get('per_page', 15));
        
        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }
}
