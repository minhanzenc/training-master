<?php

use Illuminate\Support\Facades\Route;

Route::view('/{any}', 'layout')->where('any', '^(?!api).*$');
