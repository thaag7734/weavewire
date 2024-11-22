import { createSlice, isAnyOf, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../../types/Models";
import { csrfFetch } from "../../util/csrfFetch";
import { createAppAsyncThunk } from "../util";
import type { LoginForm } from "../../types/Forms";
import { ApiMessage } from "../../types/Api";

const PREFIX = "session";

const LOGIN = `${PREFIX}/login`;
const LOGOUT = `${PREFIX}/logout`;

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

export const logout = createAppAsyncThunk(
  LOGOUT,
  async (currentUser: User, { fulfillWithValue, rejectWithValue }) => {
    const res = await csrfFetch("/auth/logout", { method: "POST" });

    if (!res.ok) {
      return rejectWithValue({ 'message': `Logout failed with code ${res.status}` });
    }

    return fulfillWithValue({ 'message': `Logged out user ${currentUser.username}` });
  }
)

export interface SessionState {
  user: User | null;
}

const initialState: SessionState = { user: null };

export const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(logout.fulfilled, (state: SessionState) => {
      state.user = null;
    });
    builder.addMatcher(
      (action) => isAnyOf(login.fulfilled)(action),
      (state, action: PayloadAction<User>) => {
        state.user = action.payload;
      },
    );
  },
});
