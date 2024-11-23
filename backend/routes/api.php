<?php

use App\Http\Controllers\PostController;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('/user')->group(function () {
    Route::middleware(['auth:sanctum'])->get('/', function (Request $request) {
        return $request->user();
    });

    Route::get('/{userId}', [UserController::class, 'show'])
        ->where('userId', '[0-9]+');

    Route::get('/{userId}/posts', [UserController::class, 'showPosts'])
        ->where('userId', '[0-9]+');
});

Route::prefix('/post')->group(function () {
    Route::get('/{postId}', [PostController::class, 'show'])
        ->where('postId', '[0-9]+');

    Route::get('/all', [PostController::class, 'showAll']);

    Route::middleware(['auth:sanctum'])->put('/{postId}', [PostController::class, 'update'])
        ->where('postId', '[0-9]+');

    Route::middleware(['auth:sanctum'])->delete('/{postId}', [PostController::class, 'delete'])
        ->where('postId', '[0-9]+');

    Route::middleware(['auth:sanctum'])
        ->post('/', [PostController::class, 'store']);
});
