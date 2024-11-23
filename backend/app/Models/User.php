<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

/**
 * Class User
 *
 * @property int $id
 * @property string $username
 * @property string $email
 * @property \Carbon\Carbon $email_verified_at
 * @property string $password
 * @property string $status
 */
class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'username',
        'email',
        'password',
        'status',
        'avatar',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get this User's Posts
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function posts()
    {
        return $this->hasMany(Post::class, 'author_id');
    }

    /**
     * Get this User's Reactions
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function reactions()
    {
        return $this->hasMany(Reaction::class);
    }

    /**
     * Get this User's liked Posts
     *
     * @return \Illuminate\Database\Eloquent\Collection|Post[]
     */
    public function likedPosts()
    {
        return $this
            ->reactions()
            ->where('is_like', true)
            ->whereNotNull('post_id')
            ->get();
    }

    /**
     * Get this User's liked Comments
     *
     * @return \Illuminate\Database\Eloquent\Collection|Comment[]
     */
    public function likedComments()
    {
        return $this
            ->reactions()
            ->where('is_like', true)
            ->whereNotNull('comment_id')
            ->get();
    }


    /**
     * Get this User's Comments
     *
     * @return \Illuminate\Database\Eloquent\Collection|Comment[]
     */
    public function comments()
    {
        return $this->hasMany(Comment::class);
    }
}
