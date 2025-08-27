<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Production extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'user_id',
        'product_id',
        'product_name',
        'date',
        'stage',
        'status',
        'quantity',
        'resources_used',
        'notes',
    ];

    protected $casts = [
        'resources_used' => 'array',
        'date' => 'date:Y-m-d',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    // Each production belongs to a user
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Each production belongs to a product
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    // Optional: if linked to an order
    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
