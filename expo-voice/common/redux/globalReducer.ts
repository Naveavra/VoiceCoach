import { createSlice } from "@reduxjs/toolkit";



const reducerName = 'global';

interface GlobalState {
    state: 'MyProjects' | 'SharedProjects'
    commentDialog: boolean
    //todo add more states
}


const initialState: GlobalState = {
    state: 'MyProjects',
    commentDialog: false
};


export const globalReducer = createSlice({
    name: reducerName,
    initialState,
    reducers: {
        setGlobalState: (state, action) => {
            state.state = action.payload;
        },
        setCommentDialog: (state, { payload }) => {
            state.commentDialog = payload
        }
    }
});


export const { setGlobalState, setCommentDialog } = globalReducer.actions;
