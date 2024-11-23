import {
  createSelector,
  createSlice,
  isAnyOf,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { Post } from "../../types/Models";
import { createAppAsyncThunk } from "../util";
import type { RootState } from "../store";

const PREFIX = "posts";

const GET_RECENT_POSTS = `${PREFIX}/getRecentPosts`;
const GET_POST = `${PREFIX}/getPost`;
const GET_USER_POSTS = `${PREFIX}/getUserPosts`;

export const getRecentPosts = createAppAsyncThunk(
  GET_RECENT_POSTS,
  async (page: number | undefined, { fulfillWithValue, rejectWithValue }) => {
    const res = await fetch(`/api/post/all?p=${page ?? 0}`);

    const data = await res.json();

    if (!res.ok) {
      return rejectWithValue(data);
    }

    return fulfillWithValue(data);
  },
);

export const getPost = createAppAsyncThunk(
  GET_POST,
  async (postId: number, { fulfillWithValue, rejectWithValue }) => {
    const res = await fetch(`/api/post/${postId}`);

    const data = await res.json();

    if (!res.ok) {
      return rejectWithValue(data);
    }

    return fulfillWithValue(data);
  },
);

export const getUserPosts = createAppAsyncThunk(
  GET_USER_POSTS,
  async (userId: number, { fulfillWithValue, rejectWithValue }) => {
    const res = await fetch(`/api/user/${userId}/posts`);

    const data = await res.json();

    if (!res.ok) {
      return rejectWithValue(data);
    }

    return fulfillWithValue(data);
  },
);

export const selectPostById = createSelector(
  [
    (state: RootState) => state.posts,
    (_state: RootState, postId: number) => postId,
  ],
  (ps: PostsState, postId: number) => ps.posts[postId],
);

export const selectAllPosts = createSelector(
  [(state: RootState) => state.posts],
  (ps: PostsState) => Object.values(ps.posts)
);

export const selectOrderedPosts = createSelector(
  [(state: RootState) => state.posts],
  (ps: PostsState) => ps.order.map(id => ps.posts[id]),
);

export interface PostsState {
  posts: Record<number, Post>;
  order: number[];
}

const initialState: PostsState = { posts: {}, order: [] };

export const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getPost.fulfilled, (state, action: PayloadAction<Post>) => {
      state.posts[action.payload.id] = action.payload;
    });
    builder.addMatcher(
      (action) => isAnyOf(getRecentPosts.fulfilled)(action),
      (state, action: PayloadAction<{ posts: Post[] }>) => {
        action.payload.posts.forEach((post) => {
          if (state.order.includes(post.id)) return;

          state.posts[post.id] = post;
          state.order.push(post.id);
        });
      },
    );
  },
});
