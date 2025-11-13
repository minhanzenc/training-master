<?php 
namespace App\Enums;

enum HeaderCustomerCsvEnum: string
{
    case CUSTOMER_NAME = 'Tên khách hàng';
    case EMAIL = 'Email';
    case TEL_NUM = 'TelNum';
    case ADDRESS = 'Địa chỉ';

    public const HEADERS = [
        'customer_name'=> 'Tên khách hàng',
        'email'=> 'Email',
        'tel_num'=> 'TelNum',
        'address'=> 'Địa chỉ',
    ];

    public static function getValueHeaders(): array
    {
        return array_values(self::HEADERS);
    }

    public static function getKeyHeaders(): array
    {
        return array_keys(self::HEADERS);
    }

}
