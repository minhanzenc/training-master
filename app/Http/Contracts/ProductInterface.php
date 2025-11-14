<?php

namespace App\Http\Contracts;

use App\Http\Requests\ProductRequest;
use Illuminate\Http\Request;

interface ProductInterface
{
    public function index(Request $request): array;

    public function search(Request $request): array;

    public function store(ProductRequest $request): array;

    public function update(string $id, ProductRequest $request): array;

    public function destroy(string $id): array;
}
