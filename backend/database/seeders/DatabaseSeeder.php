<?php

namespace Database\Seeders;

use App\Models\Comment;
use App\Models\Post;
use App\Models\Reaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Sequence;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
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
                ->count(random_int(3, 30))
                ->state(fn() => [
                    'post_id' => $post->id,
                    'user_id' => $users->random()->id,
                ])
                ->create();
            $comments = Comment::factory()
                ->count(random_int(3, 30))
                ->state(fn() => [
                    'post_id' => $post->id,
                    'author_id' => $users->random()->id,
                ])
                ->create();

            foreach ($comments as $comment) {
                Comment::factory()
                    ->count(random_int(0, 5))
                    ->state(fn() => [
                        'post_id' => $post->id,
                        'author_id' => $users->random()->id,
                        'reply_path' => $comment->reply_path
                    ])
                    ->create();
            }
        }
    }
}
