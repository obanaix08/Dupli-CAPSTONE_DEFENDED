<?php

// app/Http/Controllers/ReportController.php
namespace App\Http\Controllers;

use App\Models\InventoryItem;

class ReportController extends Controller
{
    public function replenishment() {
        $items = InventoryItem::with('usage')->get();

        $report = $items->map(function($item) {
            $avgDaily = $item->usage()
                ->where('date','>=',now()->subDays(30))
                ->avg('qty_used') ?? 0;

            $rop = $item->reorder_point ??
                ($avgDaily * $item->lead_time_days + $item->safety_stock);

            $suggestOrder = ($item->quantity_on_hand <= $rop)
                ? max(0, ($item->max_level ?? $rop + $item->safety_stock) - $item->quantity_on_hand)
                : 0;

            return [
                'sku' => $item->sku,
                'name' => $item->name,
                'on_hand' => $item->quantity_on_hand,
                'avg_daily_usage' => round($avgDaily,2),
                'rop' => $rop,
                'suggested_order' => $suggestOrder,
            ];
        });

        return response()->json($report);
    }
}
