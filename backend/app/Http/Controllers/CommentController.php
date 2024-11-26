<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use \App\Models\Comment;
use App\Models\Post;
use Illuminate\Database\Query\Builder;

class CommentController extends Controller
{
    /**
     * Show a specific comment by its id
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(int $commentId)
    {
        $comment = Comment::with('author')
            ->find($commentId);

        if (!$comment) {
            return response()->json(['message' => 'Comment not found'], 404);
        }

        $commentArr = $comment->toArray();
        $author = $commentArr['author'];
        $commentArr['reply_count'] = $comment->replies()->count();

        unset($author['email'], $author['email_verified_at'], $author['updated_at']);
        $commentArr['author'] = $author;

        return response()->json($commentArr);
    }

    /**
     * Build the reply tree for a particular comment,
     * returning only the replies sorted by creation time (desc)
     */
    private function buildReplyTree(array $rootComment, array $replies): array
    {
        // set up a map to keep track of comments by their id
        $root = $rootComment;
        $root['children'] = [];
        $map = [$root['id'] => &$root];

        foreach ($replies as &$reply) {
            $reply['children'] = [];
            $map[$reply['id']] = &$reply;
        }
        unset($reply);

        // build the tree
        foreach ($replies as &$reply) {
            $pathParts = explode(':', $reply['reply_path']);

            $parentId = $pathParts[count($pathParts) - 2];

            if (isset($map[$parentId])) {
                $map[$parentId]['children'][] = &$reply;
            }
        }
        unset($reply);

        $this->sortReplyTree($root['children']);

        return $root['children'];
    }

    private function sortReplyTree(array &$tree): void
    {
        usort(
            $tree,
            fn($a, $b) => $a['created_at'] <=> strtotime($b['created_at'])
        );

        foreach ($tree as $reply) {
            if (!empty($reply['children'])) {
                $this->sortReplyTree($reply['children']);
            }
        }
    }

    /**
     * Show the full reply tree for a comment
     *
     * this route seems inefficient and i have no clue how it would
     * perform at scale. probably not at all, i suppose
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function showReplies(int $commentId)
    {
        $rootComment = Comment::query()->whereKey($commentId)->first();

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

        return response()->json([
            'replies' => $this->buildReplyTree(
                $rootComment->toArray(),
                $safeComments->toArray()
            )
        ]);
    }

    /**
     * Create a new top-level comment
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request, int $postId)
    {
        $post = Post::query()->find($postId);

        if (!$post) {
            return response()->json(['message' => 'Post not found']);
        }

        $validated = $request->validate([
            'content' => 'required|max:255',
        ]);

        $user = $request->user();

        $comment = Comment::create([
            'author_id' => $user->id,
            'content' => $validated['content'],
            'post_id' => $post->id,
        ]);

        $author = $user->toArray();

        unset($author['email'], $author['email_verified_at'], $author['updated_at']);
        $commentArr = $comment->toArray();

        return response()->json([...$commentArr, 'author' => $author]);
    }
}
