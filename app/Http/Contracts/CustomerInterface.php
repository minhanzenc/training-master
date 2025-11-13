<?php

namespace App\Http\Contracts;

use App\Http\Requests\CreateCustomerRequest;
use App\Http\Requests\ImportCsvRequest;
use App\Models\Customer;
use Illuminate\Http\Request;

interface CustomerInterface
{
    public function index(Request $request): array;
    public function search(Request $request): array;
    public function store(CreateCustomerRequest $request): array;
    public function update(Request $request, Customer $customer): array;
    public function destroy(Customer $customer): array;
    public function importCsv(ImportCsvRequest $request): array;
    public function exportCsv(Request $request): array;
}
