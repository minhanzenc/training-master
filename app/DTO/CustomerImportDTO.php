<?php

namespace App\DTO;

use App\Enums\HeaderCustomerCsvEnum;

class CustomerImportDTO
{
    public function __construct(
        public readonly ?string $customer_name,
        public readonly ?string $email,
        public readonly ?string $tel_num,
        public readonly ?string $address,
    ) {}

    /**
     * Create DTO from CSV row with header mapping
     */
    public static function fromCsvRow(array $row): self
    {
        return new self(
            customer_name: trim($row[HeaderCustomerCsvEnum::CUSTOMER_NAME->value] ?? ''),
            email: trim($row[HeaderCustomerCsvEnum::EMAIL->value] ?? ''),
            tel_num: trim($row[HeaderCustomerCsvEnum::TEL_NUM->value] ?? ''),
            address: trim($row[HeaderCustomerCsvEnum::ADDRESS->value] ?? ''),
        );
    }

    public function toArray(): array
    {
        return [
            'customer_name' => $this->customer_name,
            'email' => $this->email,
            'tel_num' => $this->tel_num,
            'address' => $this->address,
        ];
    }

    /**
     * Convert DTO to array for error export
     */
    public function toErrorRow(array $errors): array
    {
        return [
            'customer_name' => $this->customer_name,
            'email' => $this->email,
            'tel_num' => $this->tel_num,
            'address' => $this->address,
            'errors' => implode(' | ', $errors ?? []),
        ];
    }
}
