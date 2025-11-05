<?php

use App\Http\Controllers\LoginController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

Route::post('/login', [LoginController::class, 'login']);
Route::post('/logout', [LoginController::class, 'logout']);

Route::get('/me', function (Request $request) {
    if (Auth::check()) {
        return response()->json([
            'success' => true,
            'user' => new \App\Http\Resources\UserResource(Auth::user()),
        ]);
    }
    
    return response()->json([
        'success' => false,
        'message' => 'Unauthenticated',
    ], 401);
});

Route::get('/debug-session', function (Request $request) {
    return response()->json([
        'session_id' => session()->getId(),
        'all_session_data' => $request->session()->all(),
    ]);
})->middleware(['web']);
