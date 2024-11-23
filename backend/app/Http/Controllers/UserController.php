<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Get public details of a user
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(int $userId)
    {
        /** @var User $user */
        $user = User::query()->whereKey($userId)->first();

        if (!$user) {
            return response()->json(['message' => 'User not found']);
        }

        return response()->json([
            'id' => $user->id,
            'username' => $user->username,
            'avatar' => $user->avatar,
            'status' => $user->status,
        ]);
    }

    /**
     * Get all of a user's posts
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function showPosts(int $userId)
    {
        /** @var User $user */
        $user = User::query()->whereKey($userId)->first();

        if (!$user) {
            return response()->json([
                'message' => 'User not found',
            ], 404);
        }

        return response()->json(['posts' => $user->posts], 200);
    }
}
