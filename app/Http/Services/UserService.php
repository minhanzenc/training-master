<?php

namespace App\Http\Services;

use App\Helpers\PaginationHelper;
use App\Http\Contracts\UserInterface;
use App\Http\Requests\CreateUserRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Symfony\Component\HttpFoundation\Response;

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

    /**
     * Summary of index
     * @param \Illuminate\Http\Request $request
     * @return array
     */
    public function index(Request $request): array
    {
        try {
            $query = $this->baseQuery();
            $users = PaginationHelper::paginate($query, $request);

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
            $users = PaginationHelper::paginate($query, $request);

            return $this->successResponse('Tìm kiếm người dùng thành công', $users);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }

    public function store(CreateUserRequest $request): array
    {
        try {
            $user = User::create($request->validated());
            return $this->successResponse('Tạo người dùng thành công', $user);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }

    public function update(Request $request, User $user): array
    {
        try {
            $user->update($request->validated());
            return $this->successResponse('Cập nhật người dùng thành công', $user);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }

    /**
     * Summary of destroy
     * @param \App\Models\User $user
     * @return array
     */
    public function destroy(User $user): array
    {
        try {
            $user->is_delete = 1;
            $user->save();
            return $this->successResponse('Xóa người dùng thành công', null);
        } catch (\Exception $e) {
            return $this->errorResponse($e->getMessage());
        }
    }

    /**
     * Summary of lock
     * @param \App\Models\User $user
     * @return array
     */
    public function lock(User $user): array
    {
        try {
            $user->is_active = !$user->is_active;
            $user->save();
            return $this->successResponse('Thay đổi trạng thái người dùng thành công', $user);
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
