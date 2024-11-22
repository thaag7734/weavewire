import { createSlice, isAnyOf, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../../types/Models";
import { csrfFetch } from "../../util/csrfFetch";
import { createAppAsyncThunk } from "../util";
import type { LoginForm } from "../../types/Forms";

const PREFIX = "session";

const LOGIN = `${PREFIX}/login`;

export const login = createAppAsyncThunk(
  LOGIN,
  async (credentials: LoginForm, { fulfillWithValue, rejectWithValue }) => {
    const res = await csrfFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (!res.ok) {
      return rejectWithValue(data);
    }

    return fulfillWithValue(data);
  },
);

export interface SessionState {
  user: User | null;
}

const initialState: SessionState = { user: null };

export const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      (action) => isAnyOf(login.fulfilled)(action),
      (state, action: PayloadAction<User>) => {
        state.user = action.payload;
      },
    );
  },
});
