import {
  createSelector,
  createSlice,
  isAnyOf,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { Post } from "../../types/Models";
import { createAppAsyncThunk } from "../util";
import type { RootState } from "../store";
import type { PostForm, UpdatePostForm } from "../../types/Forms";
import { csrfFetch } from "../../util/csrfFetch";

const PREFIX = "posts";

const GET_RECENT_POSTS = `${PREFIX}/getRecentPosts`;
const GET_POST = `${PREFIX}/getPost`;
const GET_USER_POSTS = `${PREFIX}/getUserPosts`;
const CREATE_POST = `${PREFIX}/createPost`;
const UPDATE_POST = `${PREFIX}/updatePost`;
const DELETE_POST = `${PREFIX}/deletePost`;

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

export const createPost = createAppAsyncThunk(
  CREATE_POST,
  async (form: PostForm, { fulfillWithValue, rejectWithValue }) => {
    const formData = new FormData();
    formData.append("image", form.image);
    formData.append("caption", form.caption);

    const res = await csrfFetch("/api/post", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      return rejectWithValue(data);
    }

    return fulfillWithValue(data);
  },
);

export const updatePost = createAppAsyncThunk(
  UPDATE_POST,
  async (form: UpdatePostForm, { fulfillWithValue, rejectWithValue }) => {
    const res = await csrfFetch(`/api/post/${form.postId}`, {
      method: "PUT",
      body: JSON.stringify({ caption: form.caption }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (!res.ok) {
      return rejectWithValue(data);
    }

    return fulfillWithValue(data);
  },
);

export const deletePost = createAppAsyncThunk(
  DELETE_POST,
  async (postId: number, { fulfillWithValue, rejectWithValue }) => {
    const res = await csrfFetch(`/api/post/${postId}`, {
      method: "DELETE",
    });

    const data = await res.json();

    if (!res.ok) {
      return rejectWithValue(data);
    }

    return fulfillWithValue({ ...data, postId });
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
  (ps: PostsState) => Object.values(ps.posts),
);

export const selectOrderedPosts = createSelector(
  [(state: RootState) => state.posts],
  (ps: PostsState) => ps.order.map((id) => ps.posts[id]),
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
    builder.addCase(deletePost.fulfilled, (state, action) => {
      delete state.posts[action.payload.postId];
    });
    builder
      .addMatcher(
        (action) =>
          isAnyOf(
            getPost.fulfilled,
            createPost.fulfilled,
            updatePost.fulfilled,
          )(action),
        (state, action: PayloadAction<Post>) => {
          state.posts[action.payload.id] = action.payload;
        },
      )
      .addMatcher(
        (action) => isAnyOf(getRecentPosts.fulfilled)(action),
        (state, action: PayloadAction<{ posts: Post[] }>) => {
          for (const post of action.payload.posts) {
            if (state.order.includes(post.id)) return;

            state.posts[post.id] = post;
            state.order.push(post.id);
          }
        },
      );
  },
});
