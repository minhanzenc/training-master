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
        Schema::create('mst_products', function (Blueprint $table) {
            $table->string('product_id', 20)->primary();
            $table->string('product_name', 255);
            $table->string('product_image', 255)->nullable();
            $table->decimal('product_price', 15, 2)->default(0);
            $table->tinyInteger('is_sales')->default(1)->comment('0: Dừng bán, 1: Có hàng bán, 2: Dừng sản xuất');
            $table->text('description')->nullable();
            $table->timestamps();
            $table->unique('product_id');
            $table->index('product_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
