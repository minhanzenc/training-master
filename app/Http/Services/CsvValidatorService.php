<?php

namespace App\Http\Services;

use App\DTO\CustomerImportDTO;
use Illuminate\Support\Facades\Validator;

class CsvValidatorService
{
    /**
     * Validation rules matching CreateCustomerRequest
     */
    private const VALIDATION_RULES = [
        'customer_name' => 'required|string|max:255|min:5',
        'email' => 'required|email|unique:mst_customer,email',
        'tel_num' => 'required|string|regex:/^[0-9]{10,11}$/',
        'address' => 'required|string|max:255',
    ];

    /**
     * Custom validation messages in Vietnamese
     */
    private const VALIDATION_MESSAGES = [
        'customer_name.required' => 'Tên khách hàng không được để trống',
        'customer_name.min' => 'Tên khách hàng phải có ít nhất 5 ký tự',
        'customer_name.max' => 'Tên khách hàng không được vượt quá 255 ký tự',
        'email.required' => 'Email không được để trống',
        'email.email' => 'Email không đúng định dạng',
        'email.unique' => 'Email đã tồn tại trong hệ thống',
        'tel_num.required' => 'Số điện thoại không được để trống',
        'tel_num.regex' => 'Số điện thoại phải có 10-11 chữ số',
        'address.required' => 'Địa chỉ không được để trống',
        'address.max' => 'Địa chỉ không được vượt quá 255 ký tự',
    ];

    /**
     * Validate a single customer row
     * 
     * @param CustomerImportDTO $dto
     * @return array Returns empty array if valid, otherwise returns error messages
     */
    public function validateRow(CustomerImportDTO $dto): array
    {
        $validator = Validator::make(
            $dto->toArray(),
            self::VALIDATION_RULES,
            self::VALIDATION_MESSAGES
        );

        if ($validator->fails()) {
            return $validator->errors()->all();
        }

        return [];
    }

    /**
     * Batch validate multiple rows
     * 
     * @param array<CustomerImportDTO> $dtos
     * @return array Returns [validRows => [], invalidRows => []]
     */
    public function validateBatch(array $dtos): array
    {
        $rows = [];
        $flag = false;

        foreach ($dtos as $dto) {
            $errors = $this->validateRow($dto);

            if ($errors) {
                $flag = true;
            }
            $rows[] = [
                'dto' => $dto,
                'errors' => $errors ?? [],
            ];
        }

        return [
            'rows' => $rows,
            'errorFlag' => $flag,
        ];
    }
}
