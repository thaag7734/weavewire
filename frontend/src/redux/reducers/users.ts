import {
  createSelector,
  createSlice,
  isAnyOf,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { User } from "../../types/Models";
import { csrfFetch } from "../../util/csrfFetch";
import { createAppAsyncThunk } from "../util";
import type { RootState } from "../store";

const PREFIX = "session";

const GET_USER_DETAILS = `${PREFIX}/getUserDetails`;

export const getUserDetails = createAppAsyncThunk(
  GET_USER_DETAILS,
  async (userId: number, { fulfillWithValue, rejectWithValue }) => {
    const res = await csrfFetch(`/api/user/${userId}`);

    const data = await res.json();

    if (!res.ok) {
      return rejectWithValue(data);
    }

    return fulfillWithValue(data);
  },
);

export const selectUserById = createSelector(
  [
    (state: RootState) => state.users,
    (_state: RootState, userId: number) => userId,
  ],
  (us: UsersState, userId: number) => us.users[userId],
);

export interface UsersState {
  users: Record<string, User>;
}

const initialState: UsersState = { users: {} };

export const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      getUserDetails.fulfilled,
      (state: UsersState, action: PayloadAction<User>) => {
        state.users[action.payload.id] = action.payload;
      },
    );
  },
});
