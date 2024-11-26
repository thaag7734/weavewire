<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Class Comment
 *
 * @property int $id
 * @property int $post_id
 * @property int $author_id
 * @property string|null $reply_path
 * @property string $content
 * @property \Carbon\Carbon $created_at
 * @property \Carbon\Carbon $updated_at
 */
class Comment extends Model
{
    /** @use HasFactory<\Database\Factories\CommentFactory> */
    use HasFactory;

    protected $fillable = [
        'author_id',
        'post_id',
        'reply_path', // not sure if this should actually be fillable or not
        'content',
    ];

    protected static function booted()
    {
        static::created(function (Comment $comment) {
            if (!$comment->reply_path) {
                $comment->reply_path = strval($comment->id);
            } else {
                $comment->reply_path .= ':' . $comment->id;
            }

            $comment->save();
        });
    }

    public function post()
    {
        return $this->belongsTo(Post::class);
    }

    /**
     * this is NOT an eloquent relationship. it may be possible, but i'm not figuring it out tonight.
     * for now it's just querying based on reply_path
     */
    public function replies()
    {
        return Comment::with('author')->where(
            'reply_path',
            '~',
            '^' . $this->reply_path . ':[0-9:]+$'
        );
    }

    public function author()
    {
        return $this->belongsTo(User::class);
    }
}
