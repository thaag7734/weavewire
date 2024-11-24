<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use \App\Models\Comment;

class CommentController extends Controller
{
    /**
     * Show a specific comment by its id
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(int $commentId)
    {
        $comment = Comment::with('author')->find($commentId);

        if (!$comment) {
            return response()->json(['message' => 'Comment not found'], 404);
        }

        $commentArr = $comment->toArray();
        $author = $commentArr['author'];

        unset($author['email'], $author['email_verified_at'], $author['updated_at']);
        $commentArr['author'] = $author;

        return response()->json($commentArr);
    }

    /**
     * Show the full reply tree for a comment
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function showReplies(int $commentId)
    {
        $rootComment = Comment::find($commentId);

        if (!$rootComment) {
            return response()->json(['message' => 'Comment not found'], 404);
        }

        $comments = $rootComment->replies()->get();

        // TODO seriously this needs to be turned into a scope or something
        $safeComments = $comments->map(function (Comment $comment) {
            $commentArr = $comment->toArray();
            $author = $commentArr['author'];

            unset($author['email'], $author['email_verified_at'], $author['updated_at']);
            $commentArr['author'] = $author;

            return $commentArr;
        });

        return response()->json(['replies' => $safeComments]);
    }
}
