import { useDispatch, TypedUseSelectorHook, useSelector } from "react-redux"
import { AppDispatch, RootState } from "../redux/store"
import { useNavigation } from "@react-navigation/native"
import { StackNavigation } from "../../AppNavigation"


export const useUtilities = () => {
    // Infer the `RootState` and `AppDispatch` types from the store itself
    // Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}

    const useAppDispatch: () => AppDispatch = useDispatch // Export a hook that can be reused to resolve types
    const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
    const dispatch = useAppDispatch()
    const useAppNavigation = useNavigation<StackNavigation>;
    const { navigate } = useAppNavigation();
    return {
        dispatch,
        useAppSelector,
        navigate,
    }
}
