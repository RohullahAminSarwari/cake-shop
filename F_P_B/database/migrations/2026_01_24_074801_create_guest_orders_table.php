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
        Schema::create('guest_orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->string('guest_name');
            $table->string('guest_email');
            $table->string('guest_phone');
            $table->text('guest_address');
            $table->string('guest_city');
            $table->string('guest_postal_code');
            $table->text('guest_notes')->nullable();
            $table->decimal('subtotal', 10, 2);
            $table->decimal('tax', 10, 2);
            $table->decimal('total', 10, 2);
            $table->enum('status', ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])->default('pending');
            $table->timestamps();
            
            $table->index('order_number');
            $table->index('status');
            $table->index('guest_email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guest_orders');
    }
};
