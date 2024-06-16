import { configureStore } from "@reduxjs/toolkit";
import { authReducer } from "./authReducer";
import { projectsReducer } from "./projectsReducer";
import { projectReducer } from "./projectReducer";
import { globalReducer } from "./globalReducer";

export const store = configureStore({
  reducer: {
    auth: authReducer.reducer,
    projects: projectsReducer.reducer,
    project: projectReducer.reducer,
    global: globalReducer.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;