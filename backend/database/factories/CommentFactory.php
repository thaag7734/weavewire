<?php

namespace Database\Factories;

use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Comment>
 */
class CommentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'content' => fake()->realText(255),
        ];
    }

    public function withUser(User $user)
    {
        return $this->state([
            'author_id' => $user->id,
        ]);
    }

    public function withPost(Post $post)
    {
        return $this->state([
            'post_id' => $post->id,
        ]);
    }

    public function asReplyTo(Comment $comment)
    {
        return $this->state([
            'comment_id' => $comment
        ]);
    }
}
