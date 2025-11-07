<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->string('action'); // created, updated, moved, commented, assigned
            $table->text('description');
            $table->morphs('loggable'); // card_id, list_id, board_id
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->json('metadata')->nullable(); // Additional data
            $table->timestamps();

            $table->index(['loggable_type', 'loggable_id']);
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
