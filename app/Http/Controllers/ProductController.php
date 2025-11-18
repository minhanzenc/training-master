<?php

namespace App\Http\Controllers;

use App\Http\Contracts\ProductInterface;
use App\Http\Requests\ProductRequest;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    protected ProductInterface $productService;

    /**
     * Summary of __construct
     * @param \App\Http\Contracts\ProductInterface $productService
     */
    public function __construct(ProductInterface $productService)
    {
        $this->productService = $productService;
    }

    /**
     * Summary of index
     * @param \Illuminate\Http\Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $result = $this->productService->index($request);
        return response()->json($result, $result['status']);
    }

    /**
     * Summary of search
     * @param \Illuminate\Http\Request $request
     * @return JsonResponse
     */
    public function search(Request $request): JsonResponse
    {
        $result = $this->productService->search($request);
        return response()->json($result, $result['status']);
    }

    /**
     * Summary of store
     * @param \App\Http\Requests\ProductRequest $request
     * @return JsonResponse
     */
    public function store(ProductRequest $request): JsonResponse
    {
        $result = $this->productService->store($request);
        return response()->json($result, $result['status']);
    }

    public function edit(Product $product): JsonResponse
    {
        $result = $this->productService->edit($product);
        return response()->json($result, $result['status']);
    }

    /**
     * Summary of update
     * @param string $id
     * @param \App\Http\Requests\ProductRequest $request
     * @return JsonResponse
     */
    public function update(ProductRequest $request, Product $product): JsonResponse
    {
        $result = $this->productService->update($request, $product);
        return response()->json($result, $result['status']);
    }

    /**
     * Summary of destroy
     * @param string $id
     * @return JsonResponse
     */
    public function destroy(string $id): JsonResponse
    {
        $result = $this->productService->destroy($id);
        return response()->json($result, $result['status']);
    }
}
