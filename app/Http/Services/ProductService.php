<?php

namespace App\Http\Services;

use App\Helpers\PaginationHelper;
use App\Http\Contracts\ProductInterface;
use App\Http\Requests\ProductRequest;
use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class ProductService implements ProductInterface
{
    private const PER_PAGE_DEFAULT = 10;

    private const SELECT_FIELDS = [
        'product_id',
        'product_name',
        'description',
        'product_price',
        'product_image',
        'is_sales',
        'created_at',
        'updated_at'
    ];

    /**
     * Summary of __construct
     * @param \App\Http\Services\CloudinaryService $cloudinaryService
     */
    public function __construct(
        private readonly CloudinaryService $cloudinaryService
    ) {}

    /**
     * Summary of index
     * @param \Illuminate\Http\Request $request
     * @return array
     */
    public function index(Request $request): array
    {
        try {
            $query = $this->baseQuery();
            $products = PaginationHelper::paginate($query, $request);
            return $this->successResponse('Lấy danh sách sản phẩm thành công', $products);
        } catch (\Exception $e) {
            Log::error('Get products error: ' . $e->getMessage());
            return $this->errorResponse('Lỗi khi lấy danh sách sản phẩm');
        }
    }

    /**
     * Summary of search
     * @param \Illuminate\Http\Request $request
     * @return array
     */
    public function search(Request $request): array
    {
        try {
            $query = $this->baseQuery();

            $query = $this->applyFilters($query, $request->only(['search_product_name', 'search_price_from', 'search_price_to', 'search_is_sales']));

            $products = PaginationHelper::paginate($query, $request);

            return $this->successResponse('Tìm kiếm sản phẩm thành công', $products);
        } catch (\Exception $e) {
            Log::error('Search products error: ' . $e->getMessage());
            return $this->errorResponse('Lỗi khi tìm kiếm sản phẩm');
        }
    }

    /**
     * Summary of store
     * @param \App\Http\Requests\ProductRequest $request
     * @return array
     */
    public function store(ProductRequest $request): array
    {
        try {
            $data = $request->validated();
             $data['product_id'] = $this->generateProductId($data['product_name']);
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

            return $this->successResponse('Thêm sản phẩm thành công', $product);
        } catch (\Exception $e) {
            Log::error('Create product error: ' . $e->getMessage());
            return $this->errorResponse('Lỗi khi thêm sản phẩm: ' . $e->getMessage());
        }
    }

    /**
     * Summary of update
     * @param string $id
     * @param \App\Http\Requests\ProductRequest $request
     * @return array
     */

    public function edit(Product $product): array
    {
        try {
            return $this->successResponse('Lấy thông tin sản phẩm thành công', $product);
        } catch (\Exception $e) {
            Log::error('Edit product error: ' . $e->getMessage());
            return $this->errorResponse('Lỗi khi lấy thông tin sản phẩm: ' . $e->getMessage());
        }
    }
    public function update(ProductRequest $request, Product $product): array
    {
        try {
            $data = $request->validated();
            $oldProductId = strtoupper(mb_substr($product->product_id, 0, 1));
            $newProductId = strtoupper(mb_substr($data['product_name'], 0, 1));

            if ($request->hasFile('product_image')) {
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

            if ($oldProductId !== $newProductId) {
                $data['product_id'] = $this->generateProductId($data['product_name']);
            }

            $product->update($data);

            return $this->successResponse('Cập nhật sản phẩm thành công', $product);
        } catch (\Exception $e) {
            Log::error('Update product error: ' . $e->getMessage());
            return $this->errorResponse('Lỗi khi cập nhật sản phẩm: ' . $e->getMessage());
        }
    }

    /**
     * Summary of destroy
     * @param string $id
     * @return array
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
     * Summary of applyFilters
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Database\Eloquent\Builder
     */
    private function applyFilters(Builder $query, array $request): Builder
    {
        return $query
            ->when(
               !empty($request['search_product_name']),
                fn($q) => $q->where('product_name', 'like', '%' . $request['search_product_name'] . '%')
            )
            ->when(
               !empty($request['search_price_from']),
                fn($q) => $q->where('product_price', '>=', $request['search_price_from'])
            )
            ->when(
               !empty($request['search_price_to']),
                fn($q) => $q->where('product_price', '<=', $request['search_price_to'])
            )
            ->when(
               isset($request['search_is_sales']),
                fn($q) => $q->where('is_sales', $request['search_is_sales'])
            );
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

    private function baseQuery(): Builder
    {
        return Product::select(self::SELECT_FIELDS);
    }

    /**
     * Success response format
     */
    private function successResponse(string $message, $data): array
    {
        return [
            'success' => true,
            'message' => $message,
            'pagination' => new JsonResource($data),
            'status' => Response::HTTP_OK,
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
