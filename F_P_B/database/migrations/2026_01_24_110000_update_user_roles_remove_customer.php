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
        // First, update existing customer records to seller
        DB::table('users')
            ->where('role', 'customer')
            ->update(['role' => 'seller']);

        // Then modify the enum column
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['admin', 'seller'])->default('seller')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // First, update some seller records back to customer for rollback
        DB::table('users')
            ->where('role', 'seller')
            ->limit(1) // Only update one to avoid conflicts
            ->update(['role' => 'customer']);

        // Then restore the original enum
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['admin', 'seller', 'customer'])->default('customer')->change();
        });
    }
};
