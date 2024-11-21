<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Post>
 */
class PostFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'author_id' => User::factory(),
            'image_file' => Str::random(32) . '.png', // TODO replace this with real seeds
            'caption' => fake()->realText(512),
        ];
    }

    public function withUser(User $user)
    {
        return $this->state([
            'author_id' => $user->id,
        ]);
    }
}
