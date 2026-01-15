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
        if (!Schema::hasTable('discounts')) {
            Schema::create('discounts', function (Blueprint $table) {
        $table->id();
        $table->foreignId('shop_id')->constrained();
        $table->foreignId('product_id')->nullable()->constrained();
        $table->enum('type',['percent','fixed']);
        $table->decimal('value',10,2);
        $table->date('start_date');
        $table->date('end_date');
    });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('discounts');
    }
};
