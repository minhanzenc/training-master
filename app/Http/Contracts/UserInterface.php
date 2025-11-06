<?php

namespace App\Http\Contracts;

use App\Http\Requests\CreateUserRequest;
use App\Models\User;
use Illuminate\Http\Request;

interface UserInterface
{
    public function index(Request $request): array;

    public function store(CreateUserRequest $request): array;

    public function update(Request $request, User $user): array;

    public function destroy(User $user): array;
}