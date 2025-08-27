<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\UsageController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ProductionController;


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // Product Routes
    Route::post('/products', [ProductController::class, 'store']);
    Route::put('/products/{id}', [ProductController::class, 'update']);
    Route::delete('/products/{id}', [ProductController::class, 'destroy']);
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{id}', [ProductController::class, 'show']);

    // Cart Routes
    Route::post('/cart', [CartController::class, 'addToCart']);  // 
    Route::get('/cart', [CartController::class, 'viewCart']);
    Route::put('/cart/{id}', [CartController::class, 'update']);
    Route::delete('/cart/{id}', [CartController::class, 'removeFromCart']);

    // Order Routes
    Route::post('/checkout', [OrderController::class, 'checkout']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/my-orders', [OrderController::class, 'myOrders']);
    Route::middleware('auth:sanctum')->get('/orders/{id}', [OrderController::class, 'show']);
    Route::middleware(['auth:sanctum'])->put('/orders/{id}/complete', [OrderController::class, 'markAsComplete']);

    //Inventory Routes
    Route::get('/inventory', [InventoryController::class, 'index']);
    Route::post('/inventory', [InventoryController::class, 'store']);
    Route::put('/inventory/{id}', [InventoryController::class, 'update']);
    Route::delete('/inventory/{id}', [InventoryController::class, 'destroy']);

    Route::get('/usage', [UsageController::class, 'index']);
    Route::post('/usage', [UsageController::class, 'store']);

    Route::get('/replenishment', [ReportController::class, 'replenishment']);

    //Production Routes
    
    Route::get('/productions', [ProductionController::class, 'index']);
    Route::get('/productions/analytics', [ProductionController::class, 'analytics']);
    Route::post('/productions', [ProductionController::class, 'store']);
    Route::get('/productions/{id}', [ProductionController::class, 'show']);
    Route::patch('/productions/{id}', [ProductionController::class, 'update']);
    Route::delete('/productions/{id}', [ProductionController::class, 'destroy']);

});

