<?php

use App\Http\Controllers\LoginController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

Route::post('/login', [LoginController::class, 'login']);
Route::post('/logout', [LoginController::class, 'logout']);
Route::get('/me', [LoginController::class, 'me']);

Route::prefix('admin')->middleware('auth:sanctum')->group(function () {
    // User Management
    Route::apiResources([
        'users' => UserController::class,
    ]);
    Route::post('users/search', [UserController::class, 'search']);
    Route::post('users/lock', [UserController::class, 'lockUser']);
});
