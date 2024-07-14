import { useDispatch, TypedUseSelectorHook, useSelector } from "react-redux"
import { AppDispatch, RootState } from "../redux/store"


export const useUtilities = () => {
  
    const useAppDispatch: () => AppDispatch = useDispatch // Export a hook that can be reused to resolve types
    const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
    const dispatch = useAppDispatch()
    
    return {
        dispatch,
        useAppSelector,
    }
}
