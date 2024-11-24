<?php

namespace Database\Seeders;

use App\Models\Comment;
use App\Models\Post;
use App\Models\Reaction;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Collection;

function createReplies(Comment $comment, Post $post, Collection $users, int $depth = 0, int $maxDepth = 5): void
{
    if ($depth >= $maxDepth) {
        return;
    }

    $replies = Comment::factory()
        ->count(random_int(0, 5))
        ->state(fn() => [
            'post_id' => $post->id,
            'author_id' => $users->random()->id,
            'reply_path' => $comment->reply_path
        ])
        ->create();

    foreach ($replies as $reply) {
        createReplies($reply, $post, $users, $depth + 1, $maxDepth);
    }
}

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     * TODO this is abhorrently slow and desperately needs optimized
     */
    public function run(): void
    {
        $sysUser = User::factory()->create([
            'username' => 'system',
            'email' => 'system@tylerhaag.dev',
            'password' => 'password',
            'status' => 'uwu',
        ]);

        $demoUser = User::factory()->create([
            'username' => 'demo-user',
            'email' => 'demo@tylerhaag.dev',
            'password' => 'password',
            'status' => 'demoing the site',
        ]);

        $users = User::factory()
            ->count(30)
            ->create();

        $posts = Post::factory()
            ->count(100)
            ->state(fn() => [
                'author_id' => $users->random(),
            ])
            ->create();

        $posts->concat(Post::factory()->count(10)->withUser($sysUser)->create());
        $posts->concat(Post::factory()->count(10)->withUser($demoUser)->create());

        foreach ($posts as $post) {
            Reaction::factory()
                ->count(random_int(0, 50))
                ->state(fn() => [
                    'post_id' => $post->id,
                    'user_id' => $users->random()->id,
                ])
                ->create();
            $comments = Comment::factory()
                ->count(random_int(0, 20))
                ->state(fn() => [
                    'post_id' => $post->id,
                    'author_id' => $users->random()->id,
                ])
                ->create();


            foreach ($comments as $comment) {
                createReplies($comment, $post, $users, random_int(0, 5));
            }
        }
    }
}
