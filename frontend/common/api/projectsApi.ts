import { ApiResponse, ApiResponseListData } from "../types/apiTypes"
import { baseCredentials } from "../types/authTypes"
import { addProjectPostData, deleteProjectData } from "../types/projectsTypes"
import { ProjectData } from "../types/systemTypes"
import { apiErrorHandlerWrapper } from "../utils"
import { noAuthApiClient } from "./apiClient"


export const projectsApi = {

    getProjects: (credentials: baseCredentials): Promise<ApiResponseListData<ProjectData>> =>
        apiErrorHandlerWrapper(noAuthApiClient.get('/projects/get_all', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${credentials.token}`  // Replace with actual token if needed
            }
        })),

    addProject: (data: addProjectPostData): Promise<ApiResponse<ProjectData>> =>
        apiErrorHandlerWrapper(noAuthApiClient.post('/projects/create', data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${data.token}`  // Replace with actual token if needed
            }
        })),

    deleteProject: (data: deleteProjectData): Promise<ApiResponse<ProjectData>> =>
        apiErrorHandlerWrapper(noAuthApiClient.delete(`/projects`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${data.token}`  // Replace with actual token if needed
            },
            data: JSON.stringify({ project_id: data.project_id})
        })),

}