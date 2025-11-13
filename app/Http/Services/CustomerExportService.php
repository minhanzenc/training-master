<?php
namespace App\Http\Services;

use App\Enums\HeaderCustomerCsvEnum;
use League\Csv\Writer;
use League\Csv\Exception as CsvException;

class CustomerExportService
{
    /**
     * Export customers to CSV file
     * 
     * @param \Illuminate\Support\Collection $customers
     * @return array{success: bool, message: string, filename?: string}
     */
    public function export($customers): array
    {
        if ($customers->isEmpty()) {
            return [
                'success' => false,
                'message' => 'Không có dữ liệu khách hàng để xuất.',
            ];
        }

        try {
            $filename = 'customers_export_' . now()->format('Y-m-d_His') . '.csv';
            $path = storage_path('app/public/exports/' . $filename);

            $directory = dirname($path);
            if (!is_dir($directory)) {
                mkdir($directory, 0777, true);
            }

            $csv = Writer::from($path, 'w+');
            $csv->setOutputBOM(Writer::BOM_UTF8);

            $csv->insertOne(HeaderCustomerCsvEnum::getValueHeaders());

            foreach ($customers as $customer) {
                $csv->insertOne([
                    $customer->customer_name,
                    $customer->email,
                    $customer->tel_num,
                    $customer->address,
                ]);
            }

            return [
                'success' => true,
                'message' => "Xuất thành công {$customers->count()} khách hàng",
                'filename' => $filename,
            ];
        } catch (CsvException $e) {
            return [
                'success' => false,
                'message' => 'Lỗi khi tạo file CSV: ' . $e->getMessage(),
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Lỗi không xác định: ' . $e->getMessage(),
            ];
        }
    }
}