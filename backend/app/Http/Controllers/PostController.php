<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Comment;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use League\Flysystem\UnableToCheckExistence;

class PostController extends Controller
{
    /**
     * Show a specific post by its id
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(int $postId)
    {
        $post = Post::with('author')->find($postId);

        if (!$post) {
            return response()->json(['message' => 'Post not found'], 404);
        }

        // TODO there is definitely a better way to do this but it's 5:30am
        // and i am going to bed!!!
        $postArr = $post->toArray();
        $author = $postArr['author'];

        unset($author['email'], $author['email_verified_at'], $author['updated_at']);
        $postArr['author'] = $author;


        return response()->json($postArr);
    }

    /**
     * Create a new post
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'caption' => 'nullable|string|max:512',
            'image' => 'required|file|mimes:apng,avif,gif,jpeg,png,webp|max:15360',
        ], [
            'image.max' => 'Image must be smaller than 15MB'
        ]);

        if ($validator->fails()) {
            return response()->json([
                // TODO this is not a permanent solution, fix when implementing toasts
                'message' => implode(
                    $validator->errors()->get('image')
                        ?? $validator->errors()->get('caption')
                )
            ]);
        }

        $validated = $validator->validate();

        $path = $request->file('image')->store('images', 's3');
        if (!$path) {
            return response()->json(['message' => 'Image upload failed'], 500);
        }

        $imageFilename = explode('/', $path)[1];

        /** @var \App\Models\Post $post */
        $post = Post::create([
            'author_id' => $request->user()->id,
            'caption' => $validated['caption'] ?? '',
            'image_file' => $imageFilename,
        ]);

        if ($post) {
            $postArr = $post->toArray();

            $author = User::query()->find($post->author_id)->toArray();
            unset($author['email'], $author['email_verified_at'], $author['updated_at']);
            $postArr['author'] = $author;

            return response()->json($postArr, 201);
        } else {
            return response()->json(['message' => 'Failed to create post'], 500);
        }
    }

    /**
     * Update a post
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, int $postId)
    {
        $validated = $request->validate([
            'caption' => 'nullable|string|max:512',
        ]);

        /** @var \App\Models\User $user */
        $user = $request->user();
        if (!$user) {
            return response()->json([
                'message' => 'You must be logged in to access this endpoint',
            ], 401);
        }


        /** @var \App\Models\Post $Post */
        $post = Post::with('author')->find($postId);
        if (!$post) {
            return response()->json([
                'message' => 'Post not found',
            ], 404);
        }


        if ($post->author_id != $user->id) {
            return response()->json([
                'message' => 'You are not allowed to update this post'
            ], 403);
        }

        try {
            $post->update([
                'caption' => $validated['caption'] ?? '',
            ]);

            return response()->json($post);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred while updating the post'
            ], 500);
        }
    }

    /**
     * Delete a post
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function delete(Request $request, int $postId)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        /** @var \App\Models\Post $post */
        $post = Post::query()->whereKey($postId)->first();
        if (!$post) {
            return response()->json([
                'message' => 'Post not found'
            ], 404);
        }

        if ($user->id != $post->author_id) {
            return response()->json([
                'message' => 'You are not allowed to delete this post'
            ], 403);
        }

        $imageFile = '/images/' . $post->image_file;
        $s3 = Storage::disk('s3');

        try {
            $post->delete();

            if ($s3->exists($imageFile)) {
                $s3->delete($imageFile);
            }

            return response()->json(['message' => 'Post deleted successfully'], 200);
        } catch (\Exception $e) {
            // TODO temporary fix for deletion failing in production for no reason
            if ($e instanceof UnableToCheckExistence) {
                return response()->json([
                    'message' => 'Post deleted successfully, failed to delete image',
                ], 200);
            }

            return response()->json([
                'message' => 'An error occurred while deleting the post',
            ], 500);
        }
    }

    /**
     * Get all posts (paginated), with the most recent being first
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function showAll(Request $request)
    {
        $limit = 15; // this should maybe be customizable
        $offset = intval($request->query('p')) * $limit - 1;
        $offset = $offset < 0 ? 0 : $offset;

        $posts = Post::with('author')
            ->orderBy('created_at', 'desc')
            ->skip($offset)
            ->take($limit)
            ->get();

        // TODO there is definitely a better way to do this but it's 5:30am
        // and i am going to bed!!!
        $safePosts = $posts->map(function (Post $post) {
            $postArr = $post->toArray();
            $author = $postArr['author'];

            unset($author['email'], $author['email_verified_at'], $author['updated_at']);
            $postArr['author'] = $author;

            return $postArr;
        });

        return response()->json(['posts' => $safePosts], 200);
    }

    /**
     * Show the comments for a specific post
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function showComments(int $postId)
    {
        $post = Post::find($postId);

        if (!$post) {
            return response()->json(['message' => 'Post not found'], 404);
        }

        $comments = $post->comments()->get();

        // TODO seriously this needs to be turned into a scope or something
        $safeComments = $comments->map(function (Comment $comment) {
            $commentArr = $comment->toArray();
            $author = $commentArr['author'];
            $commentArr['reply_count'] = $comment->replies()->count();

            unset($author['email'], $author['email_verified_at'], $author['updated_at']);
            $commentArr['author'] = $author;

            return $commentArr;
        });

        return response()->json(['comments' => $safeComments]);
    }
}
