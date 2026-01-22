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
        Schema::table('orders', function (Blueprint $table) {
            $table->string('session_id')->nullable()->after('user_id');
            $table->string('customer_name')->nullable()->after('payment_status');
            $table->string('customer_email')->nullable()->after('customer_name');
            $table->string('customer_phone')->nullable()->after('customer_email');
            $table->text('customer_address')->nullable()->after('customer_phone');
            $table->string('customer_city')->nullable()->after('customer_address');
            $table->string('customer_postal_code')->nullable()->after('customer_city');
            $table->string('customer_country')->nullable()->after('customer_postal_code');
            $table->string('payment_method')->nullable()->after('customer_country');
            $table->index('session_id');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->foreignId('product_creator_id')->nullable()->constrained('users')->after('price');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['session_id']);
            $table->dropColumn(['session_id', 'customer_name', 'customer_email', 'customer_phone', 'customer_address', 'customer_city', 'customer_postal_code', 'customer_country', 'payment_method']);
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->dropForeign(['product_creator_id']);
            $table->dropColumn('product_creator_id');
        });
    }
};
