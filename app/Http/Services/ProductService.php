<?php

namespace App\Http\Services;

use App\Http\Contracts\ProductInterface;
use App\Http\Requests\ProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ProductService implements ProductInterface
{
    private const PER_PAGE_DEFAULT = 10;

    public function __construct(
        private readonly CloudinaryService $cloudinaryService
    ) {}

    /**
     * Get all products with pagination
     */
    public function index(Request $request): array
    {
        try {
            $perPage = $request->input('limit', self::PER_PAGE_DEFAULT);

            $products = Product::orderBy('created_at', 'desc')
                ->paginate($perPage);

            return $this->successResponse('Lấy danh sách sản phẩm thành công', $products);
        } catch (\Exception $e) {
            Log::error('Get products error: ' . $e->getMessage());
            return $this->errorResponse('Lỗi khi lấy danh sách sản phẩm');
        }
    }

    /**
     * Search products
     */
    public function search(Request $request): array
    {
        try {
            $perPage = $request->input('limit', self::PER_PAGE_DEFAULT);
            $query = Product::query();

            $query = $this->applyFilters($query, $request);

            $products = $query->orderBy('created_at', 'desc')->paginate($perPage);

            return $this->successResponse('Tìm kiếm sản phẩm thành công', $products);
        } catch (\Exception $e) {
            Log::error('Search products error: ' . $e->getMessage());
            return $this->errorResponse('Lỗi khi tìm kiếm sản phẩm');
        }
    }

    /**
     * Create new product
     */
    public function store(ProductRequest $request): array
    {
        try {
            $data = $request->validated();

            if ($request->hasFile('product_image')) {
                $imageResult = $this->handleImageUpload($request->file('product_image'));

                if (!$imageResult['success']) {
                    return $this->errorResponse($imageResult['message']);
                }

                $data['product_image'] = $imageResult['url'];
                $data['product_image_public_id'] = $imageResult['public_id'];
            }

            $data['product_id'] = $this->generateProductId($data['product_name']);

            $product = Product::create($data);

            return $this->successResponse('Thêm sản phẩm thành công', new ProductResource($product));
        } catch (\Exception $e) {
            Log::error('Create product error: ' . $e->getMessage());
            return $this->errorResponse('Lỗi khi thêm sản phẩm: ' . $e->getMessage());
        }
    }

    /**
     * Update product
     */
    public function update(string $id, ProductRequest $request): array
    {
        try {
            $product = Product::findOrFail($id);
            $data = $request->validated();

            if ($request->hasFile('product_image')) {
                // Delete old image from Cloudinary if exists
                if ($product->product_image_public_id) {
                    $this->cloudinaryService->deleteImage($product->product_image_public_id);
                }

                $imageResult = $this->handleImageUpload($request->file('product_image'));

                if (!$imageResult['success']) {
                    return $this->errorResponse($imageResult['message']);
                }

                $data['product_image'] = $imageResult['url'];
                $data['product_image_public_id'] = $imageResult['public_id'];
            }

            $product->update($data);

            return $this->successResponse('Cập nhật sản phẩm thành công', new ProductResource($product));
        } catch (\Exception $e) {
            Log::error('Update product error: ' . $e->getMessage());
            return $this->errorResponse('Lỗi khi cập nhật sản phẩm: ' . $e->getMessage());
        }
    }

    /**
     * Delete product
     */
    public function destroy(string $id): array
    {
        try {
            $product = Product::findOrFail($id);

            if ($product->product_image_public_id) {
                $this->cloudinaryService->deleteImage($product->product_image_public_id);
            }

            $product->delete();

            return $this->successResponse('Xóa sản phẩm thành công', null);
        } catch (\Exception $e) {
            Log::error('Delete product error: ' . $e->getMessage());
            return $this->errorResponse('Lỗi khi xóa sản phẩm: ' . $e->getMessage());
        }
    }

    /**
     * Apply filters to query
     */
    private function applyFilters($query, Request $request)
    {
        // Search by product ID
        if ($request->filled('search_product_id')) {
            $query->where('product_id', 'like', '%' . $request->search_product_id . '%');
        }

        // Search by product name
        if ($request->filled('search_product_name')) {
            $query->where('product_name', 'like', '%' . $request->search_product_name . '%');
        }

        // Filter by price range
        if ($request->filled('search_price_from')) {
            $query->where('product_price', '>=', $request->search_price_from);
        }

        if ($request->filled('search_price_to')) {
            $query->where('product_price', '<=', $request->search_price_to);
        }

        // Filter by sales status
        if ($request->filled('search_is_sales')) {
            $query->where('is_sales', $request->search_is_sales);
        }

        return $query;
    }

    /**
     * Handle image upload to Cloudinary
     */
    private function handleImageUpload($file): array
    {
        return $this->cloudinaryService->uploadImage($file, 'products');
    }

    private function generateProductId(string $productName): string
    {
        $firstLetter = strtoupper(mb_substr($productName, 0, 1));

        $lastProduct = Product::where('product_id', 'like', $firstLetter . '%')
            ->orderBy('product_id', 'desc')
            ->first();

        if ($lastProduct) {
            $lastNumber = (int) substr($lastProduct->product_id, 1);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return $firstLetter . str_pad($newNumber, 9, '0', STR_PAD_LEFT);
    }

    /**
     * Success response format
     */
    private function successResponse(string $message, $data): array
    {
        return [
            'success' => true,
            'message' => $message,
            'pagination' => [
                'data' => $data instanceof \Illuminate\Pagination\LengthAwarePaginator
                    ? ProductResource::collection($data->items())
                    : ($data ? [$data] : null),
                'current_page' => $data instanceof \Illuminate\Pagination\LengthAwarePaginator ? $data->currentPage() : null,
                'per_page' => $data instanceof \Illuminate\Pagination\LengthAwarePaginator ? $data->perPage() : null,
                'total' => $data instanceof \Illuminate\Pagination\LengthAwarePaginator ? $data->total() : null,
                'last_page' => $data instanceof \Illuminate\Pagination\LengthAwarePaginator ? $data->lastPage() : null,
            ],
            'status' => 200,
        ];
    }

    /**
     * Error response format
     */
    private function errorResponse(string $message, int $status = 500): array
    {
        return [
            'success' => false,
            'message' => $message,
            'status' => $status,
        ];
    }
}
