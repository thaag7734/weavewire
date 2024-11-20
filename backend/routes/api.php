<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('/api')->group(function () {
    Route::prefix('/user')->middleware(['auth:sanctum'])->group(function () {
        Route::get('/', function (Request $request) {
            return $request->user();
        });
    });

    Route::prefix('/post')->group(function () {});
});
