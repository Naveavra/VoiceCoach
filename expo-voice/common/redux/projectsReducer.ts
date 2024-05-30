import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { projectsApi } from "../api/projectsApi";
import { ApiError, ApiListData } from "../types/apiTypes";
import { ProjectData } from "../types/systemTypes";
import { baseCredentials } from "../types/requestTypes";
import { addProjectPostData, deleteProjectData } from "../types/requestTypes";
import { emptyProject } from "../data/consts";
import { cleanStateMsg } from "./projectReducer";

const reducerName = 'projects';

interface ProjectsState {
    projects: ProjectData[];
    isLoadingProjects: boolean;
    selectedProject: ProjectData;
    error: string | null;
    msg: string | null;
}

const initialState: ProjectsState = {
    projects: [],
    isLoadingProjects: false,
    selectedProject: emptyProject,
    error: null,
    msg: null,
};


export const getProjects = createAsyncThunk<
    ApiListData<ProjectData>,
    baseCredentials,
    { rejectValue: ApiError }
>(`${reducerName}/getProjects`,
    async (params, thunkApi) => {
        return projectsApi
            .getProjects(params)
            .then((res) => thunkApi.fulfillWithValue(res as ApiListData<ProjectData>))
            .catch((res) => thunkApi.rejectWithValue(res as ApiError));
    });

export const addProject = createAsyncThunk<
    ProjectData,
    addProjectPostData,
    { rejectValue: ApiError }
>(`${reducerName}/addProject`,
    async (params, thunkApi) => {
        return projectsApi
            .addProject(params)
            .then((res) => thunkApi.fulfillWithValue(res as ProjectData))
            .catch((res) => thunkApi.rejectWithValue(res as ApiError));
    });

export const deleteProject = createAsyncThunk<
    ProjectData,
    deleteProjectData,
    { rejectValue: ApiError }
>(`${reducerName}/deleteProject`,
    async (params, thunkApi) => {
        return projectsApi
            .deleteProject(params)
            .then((res) => thunkApi.fulfillWithValue(res as ProjectData))
            .catch((res) => thunkApi.rejectWithValue(res as ApiError));
    });


export const projectsReducer = createSlice({
    name: reducerName,
    initialState,
    //todo :add cleaners
    reducers: {
        cleanProjectsState: (state) => {
            state.projects = [];
            state.isLoadingProjects = false;
            state.error = null;
            state.msg = null;
        },
        selectProject: (state, action) => {
            if (state.selectedProject.id !== action.payload) {
                state.selectedProject = state.projects.find(p => p.id === action.payload) ?? emptyProject;
            }
        },
        setSampleUrl: (state, action) => {
            if (state.selectedProject) {
                state.selectedProject.sample_url = action.payload;
                //set sample url in the selected project in the projects state
                state.projects = state.projects.map(p => {
                    if (p.id === state.selectedProject.id) {
                        p.sample_url = action.payload;
                    }
                    return p;
                });
            }
        },
        setDeviceUri: (state, action) => {
            if (state.selectedProject) {
                state.selectedProject.device_uri = action.payload;
                //set device uri in the selected project in the projects state
                state.projects = state.projects.map(p => {
                    if (p.id === state.selectedProject.id) {
                        p.device_uri = action.payload;
                    }
                    return p;
                });
            }
        },
        clearSelectedProject: (state) => {
            state.selectedProject = emptyProject;
        },
    },
    extraReducers: (builder) => {
        // Get Projects
        builder.addCase(getProjects.pending, (state, action) => {
            state.isLoadingProjects = true;
        });
        builder.addCase(getProjects.fulfilled, (state, { payload }) => {
            state.isLoadingProjects = false;
            state.projects = payload
            if (!payload.length) {
                state.msg = "No projects found";
            }
        });
        builder.addCase(getProjects.rejected, (state, action) => {
            state.isLoadingProjects = false;
            state.error = action.payload?.message.error || "An error occurred";
        });

        // Add Project
        builder.addCase(addProject.pending, (state, action) => {
            state.isLoadingProjects = true;
        });
        builder.addCase(addProject.fulfilled, (state, action) => {
            state.isLoadingProjects = false;
            state.projects.push(action.payload);
            state.msg = "Project added successfully";
        });
        builder.addCase(addProject.rejected, (state, action) => {
            state.isLoadingProjects = false;
            state.error = action.payload?.message.error || "An error occurred";
        });

        // Delete Project
        builder.addCase(deleteProject.pending, (state, action) => {
            state.isLoadingProjects = true;
        });
        builder.addCase(deleteProject.fulfilled, (state, action) => {
            state.isLoadingProjects = false;
            state.projects = state.projects.filter(p => p.id !== action.payload.id);
            state.msg = "Project deleted successfully";
        });
        builder.addCase(deleteProject.rejected, (state, action) => {
            state.isLoadingProjects = false;
            state.error = action.payload?.message.error || "An error occurred";
        });
    },
});

export const { cleanProjectsState, selectProject, setDeviceUri, setSampleUrl, clearSelectedProject } = projectsReducer.actions;