<?php

namespace App\Http\Controllers;

use App\Http\Contracts\UserInterface;
use App\Http\Requests\CreateUserRequest;
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
        dd($request->all());
        $result = $this->userService->store($request);

        return response()->json($result, $result['status']);
    }
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $result = $this->userService->update($request, $user);
        return response()->json($result, $result['status']);
    }
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $result = $this->userService->destroy($user);

        return response()->json($result, $result['status']);
    }
}
