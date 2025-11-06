<?php

namespace App\Enums;

enum GroupRoleEnum: string
{
    case ADMIN = 'admin';
    case REVIEWER = 'reviewer';
    case EDITOR = 'editor';

    public static function getLabels(): array
    {
        return array_map(fn($role) => $role->value, self::cases());
    }
}