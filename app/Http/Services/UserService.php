<?php

namespace App\Http\Services;
use App\Http\Contracts\UserInterface;
use App\Http\Requests\CreateUserRequest;
use App\Models\User;
use Illuminate\Http\Request;

class UserService implements UserInterface{
    public function index(Request $request): array
    {
        // Implement login logic here
        return [];
    }

    public function store(CreateUserRequest $request): array
    {
        // Implement registration logic here
        return [];
    }

    public function update(Request $request, User $user): array
    {
        // Implement user update logic here
        return [];
    }

    public function destroy(User $user): array
    {
        // Implement user deletion logic here
        return [];
    }
}