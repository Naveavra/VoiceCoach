import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ApiListData, ApiError } from "../types/apiTypes";
import { addCommentData, addSessionData, deleteSessionData, getVersionsData as getSessionsData } from "../types/requestTypes";
import { ProjectData, SessionData } from "../types/systemTypes";
import { projectApi } from "../api/projectApi";
import { sessionApi } from "../api/sessionApi";
import { emptyProject, emptySession } from "../data/consts";




const reducerName = 'project';

interface projectState {
    sessions: SessionData[];
    project: ProjectData;
    isLoadingProject: boolean;
    error: string | null;
    msg: string | null;
    selectedSession: SessionData;
}

const initialState: projectState = {
    sessions: [],
    project: emptyProject,
    isLoadingProject: false,
    error: null,
    msg: null,
    selectedSession: emptySession
};


export const getProjectData = createAsyncThunk<
    { project: ProjectData, sessions: ApiListData<SessionData> },
    getSessionsData,
    { rejectValue: ApiError }
>(`${reducerName}/getVersions`,
    async (params, thunkApi) => {
        return projectApi
            .getData(params)
            .then((res) => thunkApi.fulfillWithValue(res as { project: ProjectData, sessions: ApiListData<SessionData> }))
            .catch((res) => thunkApi.rejectWithValue(res as ApiError));
    });

export const addSession = createAsyncThunk<
    SessionData,
    addSessionData,
    { rejectValue: ApiError }
>(`${reducerName}/addSession`,
    async (params, thunkApi) => {
        return sessionApi
            .addSession(params)
            .then((res) => thunkApi.fulfillWithValue(res as SessionData))
            .catch((res) => thunkApi.rejectWithValue(res as ApiError));
    });

export const deleteSession = createAsyncThunk<
    SessionData,
    deleteSessionData,
    { rejectValue: ApiError }
>(`${reducerName}/deleteSession`,
    async (params, thunkApi) => {
        return sessionApi
            .deleteSession(params)
            .then((res) => thunkApi.fulfillWithValue(res as SessionData))
            .catch((res) => thunkApi.rejectWithValue(res as ApiError));
    });

export const addComment = createAsyncThunk<
    null,
    addCommentData,
    { rejectValue: ApiError }
>(`${reducerName}/addComment`,
    async (params, thunkApi) => {
        return sessionApi
            .addComment(params)
            .then((res) => thunkApi.fulfillWithValue(res as null))
            .catch((res) => thunkApi.rejectWithValue(res as ApiError));
    });


export const projectReducer = createSlice({
    name: reducerName,
    initialState,
    reducers: {
        clearProject: (state) => {

            state.sessions = [];
            state.isLoadingProject = false;
            state.error = null;
            state.msg = null;
        },
        cleanStateMsg: (state) => {
            state.msg = null;
        },
        selectSession: (state, action) => {
            state.selectedSession = state.sessions.find(s => s.id === action.payload) ?? emptySession
        },
        cleanSession: (state) => {
            state.selectedSession = emptySession
        },
        setSeenMsg: (state, action) => {
            state.sessions = state.sessions.map(session =>
                session.id === action.payload && session.new_comment
                    ? { ...session, new_comment: false }
                    : session
            );
            state.selectedSession = { ...state.selectedSession, new_comment: false }
        }
    },
    extraReducers: (builder) => {
        builder.addCase(getProjectData.pending, (state) => {
            state.isLoadingProject = true;
            state.error = null;
            state.msg = null;
        });
        builder.addCase(getProjectData.fulfilled, (state, { payload }) => {
            state.isLoadingProject = false;
            state.sessions = payload.sessions;
            state.project = payload.project;
        });
        builder.addCase(getProjectData.rejected, (state, action) => {
            state.isLoadingProject = false;
            state.error = action.payload?.message.error || 'An error occurred';
            state.msg = null;
        });
        //add session
        builder.addCase(addSession.pending, (state) => {
            state.isLoadingProject = true;
        });
        builder.addCase(addSession.fulfilled, (state, { payload }) => {
            state.isLoadingProject = false;
            state.sessions.push(payload);
            state.selectedSession = payload;
        });
        builder.addCase(addSession.rejected, (state, action) => {
            state.isLoadingProject = false;
            state.error = action.payload?.message.error || 'An error occurred';
            state.msg = null;
        });

        //delete session
        builder.addCase(deleteSession.pending, (state) => {
            state.isLoadingProject = true;
        });
        builder.addCase(deleteSession.fulfilled, (state, { payload }) => {
            state.isLoadingProject = false;
            state.sessions = state.sessions.filter(s => s.id !== payload.id);
        });
        builder.addCase(deleteSession.rejected, (state, action) => {
            state.isLoadingProject = false;
            state.error = action.payload?.message.error || 'An error occurred';
            state.msg = null;
        });
        //addCommnet
        builder.addCase(addComment.pending, (state) => {
            state.isLoadingProject = true;
        })
        builder.addCase(addComment.fulfilled, (state, { payload }) => {
            state.isLoadingProject = false;
        });
        builder.addCase(addComment.rejected, (state, action) => {
            state.isLoadingProject = false;
            state.error = action.payload?.message.error || 'An error occurred';
            state.msg = null;
        });


    },
});

export const { clearProject, cleanStateMsg, cleanSession, selectSession, setSeenMsg } = projectReducer.actions;