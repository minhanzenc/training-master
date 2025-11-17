<?php

namespace App\Http\Controllers;

use App\Http\Contracts\CustomerInterface;
use App\Http\Requests\CreateCustomerRequest;
use App\Http\Requests\ImportCsvRequest;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CustomerController extends Controller
{
    private CustomerInterface $customerService;

    /**
     * Summary of __construct
     * @param \App\Http\Contracts\CustomerInterface $customerService
     */
    public function __construct(CustomerInterface $customerService)
    {
        $this->customerService = $customerService;
    }

    /**
     * Summary of index
     * @param \Illuminate\Http\Request $request
     * @return JsonResponse
     */
    public function index(Request $request): JsonResponse
    {
        $result = $this->customerService->index($request);
        return response()->json($result, $result['status']);
    }

    /**
     * Summary of search
     * @param \Illuminate\Http\Request $request
     * @return JsonResponse
     */
    public function search(Request $request): JsonResponse
    {
        $result = $this->customerService->search($request);
        return response()->json($result, $result['status']);
    }

    /**
     * Summary of store
     * @param \App\Http\Requests\CreateCustomerRequest $request
     * @return JsonResponse
     */
    public function store(CreateCustomerRequest $request): JsonResponse
    {
        $result = $this->customerService->store($request);
        return response()->json($result, $result['status']);
    }

    /**
     * Summary of update
     * @param \Illuminate\Http\Request $request
     * @param \App\Models\Customer $customer
     * @return JsonResponse
     */
    public function update(Request $request, Customer $customer): JsonResponse
    {
        $result = $this->customerService->update($request, $customer);
        return response()->json($result, $result['status']);
    }

    /**
     * Summary of destroy
     * @param \App\Models\Customer $customer
     * @return JsonResponse
     */
    public function destroy(Customer $customer): JsonResponse
    {
        $result = $this->customerService->destroy($customer);
        return response()->json($result, $result['status']);
    }

    /**
     * Summary of import
     * @param \Illuminate\Http\Request $request
     * @return JsonResponse
     */
    public function import(ImportCsvRequest $request): JsonResponse
    {

        $result = $this->customerService->importCsv($request);
        return response()->json($result, $result['status']);
    }

    /**
     * Summary of export
     * @param \Illuminate\Http\Request $request
     * @return JsonResponse|\Symfony\Component\HttpFoundation\BinaryFileResponse
     */
    public function export(Request $request)
    {
        $result = $this->customerService->exportCsv($request);

        if (!$result['success']) {
            return response()->json($result, $result['status']);
        }

        $filename = $result['data']['filename'];
        $path = storage_path('app/public/exports/' . $filename);

        if (!file_exists($path)) {
            return response()->json([
                'success' => false,
                'message' => 'File không tồn tại',
            ], Response::HTTP_NOT_FOUND);
        }

        return response()->download($path, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ])->deleteFileAfterSend(true);
    }

    /**
     * Summary of downloadErrorFile
     * @param string $filename
     * @return \Symfony\Component\HttpFoundation\BinaryFileResponse
     */
    public function downloadErrorFile(string $filename)
    {
        $path = storage_path('app/public/imports/errors/' . $filename);

        if (!file_exists($path)) {
            abort(Response::HTTP_NOT_FOUND, 'File not found');
        }

        return response()->download($path, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
