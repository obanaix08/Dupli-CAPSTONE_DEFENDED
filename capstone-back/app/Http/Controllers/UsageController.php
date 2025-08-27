<?php

namespace App\Http\Controllers;

use App\Models\InventoryUsage;
use App\Models\InventoryItem;
use Illuminate\Http\Request;

class UsageController extends Controller
{
    public function index(Request $request) {
        $days = $request->query('days', 90);
        $since = now()->subDays($days);
        $usage = InventoryUsage::where('date','>=',$since)->get();
        return response()->json($usage);
    }

    public function store(Request $request) {
        $data = $request->validate([
            'inventory_item_id' => 'required|exists:inventory_items,id',
            'date' => 'required|date',
            'qty_used' => 'required|integer|min:1',
        ]);
        $usage = InventoryUsage::create($data);

        // Update inventory balance
        $item = InventoryItem::find($data['inventory_item_id']);
        $item->decrement('quantity_on_hand', $data['qty_used']);

        // Broadcast update
        broadcast(new \App\Events\InventoryUpdated($item))->toOthers();

        return response()->json($usage, 201);
    }
}