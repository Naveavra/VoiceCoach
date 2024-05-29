import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ApiListData, ApiError } from "../types/apiTypes";
import { getVersionsData } from "../types/projectsTypes";
import { ProjectData, SessionData } from "../types/systemTypes";
import { projectApi } from "../api/projectApi";




const reducerName = 'project';

interface projectState {
    versions: SessionData[];
    isLoadingProject: boolean;
    error: string | null;
    msg: string | null;
}

const initialState: projectState = {
    versions: [],
    isLoadingProject: false,
    error: null,
    msg: null,
};


export const getProjectData = createAsyncThunk<
    { versions: ApiListData<SessionData>, project: ProjectData },
    getVersionsData,
    { rejectValue: ApiError }
>(`${reducerName}/getVersions`,
    async (params, thunkApi) => {
        return projectApi
            .getData(params)
            .then((res) => thunkApi.fulfillWithValue(res as { versions: ApiListData<SessionData>, project: ProjectData }))
            .catch((res) => thunkApi.rejectWithValue(res as ApiError));
    });



export const projectReducer = createSlice({
    name: reducerName,
    initialState,
    reducers: {
        clearProject: (state) => {
           
            state.versions = [];
            state.isLoadingProject = false;
            state.error = null;
            state.msg = null;
        },
        cleanStateMsg: (state) => {
            state.msg = null;
        },
        

    },
    extraReducers: (builder) => {
        builder.addCase(getProjectData.pending, (state) => {
            state.isLoadingProject = true;
            state.error = null;
            state.msg = null;
        });
        builder.addCase(getProjectData.fulfilled, (state, { payload }) => {
            state.isLoadingProject = false;
            state.versions = payload.versions;
            if (payload.project.sample_url == null) {
                state.msg = 'No sample found';
            }
        });
        builder.addCase(getProjectData.rejected, (state, action) => {
            state.isLoadingProject = false;
            state.error = action.payload?.message.error || 'An error occurred';
            state.msg = null;
        });


    },
});

export const { clearProject, cleanStateMsg } = projectReducer.actions;