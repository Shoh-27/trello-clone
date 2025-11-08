<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // First, drop if exists (for safety)
        DB::statement('DROP TABLE IF EXISTS activity_logs CASCADE');

        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->string('action');
            $table->text('description');
            $table->string('loggable_type');
            $table->unsignedBigInteger('loggable_id');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->json('metadata')->nullable();
            $table->timestamps();

            // Create indexes manually to avoid conflicts
            $table->index(['loggable_type', 'loggable_id'], 'activity_logs_poly_index');
            $table->index('user_id', 'activity_logs_user_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
