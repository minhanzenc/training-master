<?php

namespace App\Http\Controllers;

use App\Http\Contracts\UserInterface;
use App\Http\Requests\CreateUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    protected UserInterface $userService;

    public function __construct(UserInterface $userService)
    {
        $this->userService = $userService;
    }
    public function index(Request $request)
    {
        $result = $this->userService->index($request);

        return response()->json($result, $result['status']);
    }

    public function search(Request $request)
    {
        $result = $this->userService->search($request);

        return response()->json($result, $result['status']);
    }
    public function store(CreateUserRequest $request)
    {
        $result = $this->userService->store($request);

        return response()->json($result, $result['status']);
    }
    public function update(UpdateUserRequest $request, User $user)
    {
        $result = $this->userService->update($request, $user);
        return response()->json($result, $result['status']);
    }
    public function destroy(User $user)
    {
        $result = $this->userService->destroy($user);

        return response()->json($result, $result['status']);
    }

    public function lock(User $user)
    {
        $result = $this->userService->lock($user);

        return response()->json($result, $result['status']);
    }
}
