import { createSlice } from "@reduxjs/toolkit";



const reducerName = 'global';

interface GlobalState {
    state: 'MyProjects' | 'SharedProjects'
    //todo add more states
}


const initialState: GlobalState = {
    state: 'MyProjects'
};


export const globalReducer = createSlice({
    name: reducerName,
    initialState,
    reducers: {
        setGlobalState: (state, action) => {
            state.state = action.payload;
        }
    }
});


export const { setGlobalState } = globalReducer.actions;
