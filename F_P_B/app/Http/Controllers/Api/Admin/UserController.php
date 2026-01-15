<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class UserController extends Controller
{
    public function index()
    {
        return response()->json(User::latest()->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:admin,seller,customer',
        ]);
        
        $user = User::create([
            'name'=>$request->name,
            'email'=>$request->email,
            'password'=>Hash::make($request->password),
            'role'=>$request->role
        ]);

        return response()->json($user, 201);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,'.$id,
            'password' => 'sometimes|required|string|min:8',
            'role' => 'sometimes|required|in:admin,seller,customer',
        ]);
        
        if ($request->has('password')) {
            $request->merge(['password' => Hash::make($request->password)]);
        }
        
        $user->update($request->except(['password']) + ($request->has('password') ? ['password' => Hash::make($request->password)] : []));

        return response()->json($user);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        
        // Prevent admin from deleting themselves
        if (auth()->id() == $user->id) {
            return response()->json(['message' => 'You cannot delete yourself'], 400);
        }
        
        $user->delete();
        
        return response()->json(['message'=>'User deleted successfully']);
    }
}
