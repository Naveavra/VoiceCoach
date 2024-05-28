import { useCallback, useEffect } from "react";
import { getProjects } from "../redux/projectsReducer";
import { useUtilities } from "./useUtilities";

interface useProjectsProps {
    token: string | null;
    //todo: add more props
}

export const useProjects = ({ token }: useProjectsProps) => {
    const { dispatch, useAppSelector } = useUtilities();
    const projects = useAppSelector((state) => state.projects.projects);
    const isLoadingProjects = useAppSelector((state) => state.projects.isLoadingProjects);
    const selectedProject = useAppSelector((state) => state.projects.selectedProject);
    const error = useAppSelector((state) => state.projects.error);
    const msg = useAppSelector((state) => state.projects.msg);

    const reloadData = useCallback(() => {
        dispatch(getProjects({ token: token }));
    }, [dispatch]);

    useEffect(() => {
        if (!isLoadingProjects && projects.length === 0 && token) {
            dispatch(getProjects({ token: token }))
        }
    }, [dispatch]);




    return { isLoadingProjects, projects, selectedProject, error, msg, reloadData };
}