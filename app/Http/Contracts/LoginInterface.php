<?php

namespace App\Http\Contracts;

use App\Http\Requests\LoginRequest;
use Illuminate\Http\Request;

interface LoginInterface
{
    public function login(LoginRequest $request): array;

    public function logout(Request $request): array;
}
