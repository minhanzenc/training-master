<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('mst_orders', function (Blueprint $table) {
            $table->increments('order_id');
            $table->string('order_shop', 40);
            $table->integer('customer_id');
            $table->integer('total_price');
            $table->tinyInteger('payment_method', false, true)->length(4)->comment('1: COD, 2: PayPal, 3: GMO');
            $table->integer('ship_charge');
            $table->integer('tax');
            $table->dateTime('order_date');
            $table->dateTime('shipment_date');
            $table->dateTime('cancel_date')->nullable();
            $table->tinyInteger('order_status', false, true)->length(1);
            $table->string('note_customer', 255)->nullable();
            $table->string('error_code_api', 20)->nullable();
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
