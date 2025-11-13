<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'mst_customer';

    protected $primaryKey = 'customer_id';
    
    protected $fillable = [
        'customer_name',
        'email',
        'tel_num',
        'address',
        'is_active',
        'created_at',
        'updated_at',
    ];


}
