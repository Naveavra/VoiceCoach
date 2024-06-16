import { ApiResponse, ApiResponseListData } from "../types/apiTypes"
import { baseCredentials, getProjectData } from "../types/requestTypes"
import { addProjectPostData, deleteProjectData } from "../types/requestTypes"
import { ProjectData } from "../types/systemTypes"
import { apiErrorHandlerWrapper } from "../utils"
import { noAuthApiClient } from "./apiClient"

export const projectsApi = {

    getProjects: (credentials: getProjectData): Promise<ApiResponseListData<ProjectData>> =>
        apiErrorHandlerWrapper(noAuthApiClient.get('/projects/get_all', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${credentials.token}`
            },
            params: {
                state: credentials.state
            }
        })),

    addProject: (data: addProjectPostData): Promise<ApiResponse<ProjectData>> =>
        apiErrorHandlerWrapper(noAuthApiClient.post('/projects/create', data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${data.token}`
            }
        })),

    deleteProject: (data: deleteProjectData): Promise<ApiResponse<ProjectData>> =>
        apiErrorHandlerWrapper(noAuthApiClient.delete(`/projects`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${data.token}`
            },
            data: JSON.stringify({ project_id: data.project_id })
        })),

}