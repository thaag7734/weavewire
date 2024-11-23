import { configureStore } from "@reduxjs/toolkit";
import { createLogger } from "redux-logger";
import { sessionSlice } from "./reducers/session";
import { postsSlice } from "./reducers/posts";
import { usersSlice } from "./reducers/users";

const isProd = import.meta.env.MODE === "production";

const logger = !isProd ? createLogger() : null;

export const store = configureStore({
  devTools: !isProd,
  middleware: (getDefaultMiddleware) =>
    logger ? getDefaultMiddleware().concat(logger) : getDefaultMiddleware(),
  reducer: {
    session: sessionSlice.reducer,
    posts: postsSlice.reducer,
    users: usersSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
