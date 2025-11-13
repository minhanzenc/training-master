<?php

use App\Http\Controllers\CustomerController;
use App\Http\Controllers\ImportProgressController;
use App\Http\Controllers\LoginController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

Route::post('/login', [LoginController::class, 'login']);
Route::post('/logout', [LoginController::class, 'logout']);
Route::get('/me', [LoginController::class, 'me']);

Route::prefix('admin')->middleware('auth:sanctum')->group(function () {
    Route::post('users/search', [UserController::class, 'search']);
    Route::post('users/{user}/lock', [UserController::class, 'lock']);

    Route::post('customers/search', [CustomerController::class, 'search']);
    Route::post('customers/import', [CustomerController::class, 'import']);
    Route::get('customers/import-progress/{importId}', [ImportProgressController::class, 'getProgress']);
    Route::get('customers/export', [CustomerController::class, 'export']);
    Route::get('customers/download-error/{filename}', [CustomerController::class, 'downloadErrorFile']);

    Route::apiResources([
        'users' => UserController::class,
        'customers' => CustomerController::class,
    ]);
});
