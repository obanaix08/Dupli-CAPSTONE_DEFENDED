<?php

// app/Http/Controllers/ReportController.php
namespace App\Http\Controllers;

use App\Models\InventoryItem;
use Illuminate\Http\Request;
use App\Services\InventoryForecastService;

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

    public function forecast(Request $request, InventoryForecastService $svc)
    {
        $window = (int) $request->query('window', 30);
        $items = InventoryItem::with('usage')->get();

        $data = $items->map(function(InventoryItem $item) use ($svc, $window) {
            $avg = $svc->calculateMovingAverageDailyUsage($item, $window);
            $days = $svc->estimateDaysToDepletion($item, $window);
            $rop = $svc->computeReorderPoint($item, $window);
            $suggest = $svc->suggestReplenishmentQty($item, $window);
            return [
                'sku' => $item->sku,
                'name' => $item->name,
                'on_hand' => $item->quantity_on_hand,
                'avg_daily_usage' => round($avg,2),
                'days_to_depletion' => $days,
                'reorder_point' => $rop,
                'suggested_order' => $suggest,
            ];
        })->values();

        return response()->json($data);
    }

    public function stockCsv()
    {
        $rows = InventoryItem::all()->map(function($i){
            return [
                'sku' => $i->sku,
                'name' => $i->name,
                'category' => $i->category,
                'location' => $i->location,
                'quantity_on_hand' => $i->quantity_on_hand,
                'safety_stock' => $i->safety_stock,
                'reorder_point' => $i->reorder_point,
                'max_level' => $i->max_level,
                'lead_time_days' => $i->lead_time_days,
            ];
        })->toArray();

        return $this->arrayToCsvResponse($rows, 'stock.csv');
    }

    public function usageCsv(Request $request)
    {
        $days = (int) $request->query('days', 90);
        $since = now()->subDays($days);
        $rows = \App\Models\InventoryUsage::with('inventoryItem')
            ->where('date','>=',$since)
            ->get()
            ->map(function($u){
                return [
                    'date' => optional($u->date)->format('Y-m-d'),
                    'sku' => optional($u->inventoryItem)->sku,
                    'name' => optional($u->inventoryItem)->name,
                    'qty_used' => $u->qty_used,
                ];
            })->toArray();

        return $this->arrayToCsvResponse($rows, 'usage.csv');
    }

    public function replenishmentCsv(InventoryForecastService $svc)
    {
        $items = InventoryItem::with('usage')->get();
        $rows = $items->map(function($item) use ($svc) {
            return [
                'sku' => $item->sku,
                'name' => $item->name,
                'on_hand' => $item->quantity_on_hand,
                'avg_daily_usage' => round($svc->calculateMovingAverageDailyUsage($item),2),
                'reorder_point' => $svc->computeReorderPoint($item),
                'suggested_order' => $svc->suggestReplenishmentQty($item),
            ];
        })->toArray();

        return $this->arrayToCsvResponse($rows, 'replenishment.csv');
    }

    private function arrayToCsvResponse(array $rows, string $filename)
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($rows) {
            $out = fopen('php://output', 'w');
            if (empty($rows)) {
                fclose($out);
                return;
            }
            // header
            fputcsv($out, array_keys($rows[0]));
            foreach ($rows as $row) {
                fputcsv($out, $row);
            }
            fclose($out);
        };

        return response()->stream($callback, 200, $headers);
    }
}
