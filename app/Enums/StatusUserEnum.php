<?php

namespace App\Enums;

enum StatusUserEnum: int
{
    case ACTIVE = 1;
    case INACTIVE = 0;

    public static function getLabels(): array
    {
        return array_map(fn($status) => $status->value, self::cases());
    }
}