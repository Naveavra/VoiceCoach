import { useCallback, useEffect } from "react";
import { getProjectData } from "../redux/projectReducer";
import { useUtilities } from "./useUtilities";


interface useProjectProps {
    token: string | null;
    project_id: number;
}

export const useProject = ({ token, project_id }: useProjectProps) => {
    const { dispatch, useAppSelector } = useUtilities();
    const sessions = useAppSelector((state) => state.project.sessions);
    const isLoadingProject = useAppSelector((state) => state.project.isLoadingProject);
    const error = useAppSelector((state) => state.project.error);
    const msg = useAppSelector((state) => state.project.msg);


    const reloadData = useCallback(() => {
        dispatch(getProjectData({ token: token, project_id: project_id }));
    }, [dispatch]);

    useEffect(() => {
        if (token && project_id !== -1) {
            //todo check if passed 0 , then dont call and show error
            dispatch(getProjectData({ token: token, project_id: project_id }));
        }
    }, [dispatch, project_id]);

    return { isLoadingProject, sessions, error, msg, reloadData };

}