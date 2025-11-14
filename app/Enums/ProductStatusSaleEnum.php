<?php 
namespace App\Enums;

enum ProductStatusSaleEnum: int
{
    case OUT_OF_STOCK = 0;
    case AVAILABLE = 1;
    case DISCONTINUED = 2;

    public static function getLabels(): array
    {
        return array_map(fn($status) => $status->value, self::cases());
    }
}
