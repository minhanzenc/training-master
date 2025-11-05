<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'name' => 'Admin',
            'email' => 'admin@gmail.com',
            'password' => Hash::make('123'),
            'verify_email' => null,
            'is_active' => 1,
            'is_delete' => 0,
            'group_role' => 'admin',
            'last_login_at' => null,
            'last_login_ip' => null,
        ]);

        User::create([
            'name' => 'Test User',
            'email' => 'user@example.com',
            'password' => Hash::make('123'),
            'verify_email' => null,
            'is_active' => 1,
            'is_delete' => 0,
            'group_role' => 'user',
            'last_login_at' => null,
            'last_login_ip' => null,
        ]);

        User::create([
            'name' => 'Manager User',
            'email' => 'manager@example.com',
            'password' => Hash::make('123'),
            'verify_email' => null,
            'is_active' => 1,
            'is_delete' => 0,
            'group_role' => 'manager',
            'last_login_at' => null,
            'last_login_ip' => null,
        ]);
    }
}
