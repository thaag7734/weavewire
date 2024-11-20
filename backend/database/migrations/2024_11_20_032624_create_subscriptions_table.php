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
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->foreignId('follower_id')
                ->constrained()
                ->onDelete('cascade')
                ->references('id')
                ->on('users');
            $table->foreignId('follows_id')
                ->constrained()
                ->onDelete('cascade')
                ->references('id')
                ->on('users');
            $table->timestamps();

            $table->primary(['follower_id', 'follows_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
