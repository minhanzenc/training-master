<?php

namespace App\Http\Services;

use App\Helpers\PaginationHelper;
use App\Http\Contracts\CustomerInterface;
use App\Http\Requests\CreateCustomerRequest;
use App\Http\Requests\ImportCsvRequest;
use App\Models\Customer;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Symfony\Component\HttpFoundation\Response;

class CustomerService implements CustomerInterface
{
    private const SELECT_FIELDS = [
        'customer_id',
        'customer_name',
        'email',
        'tel_num',
        'address',
        'is_active',
        'created_at',
        'updated_at'
    ];

    private const PAGINATION_SMALL_SIZE = 10;

    public function __construct(
        private readonly CustomerImportService $importService,
        private readonly CustomerExportService $exportService
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
            $customers = PaginationHelper::paginate($query, $request);

            return $this->successResponse('Lấy danh sách khách hàng thành công', $customers);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage());
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
            $query = $this->applyFilters($query, $request->only(['search_name', 'search_email', 'search_address', 'search_is_active']));
            $customers = PaginationHelper::paginate($query, $request);

            return $this->successResponse('Tìm kiếm khách hàng thành công', $customers);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }

    public function store(CreateCustomerRequest $request): array
    {
        try {
            $customer = Customer::create($request->validated());
            return $this->successResponse('Tạo khách hàng thành công', $customer);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }

    public function update(Request $request, Customer $customer): array
    {
        try {
            $customer->update($request->all());
            return $this->successResponse('Cập nhật khách hàng thành công', $customer);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }

    /**
     * Summary of destroy
     * @param \App\Models\Customer $customer
     * @return array
     */
    public function destroy(Customer $customer): array
    {
        try {
            $customer->delete();
            return $this->successResponse('Xóa khách hàng thành công', null);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }

    /**
     * Import customers from CSV file
     * 
     * @param ImportCsvRequest $request
     * @return array
     */
    public function importCsv(ImportCsvRequest $request): array
    {
        try {
            $file = $request->file('file');

            if (!$file || !$file->isValid()) {
                return $this->errorResponse('File không hợp lệ');
            }

            $result = $this->importService->import($file);

            if (!$result['success']) {
                return [
                    'success' => false,
                    'message' => $result['message'],
                    'data' => $result['data'],
                    'errorFilename' => $result['errorFilename'] ?? '',
                    'status' => Response::HTTP_UNPROCESSABLE_ENTITY
                ];
            }

            return $this->successResponse($result['message'], $result['data']);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }

    /**
     * Export customers to CSV
     * 
     * @param Request $request
     * @return array
     */
    public function exportCsv(Request $request): array
    {
        try {
            $query = $this->baseQuery();

            $filters = $request->only(['search_name', 'search_email', 'search_address', 'search_is_active']);
            $hasFilters = !empty(array_filter($filters, fn($value) => $value !== null && $value !== ''));

            if ($hasFilters) {
                $query = $this->applyFilters($query, $filters);
                $customers = $query->get();
            } else {
                $customers = $query->paginate(
                    $request->input('limit', self::PAGINATION_SMALL_SIZE),
                )->items();
            }

            $result = $this->exportService->export($customers);

            if (!$result['success']) {
                return [
                    'success' => false,
                    'message' => $result['message'],
                    'data' => null,
                    'status' => Response::HTTP_INTERNAL_SERVER_ERROR
                ];
            }

            return [
                'success' => true,
                'message' => $result['message'],
                'data' => [
                    'filename' => $result['filename'],
                    'total_exported' => count($customers),
                ],
                'status' => Response::HTTP_OK
            ];
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }

    /**
     * Summary of baseQuery
     * @return \Illuminate\Database\Eloquent\Builder
     */
    private function baseQuery(): Builder
    {
        return Customer::select(self::SELECT_FIELDS);
    }

    /**
     * Summary of applyFilters
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param array $filters
     * @return Builder
     */
    private function applyFilters(Builder $query, array $filters): Builder
    {
        return $query
            ->when(
                !empty($filters['search_name']),
                fn($q) =>
                $q->where('customer_name', 'like', '%' . $filters['search_name'] . '%')
            )
            ->when(
                !empty($filters['search_email']),
                fn($q) =>
                $q->where('email', 'like', '%' . $filters['search_email'] . '%')
            )
            ->when(
                !empty($filters['search_address']),
                fn($q) =>
                $q->where('address', 'like', '%' . $filters['search_address'] . '%')
            )
            ->when(
                isset($filters['search_is_active']),
                fn($q) =>
                $q->where('is_active', $filters['search_is_active'])
            );
    }

    /**
     * Summary of successResponse
     * @param string $message
     * @param mixed $data
     * @return array{message: string, pagination: JsonResource, status: int, success: bool}
     */
    private function successResponse(string $message, $data): array
    {
        return [
            'success' => true,
            'message' => $message,
            'pagination' => new JsonResource($data),
            'status' => Response::HTTP_OK
        ];
    }

    /**
     * Summary of errorResponse
     * @param string $message
     * @param int $status
     * @return array{message: string, status: int, success: bool}
     */
    private function errorResponse(string $message, int $status = 500): array
    {
        return [
            'success' => false,
            'message' => $message,
            'status' => $status
        ];
    }
}
