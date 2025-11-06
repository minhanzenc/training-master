<?php

use App\Http\Controllers\LoginController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

Route::post('/login', [LoginController::class, 'login']);
Route::post('/logout', [LoginController::class, 'logout']);
Route::get('/me', [LoginController::class, 'me']);

Route::prefix('admin')->group(function () {
    Route::apiResources([
        'users' => UserController::class,
    ]);
})->middleware('auth:sanctum');
