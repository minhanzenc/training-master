<?php

namespace App\Http\Services;

use League\Csv\Writer;
use League\Csv\Exception as CsvException;

class CsvErrorExportService
{
    private const ERROR_FILE_HEADERS = [
        'Tên khách hàng',
        'Email',
        'Số điện thoại',
        'Địa chỉ',
        'Lỗi',
    ];

    /**
     * Save error CSV to storage and return file path
     * 
     * @param array $invalidRows Array of ['dto' => CustomerImportDTO, 'errors' => array]
     * @return string File name
     * @throws CsvException
     */
    public function saveErrorCsvToStorage(array $invalidRows): string
    {
        $filename = 'customer_import_errors_' . now()->format('Y-m-d_His') . '.csv';
        $path = storage_path('app/public/imports/errors/' . $filename);

        // Ensure directory exists
        $directory = dirname($path);
        if (!is_dir($directory)) {
            mkdir($directory, 0777, true);
        }

        $csv = Writer::from($path, 'w+');
        $csv->setOutputBOM(Writer::BOM_UTF8);

        $csv->insertOne(self::ERROR_FILE_HEADERS);

        foreach ($invalidRows as $invalidRow) {
            $dto = $invalidRow['dto'];
            $errors = $invalidRow['errors'];
            $csv->insertOne($dto->toErrorRow($errors));
        }

        return $filename;
    }
}
