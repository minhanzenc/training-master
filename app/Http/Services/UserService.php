<?php

namespace App\Http\Services;

use App\Http\Contracts\UserInterface;
use App\Http\Requests\CreateUserRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Pagination\LengthAwarePaginator;

class UserService implements UserInterface
{
    private const SELECT_FIELDS = [
        'user_id',
        'name',
        'email',
        'group_role',
        'is_active',
        'last_login_at',
        'created_at',
        'updated_at'
    ];
    private const PAGINATION_SMALL_THRESHOLD = 20;
    private const PAGINATION_LARGE_THRESHOLD = 100;
    private const PAGINATION_SMALL_SIZE = 10;
    private const PAGINATION_LARGE_SIZE = 20;

    /**
     * Summary of index
     * @param \Illuminate\Http\Request $request
     * @return array
     */
    public function index(Request $request): array
    {
        try {
            $query = $this->baseQuery();
            $users = $this->paginateQuery($query, $request);

            return $this->successResponse('Lấy danh sách người dùng thành công', $users);
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
            $query = $this->applyFilters($query, $request->only(['search_name', 'search_email', 'search_group_role', 'search_is_active']));
            $users = $this->paginateQuery($query, $request);

            return $this->successResponse('Tìm kiếm người dùng thành công', $users);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }

    public function store(CreateUserRequest $request): array
    {
        // Implement registration logic here
        return [];
    }

    public function update(Request $request, User $user): array
    {
        // Implement user update logic here
        return [];
    }

    public function destroy(User $user): array
    {
        // Implement user deletion logic here
        return [];
    }

    public function lock(User $user): array
    {
        // Implement user lock logic here
        return [];
    }

    /**
     * Summary of baseQuery
     * @return \Illuminate\Database\Eloquent\Builder
     */
    private function baseQuery(): Builder
    {
        return User::select(self::SELECT_FIELDS);
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
                $q->where('name', 'like', '%' . $filters['search_name'] . '%')
            )
            ->when(
                !empty($filters['search_email']),
                fn($q) =>
                $q->where('email', 'like', '%' . $filters['search_email'] . '%')
            )
            ->when(
                !empty($filters['search_group_role']),
                fn($q) =>
                $q->where('group_role', $filters['search_group_role'])
            )
            ->when(
                isset($filters['search_is_active']),
                fn($q) =>
                $q->where('is_active', $filters['search_is_active'])
            );
    }

    /**
     * Summary of paginateQuery
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    private function paginateQuery(Builder $query, Request $request): LengthAwarePaginator
    {
        $total = $query->count();
        $perPage = $request->input('limit', self::PAGINATION_SMALL_SIZE);

        if ($total < self::PAGINATION_SMALL_THRESHOLD) {
            $perPage = $total;
        }

        if ($total > self::PAGINATION_LARGE_THRESHOLD) {
            $perPage = self::PAGINATION_LARGE_SIZE;
        }

        return $query->paginate($perPage);
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
            'status' => 200
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
