<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\BoardController;
use App\Http\Controllers\ListController;
use App\Http\Controllers\CardController;
use Illuminate\Support\Facades\Route;


// Public routes
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    // Boards
    Route::apiResource('boards', BoardController::class);

    // Lists
    Route::post('/boards/{board}/lists', [ListController::class, 'store']);
    Route::put('/lists/{list}', [ListController::class, 'update']);
    Route::delete('/lists/{list}', [ListController::class, 'destroy']);
    Route::post('/boards/{board}/lists/reorder', [ListController::class, 'reorder']);

    // Cards
    Route::post('/lists/{list}/cards', [CardController::class, 'store']);
    Route::get('/cards/{card}', [CardController::class, 'show']);
    Route::put('/cards/{card}', [CardController::class, 'update']);
    Route::delete('/cards/{card}', [CardController::class, 'destroy']);
    Route::post('/cards/{card}/move', [CardController::class, 'move']);
    Route::post('/lists/{list}/cards/reorder', [CardController::class, 'reorder']);

});
