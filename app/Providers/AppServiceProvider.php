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
use App\Http\Services\CsvErrorExportService;
use App\Http\Services\CsvValidatorService;
use App\Http\Services\CustomerImportService;
use App\Http\Contracts\ProductInterface;
use App\Http\Services\CloudinaryService;
use App\Http\Services\ProductService;

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
        ProductInterface::class => ProductService::class,
    ];

    public $singletons = [
        CsvValidatorService::class,
        CustomerImportService::class,
        CustomerExportService::class,
        CsvErrorExportService::class,
        CloudinaryService::class,
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
