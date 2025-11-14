<?php

namespace App\Http\Controllers;

use App\Http\Contracts\ProductInterface;
use App\Http\Requests\ProductRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    protected ProductInterface $productService;

    public function __construct(ProductInterface $productService)
    {
        $this->productService = $productService;
    }

    /**
     * Get all products
     */
    public function index(Request $request): JsonResponse
    {
        $result = $this->productService->index($request);
        return response()->json($result, $result['success'] ? 200 : 500);
    }

    /**
     * Search products
     */
    public function search(Request $request): JsonResponse
    {
        $result = $this->productService->search($request);
        return response()->json($result, $result['success'] ? 200 : 500);
    }

    /**
     * Create new product
     */
    public function store(ProductRequest $request): JsonResponse
    {
        $result = $this->productService->store($request);
        return response()->json($result, $result['success'] ? 201 : 500);
    }

    /**
     * Update product
     */
    public function update(string $id, ProductRequest $request): JsonResponse
    {
        $result = $this->productService->update($id, $request);
        return response()->json($result, $result['success'] ? 200 : 500);
    }

    /**
     * Delete product
     */
    public function destroy(string $id): JsonResponse
    {
        $result = $this->productService->destroy($id);
        return response()->json($result, $result['success'] ? 200 : 500);
    }
}
