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
use App\Http\Controllers\OrderTrackingController;
use App\Http\Controllers\AdminOverviewController;


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
    Route::get('/products/{id}/materials', [ProductController::class, 'getMaterials']);
    Route::post('/products/{id}/materials', [ProductController::class, 'setMaterials']);
    Route::get('/products/{id}/materials/export', [ProductController::class, 'exportMaterialsCsv']);
    Route::post('/products/{id}/materials/import', [ProductController::class, 'importMaterialsCsv']);

    // Cart Routes
    Route::post('/cart', [CartController::class, 'addToCart']);  // 
    Route::get('/cart', [CartController::class, 'viewCart']);
    Route::put('/cart/{id}', [CartController::class, 'update']);
    Route::delete('/cart/{id}', [CartController::class, 'removeFromCart']);

    // Order Routes
    Route::post('/checkout', [OrderController::class, 'checkout']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/my-orders', [OrderController::class, 'myOrders']);
    Route::get('/orders/{id}/tracking', [OrderController::class, 'tracking']);
    Route::middleware('auth:sanctum')->get('/orders/{id}', [OrderController::class, 'show']);
    Route::middleware(['auth:sanctum'])->put('/orders/{id}/complete', [OrderController::class, 'markAsComplete']);

    //Inventory Routes
    Route::get('/inventory', [InventoryController::class, 'index']);
    Route::post('/inventory', [InventoryController::class, 'store']);
    Route::put('/inventory/{id}', [InventoryController::class, 'update']);
    Route::delete('/inventory/{id}', [InventoryController::class, 'destroy']);
    Route::get('/inventory/reorder-items', [InventoryController::class, 'getReorderItems']);
    Route::get('/inventory/daily-usage', [InventoryController::class, 'getDailyUsage']);
    Route::get('/inventory/consumption-trends', [InventoryController::class, 'getConsumptionTrends']);
    Route::get('/inventory/dashboard', [InventoryController::class, 'getDashboardData']);

    Route::get('/usage', [UsageController::class, 'index']);
    Route::post('/usage', [UsageController::class, 'store']);

    Route::get('/replenishment', [ReportController::class, 'replenishment']);
    Route::get('/forecast', [ReportController::class, 'forecast']);
    Route::get('/reports/stock.csv', [ReportController::class, 'stockCsv']);
    Route::get('/reports/usage.csv', [ReportController::class, 'usageCsv']);
    Route::get('/reports/replenishment.csv', [ReportController::class, 'replenishmentCsv']);

    //Production Routes
    
    Route::get('/productions', [ProductionController::class, 'index']);
    Route::get('/productions/analytics', [ProductionController::class, 'analytics']);
    Route::get('/productions/predictive', [ProductionController::class, 'predictiveAnalytics']);
    Route::get('/productions/daily-summary', [ProductionController::class, 'dailySummary']);
    Route::post('/productions', [ProductionController::class, 'store']);
    Route::post('/productions/start', [ProductionController::class, 'startProduction']);
    Route::patch('/productions/{id}', [ProductionController::class, 'update']);
    Route::patch('/productions/{productionId}/processes/{processId}', [ProductionController::class, 'updateProcess']);
    Route::get('/productions/{id}', [ProductionController::class, 'show']);
    Route::delete('/productions/{id}', [ProductionController::class, 'destroy']);

    // Order Tracking Routes
    Route::get('/order-tracking/{orderId}', [OrderTrackingController::class, 'getTracking']);
    Route::post('/order-tracking', [OrderTrackingController::class, 'createTracking']);
    Route::patch('/order-tracking/{trackingId}', [OrderTrackingController::class, 'updateTracking']);
    Route::get('/order-tracking/{orderId}/customer', [OrderTrackingController::class, 'getCustomerTracking']);
    Route::get('/order-tracking/stats', [OrderTrackingController::class, 'getTrackingStats']);

    // Admin Overview
    Route::get('/admin/overview', [AdminOverviewController::class, 'index']);

});

