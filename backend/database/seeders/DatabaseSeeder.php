<?php

namespace Database\Seeders;

use App\Models\Comment;
use App\Models\Post;
use App\Models\Reaction;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Sequence;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        DB::enableQueryLog();

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
            ->count(30)
            ->withUser($users->random())
            ->create();

        foreach ($posts as $post) {
            Reaction::factory()
                ->count(random_int(3, 30))
                ->state(fn() => [
                    'post_id' => $post->id,
                    'user_id' => $users->random()->id,
                ])
                ->create();
            Comment::factory()
                ->count(random_int(3, 30))
                ->state(fn() => [
                    'post_id' => $post->id,
                    'author_id' => $users->random()->id,
                ])
                ->create();
        }
    }
}
