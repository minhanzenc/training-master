<?php

namespace App\Services;

use App\DTO\CustomerImportDTO;
use App\Enums\HeaderCustomerCsvEnum;
use App\Models\Customer;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use League\Csv\Reader;
use League\Csv\Exception as CsvException;

class CustomerImportService
{
    public function __construct(
        private readonly CsvValidatorService $validator,
        private readonly CsvErrorExportService $errorExporter
    ) {}

    /**
     * Import customers from CSV file
     * 
     * @param UploadedFile $file
     * @return array{success: bool, message: string, data: array|null, errorFileUrl: string|null}
     */
    public function import(UploadedFile $file): array
    {
        try {
            $dtos = $this->parseCsvFile($file);

            if (empty($dtos)) {
                return $this->errorResponse('File CSV không có dữ liệu hợp lệ');
            }

            $validationResult = $this->validator->validateBatch($dtos);

            if ($validationResult['errorFlag']) {
                return $this->handleValidationErrors($validationResult['rows']);
            }

            $importedCount = $this->importValidRecords($validationResult['rows']);

            return $this->successResponse(
                "Import thành công {$importedCount} khách hàng",
                ['imported_count' => $importedCount]
            );
        } catch (CsvException $e) {
            return $this->errorResponse('Lỗi đọc file CSV: ' . $e->getMessage());
        } catch (\Exception $e) {
            return $this->errorResponse('Lỗi không xác định: ' . $e->getMessage());
        }
    }

    /**
     * Parse CSV file and convert to DTOs
     * 
     * @param UploadedFile $file
     * @return array<CustomerImportDTO>
     * @throws CsvException
     */
    private function parseCsvFile(UploadedFile $file): array
    {
        $csv = Reader::from($file->getRealPath());
        $csv->setHeaderOffset(0);

        $headers = $csv->getHeader();

        $this->validateHeaders($headers);

        $dtos = [];

        foreach ($csv->getRecords() as $record) {
            $mappedRecord = $this->mapRecordToExpectedFormat($record);
            $dtos[] = CustomerImportDTO::fromCsvRow($mappedRecord);
        }
        return $dtos;
    }

    /**
     * Validate that CSV has all required headers
     * 
     * @param array $headers
     * @throws \InvalidArgumentException
     */
    private function validateHeaders(array $headers): void
    {
        $requiredHeaders = HeaderCustomerCsvEnum::getValueHeaders();
        $missingHeaders = array_diff($requiredHeaders, $headers);

        if (!empty($missingHeaders)) {
            throw new \InvalidArgumentException(
                'File CSV thiếu các cột: ' . implode(', ', $missingHeaders)
            );
        }
    }

    /**
     * Map CSV record to expected format
     * This allows headers to be in any order in the CSV
     * 
     * @param array $record
     * @return array
     */
    private function mapRecordToExpectedFormat(array $record): array
    {
        $formattedRecord = [];
        foreach (HeaderCustomerCsvEnum::getValueHeaders() as $header) {
            $formattedRecord[$header] = $record[$header] ?? '';
        }
        return $formattedRecord;
    }

    /**
     * Handle validation errors by generating error CSV
     * 
     * @param array $invalidRows
     * @return array
     */
    private function handleValidationErrors(array $invalidRows): array
    {
        $filename = $this->errorExporter->saveErrorCsvToStorage($invalidRows);

        return [
            'success' => false,
            'message' => "File CSV có lỗi. Vui lòng tải file lỗi để xem chi tiết.",
            'data' => [
                'error_file_name' => $filename,
            ],
            'errorFilename' => $filename,
        ];
    }

    /**
     * Import valid records into database using transaction
     * 
     * @param array<CustomerImportDTO> $validRows
     * @return int Number of imported records
     */
    private function importValidRecords(array $validRows): int
    {
        $importedCount = 0;

        DB::beginTransaction();
        try {
            foreach ($validRows as $row) {
                Customer::create($row['dto']->toArray());
                $importedCount++;
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }

        return $importedCount;
    }

    /**
     * Success response format
     */
    private function successResponse(string $message, ?array $data = null): array
    {
        return [
            'success' => true,
            'message' => $message,
            'data' => $data,
        ];
    }

    /**
     * Error response format
     */
    private function errorResponse(string $message): array
    {
        return [
            'success' => false,
            'message' => $message,
            'data' => null,
        ];
    }
}
