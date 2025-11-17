<?php

namespace App\Http\Contracts;

use App\Http\Requests\ProductRequest;
use App\Models\Product;
use Illuminate\Http\Request;

interface ProductInterface
{
    public function index(Request $request): array;

    public function search(Request $request): array;

    public function store(ProductRequest $request): array;

    public function edit(Product $product): array;

    public function update(ProductRequest $request, Product $product): array;

    public function destroy(string $id): array;
}
