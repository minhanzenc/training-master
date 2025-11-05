<?php

namespace App\Http\Services;

use App\Http\Contracts\LoginInterface;
use App\Http\Requests\LoginRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Models\User;

class LoginService implements LoginInterface
{
    /**
     * 
     * @param LoginRequest $request
     * @return array
     */
    public function login(LoginRequest $request): array
    {
        $credentials = $request->only('email', 'password');
        $remember = $request->boolean('remember', false);
        
        if (Auth::attempt($credentials, $remember)) {
            $request->session()->regenerate();
            $user = Auth::user();
            if ($user) {
                $user->last_login_at = now();
                $user->last_login_ip = $request->ip();
                $user->save();
            }

            return [
                'success' => true,
                'message' => 'Đăng nhập thành công',
                'user' => new UserResource($user),
                'status' => 200
            ];
        }

        return [
            'success' => false,
            'message' => 'Email hoặc mật khẩu không hợp lệ',
            'status' => 401
        ];
    }

    /**
     * 
     * @param Request $request
     * @return array
     */
    public function logout(Request $request): array
    {
        Auth::logout();
        
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return [
            'success' => true,
            'message' => 'Logout successful',
            'status' => 200
        ];
    }
}
