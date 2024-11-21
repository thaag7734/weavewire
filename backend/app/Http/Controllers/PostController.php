<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\User;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\File;

class PostController extends Controller
{
    /**
     * Show a specific post by its id
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(int $postId)
    {
        $post = Post::find($postId);

        if (!$post) {
            return response()->json(['error' => 'Post not found'], 404);
        }

        return response()->json($post);
    }

    /**
     * Create a new post
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'caption' => 'required|string|max:512',
            'image' => 'required|mimes:apng,avif,gif,jpeg,png,webp',
        ]);

        /*if (!$request->user()) {*/
        /*    return response()->json([*/
        /*        'message' => 'You must be logged in to access this endpoint'*/
        /*    ]);*/
        /*}*/

        $path = $request->file('image')->store('images', 's3');
        $imageFilename = explode('/', $path)[1];

        $post = Post::create([
            'author_id' => $request->user()->id,
            'caption' => $validated['caption'],
            'image_file' => $imageFilename,
        ]);

        return response()->json($post);
    }

    /**
     * Update a post
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, int $postId)
    {
        $validated = $request->validate([
            'caption' => 'required|string|max:512',
        ]);

        /** @var \App\Models\User $user */
        $user = $request->user();
        /*if (!$user) {*/
        /*    return response()->json([*/
        /*        'message' => 'You must be logged in to access this endpoint',*/
        /*    ], 401);*/
        /*}*/

        /** @var \App\Models\Post $Post */
        $post = Post::query()->whereKey($postId)->first();
        if (!$post) {
            return response()->json([
                'message' => 'Post not found',
            ], 404);
        }

        if ($post->author_id != $user->id) {
            return response()->json([
                'message' => 'You are not authorized to update this post'
            ], 403);
        }

        try {
            $post->update([
                'caption' => $validated['caption'],
            ]);

            return response()->json([
                'message' => 'Post updated successfully',
                'post' => $post->jsonSerialize(),
            ]);
        } catch (Exception $e) {
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
        /*if (!$user) {*/
        /*    return response()->json([*/
        /*        'message' => 'You must be logged in to access this endpoint'*/
        /*    ], 401);*/
        /*}*/

        /** @var \App\Models\Post $post */
        $post = Post::query()->whereKey($postId)->first();
        if (!$post) {
            return response()->json([
                'message' => 'Post not found'
            ], 404);
        }

        if ($user->id != $post->author_id) {
            return response()->json([
                'message' => 'You are not authorized to delete this post'
            ], 403);
        }

        $imageFile = '/images/' . $post->image_file;
        $s3 = Storage::disk('s3');

        try {
            if ($s3->exists($imageFile)) {
                $s3->delete($imageFile);
            }

            $post->delete();

            return response()->json(['message' => 'Post deleted successfully'], 200);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'An error occurred while deleting the post',
            ], 500);
        }
    }
}
