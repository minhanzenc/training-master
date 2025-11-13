<?php

namespace App\Providers;

use App\Http\Contracts\CustomerInterface;
use Illuminate\Support\ServiceProvider;
use App\Http\Contracts\LoginInterface;
use App\Http\Services\LoginService;
use App\Http\Contracts\UserInterface;
use App\Http\Services\CustomerExportService;
use App\Http\Services\CustomerService;
use App\Http\Services\UserService;
use App\Services\CsvErrorExportService;
use App\Services\CsvValidatorService;
use App\Services\CustomerImportService;

class AppServiceProvider extends ServiceProvider
{
    /**
     * All of the container bindings that should be registered.
     *
     * @var array
     */
    public $bindings = [
        LoginInterface::class => LoginService::class,
        UserInterface::class => UserService::class,
        CustomerInterface::class => CustomerService::class,
    ];

    public $singletons = [
        CsvValidatorService::class,
        CustomerImportService::class,
        CustomerExportService::class,
        CsvErrorExportService::class,
    ];

    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
