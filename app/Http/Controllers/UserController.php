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

    /**
     * Summary of __construct
     * @param \App\Http\Contracts\UserInterface $userService
     */
    public function __construct(UserInterface $userService)
    {
        $this->userService = $userService;
    }

    /**
     * Summary of index
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $result = $this->userService->index($request);

        return response()->json($result, $result['status']);
    }

    /**
     * Summary of search
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function search(Request $request)
    {
        $result = $this->userService->search($request);

        return response()->json($result, $result['status']);
    }

    /**
     * Summary of store
     * @param \App\Http\Requests\CreateUserRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(CreateUserRequest $request)
    {
        $result = $this->userService->store($request);

        return response()->json($result, $result['status']);
    }

    /**
     * Summary of update
     * @param \App\Http\Requests\UpdateUserRequest $request
     * @param \App\Models\User $user
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(UpdateUserRequest $request, User $user)
    {
        $result = $this->userService->update($request, $user);
        return response()->json($result, $result['status']);
    }

    /**
     * Summary of destroy
     * @param \App\Models\User $user
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy(User $user)
    {
        $result = $this->userService->destroy($user);

        return response()->json($result, $result['status']);
    }

    /**
     * Summary of lock
     * @param \App\Models\User $user
     * @return \Illuminate\Http\JsonResponse
     */
    public function lock(User $user)
    {
        $result = $this->userService->lock($user);

        return response()->json($result, $result['status']);
    }
}
