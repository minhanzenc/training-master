<?php

namespace App\Helpers;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

class PaginationHelper
{
    private const PAGINATION_SMALL_THRESHOLD = 20;
    private const PAGINATION_LARGE_THRESHOLD = 100;
    private const PAGINATION_SMALL_SIZE = 10;
    private const PAGINATION_LARGE_SIZE = 20;

    /**
     * Paginate query based on total records with automatic page size adjustment
     * 
     * @param Builder $query
     * @param Request $request
     * @return LengthAwarePaginator
     */
    public static function paginate(Builder $query, Request $request): LengthAwarePaginator
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
     * Simple paginate with fixed per page size
     * 
     * @param Builder $query
     * @param Request $request
     * @param int $defaultPerPage
     * @return LengthAwarePaginator
     */
    public static function simplePaginate(Builder $query, Request $request, int $defaultPerPage = self::PAGINATION_SMALL_SIZE): LengthAwarePaginator
    {
        $perPage = $request->input('limit', $defaultPerPage);
        return $query->paginate($perPage);
    }
}
