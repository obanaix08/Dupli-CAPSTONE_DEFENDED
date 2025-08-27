<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use Illuminate\Http\Request;

class InventoryController extends Controller
{
    public function index() {
        return response()->json(InventoryItem::all());
    }

    public function store(Request $request) {
        $data = $request->validate([
            'sku' => 'required|unique:inventory_items',
            'name' => 'required',
            'category' => 'required|in:raw,finished',
            'location' => 'nullable',
            'quantity_on_hand' => 'integer|min:0',
            'safety_stock' => 'integer|min:0',
            'reorder_point' => 'nullable|integer|min:0',
            'max_level' => 'nullable|integer|min:0',
            'lead_time_days' => 'integer|min:0',
        ]);
        $item = InventoryItem::create($data);
        return response()->json($item, 201);
    }

    public function update(Request $request, $id) {
        $item = InventoryItem::findOrFail($id);
        $item->update($request->all());
        return response()->json($item);
    }

    public function destroy($id) {
        InventoryItem::destroy($id);
        return response()->json(['message'=>'Deleted']);
    }
}