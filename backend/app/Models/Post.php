<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;

/**
 * Class Post
 *
 * @property int $id
 * @property int $author_id
 * @property string $image_id
 * @property string $caption
 * @property
 */
class Post extends Model
{
    /** @use HasFactory<\Database\Factories\PostFactory> */
    use HasFactory;

    protected $fillable = [
        'author_id',
        'image_file',
        'caption',
    ];

    public function author()
    {
        return $this->belongsTo(User::class);
    }

    public function reactions()
    {
        return $this->hasMany(Reaction::class);
    }

    public function comments()
    {
        return Comment::with('author')
            ->where(
                'reply_path',
                '~',
                '^[0-9]+$'
            )
            ->where(
                'post_id',
                '=',
                $this->id
            );
    }
}
