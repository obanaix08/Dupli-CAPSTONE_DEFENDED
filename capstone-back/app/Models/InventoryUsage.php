<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryUsage extends Model
{
    protected $fillable = ['inventory_item_id','date','qty_used'];
}