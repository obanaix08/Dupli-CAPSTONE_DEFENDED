<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Product;
use App\Models\ProductMaterial;

class ProductController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required',
            'description' => 'nullable',
            'price' => 'required|numeric',
            'stock' => 'required|integer',
            'image' => 'nullable|string',
        ]);
        $product = Product::create($data);
        return response()->json($product, 201);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        $product->update($request->all());
        return response()->json($product);
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function index()
    {
        return response()->json(Product::all());
    }

    public function show($id)
    {
        return response()->json(Product::findOrFail($id));
    }

    // BOM endpoints
    public function getMaterials($id)
    {
        $product = Product::findOrFail($id);
        $rows = ProductMaterial::where('product_id', $product->id)->get();
        return response()->json($rows);
    }

    public function setMaterials(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        $items = $request->validate([
            'items' => 'required|array',
            'items.*.inventory_item_id' => 'required|exists:inventory_items,id',
            'items.*.qty_per_unit' => 'required|integer|min:1',
        ])['items'];

        ProductMaterial::where('product_id', $product->id)->delete();
        foreach ($items as $it) {
            ProductMaterial::create([
                'product_id' => $product->id,
                'inventory_item_id' => $it['inventory_item_id'],
                'qty_per_unit' => $it['qty_per_unit'],
            ]);
        }

        return response()->json(['message' => 'BOM saved']);
    }
}