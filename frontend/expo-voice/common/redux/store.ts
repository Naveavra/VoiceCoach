import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "./authReducer";
import { projectsReducer } from "./projectsReducer";
import { projectReducer } from "./projectReducer";

export const store = configureStore({
  reducer: {
    auth: authReducer.reducer,
    projects: projectsReducer.reducer,
    project: projectReducer.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;