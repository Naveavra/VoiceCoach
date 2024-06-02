import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { LoginPostData } from "../types/requestTypes";
import { AppUserData, RegisterResponse, TokenResponse } from "../types/systemTypes";
import { authApi } from "../api/authApi";
import { ApiError, ApiResponse } from "../types/apiTypes";
import AsyncStorage from '@react-native-async-storage/async-storage';


const reducerName = "auth";

interface AuthState {
    // Auth
    user: AppUserData | null;
    token: string | null;
    isLoadingUser: boolean;
    error: string | null;
    msg: string | null;

}

const initialState: AuthState = {
    user: null,
    token: null,
    isLoadingUser: false,
    error: null,
    msg: null
};

// #region |=============================== API CALLS ===============================|

export const logIn = createAsyncThunk<
    { remember_me: boolean, response: TokenResponse },
    LoginPostData,
    { rejectValue: ApiError }
>(`${reducerName}/logIn`,
    async (formData, thunkApi) => {
        const { remember_me, ...credentials } = formData;
        return authApi
            .login(formData)
            .then((res) => thunkApi.fulfillWithValue({
                remember_me: remember_me,
                response: res as TokenResponse
            }
            ))
            .catch((res) => thunkApi.rejectWithValue(res as ApiError));
    });

export const register = createAsyncThunk<
    RegisterResponse,
    Omit<LoginPostData, 'remember_me'>,
    { rejectValue: ApiError }
>(`${reducerName}/register`,
    async (credentials, thunkApi) => {
        return authApi
            .register(credentials)
            .then((res) => thunkApi.fulfillWithValue(res as RegisterResponse))
            .catch((res) => thunkApi.rejectWithValue(res as ApiError));
    });

export const initializeDetails = createAsyncThunk(
    `${reducerName}/initializeDetails`,
    async () => {
        const storedToken = await AsyncStorage.getItem('token');
        const userAsString = await AsyncStorage.getItem('user');
        const user: AppUserData | null = userAsString ? JSON.parse(userAsString) : null;
        return { t: storedToken, u: user };
    }
);
export const authReducer = createSlice({
    name: reducerName,
    initialState,
    reducers: {
        initState: (state) => {
            state.user = initialState.user;
            state.token = initialState.token;
            state.isLoadingUser = initialState.isLoadingUser;
            state.error = initialState.error;
            state.msg = initialState.msg;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.error = null;
            AsyncStorage.removeItem('token');
            AsyncStorage.removeItem('user');
        },
        cleanError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {

        builder.addCase(initializeDetails.fulfilled, (state, action: PayloadAction<{ t: string | null, u: AppUserData | null }>) => {
            state.token = action.payload.t;
            state.user = action.payload.u;
        });

        // Log In
        builder.addCase(logIn.pending, (state, action) => {
            state.isLoadingUser = true;
        });
        builder.addCase(logIn.fulfilled, (state, action) => {
            state.user = action.payload.response.data;
            state.token = action.payload.response.token;
            if (action.payload.remember_me) {
                AsyncStorage.setItem('token', action.payload.response.token);
                AsyncStorage.setItem('user', JSON.stringify(action.payload.response.data));
            }
            state.error = null;
            state.isLoadingUser = false;
        });
        builder.addCase(logIn.rejected, (state, { payload }) => {
            state.error = payload?.message.error ?? 'error'
            state.isLoadingUser = false;
        });

        // Register
        builder.addCase(register.pending, (state, action) => {
            state.isLoadingUser = true;
        });
        builder.addCase(register.fulfilled, (state, action) => {
            state.msg = action.payload.msg;
            state.error = null;
            state.isLoadingUser = false;
        });
        builder.addCase(register.rejected, (state, { payload }) => {
            state.error = payload?.message.error ?? 'error'
            state.isLoadingUser = false;
        });
    },
});

export const { logout, initState, cleanError } = authReducer.actions;

export const authSlice = authReducer.reducer;