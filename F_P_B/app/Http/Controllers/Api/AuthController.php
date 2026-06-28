<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'sometimes|in:admin,seller'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role ?? 'seller', // Default to seller instead of customer
                'email_verified_at' => now(), // Auto-verify for demo purposes
            ]);

            // Create Sanctum token
            $token = $user->createToken('auth_token')->plainTextToken;

            // Get actual token expiration from Sanctum config
            $expirationMinutes = config('sanctum.expiration', 30);
            $expiresAt = now()->addMinutes($expirationMinutes);

            return response()->json([
                'success' => true,
                'message' => 'User registered successfully',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role,
                        'created_at' => $user->created_at,
                    ],
                    'token' => $token,
                    'token_type' => 'Bearer',
                    'expires_at' => $expiresAt->toIso8601String(),
                    'expires_in_minutes' => $expirationMinutes,
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Registration failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Login user and create token
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required',
            'remember' => 'sometimes|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Check if user exists
            $user = User::where('email', $request->email)->first();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid credentials',
                    'error_code' => 'INVALID_CREDENTIALS'
                ], 401);
            }

            // Check password
            if (!Hash::check($request->password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid credentials',
                    'error_code' => 'INVALID_CREDENTIALS'
                ], 401);
            }

            // Check if user is active/banned (you might add these fields to users table)
            if (method_exists($user, 'isBanned') && $user->isBanned()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Account is banned',
                    'error_code' => 'ACCOUNT_BANNED'
                ], 403);
            }

            // Revoke old tokens (optional - for single device login)
            // $user->tokens()->delete();

            // Create new token
            $tokenName = 'auth_token_' . now()->timestamp;
            $token = $user->createToken($tokenName)->plainTextToken;

            // Get actual token expiration from Sanctum config
            $expirationMinutes = config('sanctum.expiration', 30);
            $expiresAt = now()->addMinutes($expirationMinutes);

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role,
                        'last_login' => now(),
                    ],
                    'token' => $token,
                    'token_type' => 'Bearer',
                    'expires_at' => $expiresAt->toIso8601String(),
                    'expires_in_minutes' => $expirationMinutes,
                    'remember' => $request->remember ?? false,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Login failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Logout user and revoke token
     */
    public function logout(Request $request)
    {
        try {
            // Get current token
            $token = $request->user()->currentAccessToken();

            if ($token) {
                // Revoke current token
                $token->delete();
            }

            return response()->json([
                'success' => true,
                'message' => 'Logged out successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Logout failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Logout from all devices
     */
    public function logoutAll(Request $request)
    {
        try {
            // Revoke all tokens for the user
            $request->user()->tokens()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Logged out from all devices successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Logout from all devices failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get authenticated user profile
     */
    public function profile(Request $request)
    {
        try {
            $user = $request->user();

            return response()->json([
                'success' => true,
                'data' => [
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role,
                        'created_at' => $user->created_at,
                        'updated_at' => $user->updated_at,
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Refresh token
     */
    public function refresh(Request $request)
    {
        try {
            $user = $request->user();
            $currentToken = $user->currentAccessToken();

            // Delete current token
            if ($currentToken) {
                $currentToken->delete();
            }

            // Create new token
            $tokenName = 'auth_token_' . now()->timestamp;
            $newToken = $user->createToken($tokenName)->plainTextToken;

            // Get actual token expiration from Sanctum config
            $expirationMinutes = config('sanctum.expiration', 30);
            $expiresAt = now()->addMinutes($expirationMinutes);

            return response()->json([
                'success' => true,
                'message' => 'Token refreshed successfully',
                'data' => [
                    'token' => $newToken,
                    'token_type' => 'Bearer',
                    'expires_at' => $expiresAt->toIso8601String(),
                    'expires_in_minutes' => $expirationMinutes,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Token refresh failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Change password
     */
    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = $request->user();

            // Check current password
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Current password is incorrect',
                    'error_code' => 'INVALID_CURRENT_PASSWORD'
                ], 422);
            }

            // Update password
            $user->update([
                'password' => Hash::make($request->password)
            ]);

            // Optional: Revoke all tokens except current one
            // $user->tokens()->where('id', '!=', $user->currentAccessToken()->id)->delete();

            return response()->json([
                'success' => true,
                'message' => 'Password changed successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Password change failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send password reset link
     */
    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'No account found with that email address.',
            ], 404);
        }

        $existing = DB::table('password_reset_tokens')->where('email', $request->email)->first();
        if ($existing && now()->diffInSeconds($existing->created_at) < 60) {
            return response()->json([
                'success' => false,
                'message' => 'Please wait before requesting another reset link.',
            ], 429);
        }

        $token = Str::random(64);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            ['token' => Hash::make($token), 'created_at' => now()]
        );

        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
        $resetUrl = $frontendUrl . '/reset-password?token=' . $token . '&email=' . urlencode($request->email);

        try {
            Mail::send([], [], function ($message) use ($user, $resetUrl) {
                $message->to($user->email, $user->name)
                    ->subject('Reset Your Password - The Modern Patisserie')
                    ->html(
                        '<div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:40px 20px;">' .
                        '<h2 style="color:#7f3526;margin-bottom:8px;">Reset Your Password</h2>' .
                        '<p style="color:#574138;font-size:14px;line-height:1.6;">Hi ' . e($user->name) . ',</p>' .
                        '<p style="color:#574138;font-size:14px;line-height:1.6;">We received a request to reset your password. Click the button below to choose a new one:</p>' .
                        '<a href="' . $resetUrl . '" style="display:inline-block;background:#9a3d2b;color:#fff;text-decoration:none;padding:12px 32px;border-radius:12px;font-weight:600;font-size:14px;margin:20px 0;">Reset Password</a>' .
                        '<p style="color:#a98367;font-size:12px;margin-top:24px;">This link expires in 60 minutes. If you didn\'t request this, you can safely ignore this email.</p>' .
                        '</div>'
                    );
            });
        } catch (\Exception $e) {
            // Log the error but still return success so we don't leak info
        }

        return response()->json([
            'success' => true,
            'message' => 'If an account exists with that email, a password reset link has been sent.',
        ]);
    }

    /**
     * Reset password with token
     */
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$record) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired reset link.',
            ], 400);
        }

        if (now()->diffInMinutes($record->created_at) > 60) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json([
                'success' => false,
                'message' => 'This reset link has expired. Please request a new one.',
            ], 400);
        }

        if (!Hash::check($request->token, $record->token)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired reset link.',
            ], 400);
        }

        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'No account found.',
            ], 404);
        }

        $user->update(['password' => Hash::make($request->password)]);
        $user->tokens()->delete();
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Password has been reset successfully. You can now sign in.',
        ]);
    }
}
