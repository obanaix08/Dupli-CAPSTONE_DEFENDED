<?php

namespace App\Http\Controllers;

use App\Models\Production;
use Illuminate\Http\Request;
use App\Events\ProductionUpdated;
use App\Notifications\OrderStageUpdated;
use App\Models\Order;

class ProductionController extends Controller
{
    public function index(Request $request)
    {
        $query = Production::with(['user', 'product']); // eager load relationships

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        }

        return response()->json(
            $query->orderBy('date', 'desc')->get()
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'user_id'       => 'required|exists:users,id',
            'product_id'    => 'required|exists:products,id',
            'product_name'  => 'required|string|max:255', // keep for quick display
            'date'          => 'required|date',
            'stage'         => 'required|string|in:Design,Preparation,Cutting,Assembly,Finishing,Quality Control',
            'status'        => 'required|string|in:Pending,In Progress,Completed,Hold',
            'quantity'      => 'required|integer|min:0',
            'resources_used'=> 'nullable|array',
            'notes'         => 'nullable|string',
        ]);

        $production = Production::create($data)->load(['user','product']);

        broadcast(new ProductionUpdated($production))->toOthers();

        return response()->json($production, 201);
    }

    public function show($id)
    {
        $production = Production::with(['user', 'product'])->findOrFail($id);
        return response()->json($production);
    }

    public function update(Request $request, $id)
    {
        $production = Production::findOrFail($id);

        $data = $request->validate([
            'user_id'       => 'sometimes|exists:users,id',
            'product_id'    => 'sometimes|exists:products,id',
            'product_name'  => 'sometimes|string|max:255',
            'date'          => 'sometimes|date',
            'stage'         => 'sometimes|string|in:Design,Preparation,Cutting,Assembly,Finishing,Quality Control',
            'status'        => 'sometimes|string|in:Pending,In Progress,Completed,Hold',
            'quantity'      => 'sometimes|integer|min:0',
            'resources_used'=> 'nullable|array',
            'notes'         => 'nullable|string',
        ]);

        $old = $production->replicate();
        $production->update($data);

        $production->load(['user', 'product']); // reload relationships

        broadcast(new ProductionUpdated($production))->toOthers();

        // Notify customer on stage or status change
        if (($data['stage'] ?? null) || ($data['status'] ?? null)) {
            $order = $production->order_id ? Order::with('user')->find($production->order_id) : null;
            if ($order && $order->user) {
                $order->user->notify(new OrderStageUpdated(
                    $order->id,
                    $production->product_name,
                    $production->stage,
                    $production->status
                ));
            }
        }

        return response()->json($production);
    }

    public function destroy($id)
    {
        $production = Production::findOrFail($id);
        $production->delete();

        return response()->json(['message' => 'Production deleted']);
    }

    public function analytics(Request $request)
    {
        $query = Production::query();

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('date', [$request->start_date, $request->end_date]);
        }

        $data = $query->get();

        $kpis = [
            'total'       => $data->count(),
            'in_progress' => $data->where('status', 'In Progress')->count(),
            'completed'   => $data->where('status', 'Completed')->count(),
            'hold'        => $data->where('status', 'Hold')->count(),
        ];

        $daily = $data->groupBy(fn($p) => optional($p->date)->format('Y-m-d'))
            ->map(fn($items, $date) => [
                'date'     => $date,
                'quantity' => $items->sum('quantity'),
            ])
            ->values()
            ->sortBy('date')
            ->values();

        $stages = ['Design','Preparation','Cutting','Assembly','Finishing','Quality Control'];
        $stageBreakdown = collect($stages)->map(fn($stage) => [
            'name'  => $stage,
            'value' => $data->where('stage', $stage)->count(),
        ])->values();

        return response()->json([
            'kpis'             => $kpis,
            'daily_output'     => $daily,
            'stage_breakdown'  => $stageBreakdown,
        ]);
    }
}
