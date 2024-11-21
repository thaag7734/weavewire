<?php

use App\Http\Controllers\PostController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('/user')->middleware(['auth:sanctum'])->group(function () {
    Route::get('/', function (Request $request) {
        return $request->user();
    });
});

Route::prefix('/post')->group(function () {
    Route::get('/{postId}', [PostController::class, 'show'])
        ->where('postId', '[0-9]+');

    Route::middleware(['auth:sanctum'])->put('/{postId}', [PostController::class, 'update'])
        ->where('postId', '[0-9]+');

    Route::middleware(['auth:sanctum'])->delete('/{postId}', [PostController::class, 'delete'])
        ->where('postId', '[0-9]+');

    Route::middleware(['auth:sanctum'])
        ->post('/', [PostController::class, 'store']);
});
