<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use Illuminate\Http\Request;
use App\Http\Contracts\LoginInterface;
use Illuminate\Auth\Events\Login;
use Illuminate\Http\JsonResponse;

class LoginController extends Controller
{
    protected LoginInterface $loginService;

    public function __construct(LoginInterface $loginService)
    {
        $this->loginService = $loginService;
    }

    /**
     * 
     * @param LoginRequest $request
     * @return JsonResponse
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->loginService->login($request);
        
        return response()->json($result, $result['status']);
    }

    /**
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function logout(Request $request): JsonResponse
    {
        $result = $this->loginService->logout($request);
        
        return response()->json([
            'success' => $result['success'],
            'message' => $result['message'],
        ], $result['status']);
    }
}
