import { ApiResponse } from "../types/apiTypes";
import { addSessionData, deleteSessionData } from "../types/requestTypes";
import { ProjectData } from "../types/systemTypes";
import { apiErrorHandlerWrapper } from "../utils";
import { noAuthApiClient } from "./apiClient";

export const sessionApi = {

    addSession: (data: addSessionData): Promise<ApiResponse<ProjectData>> =>
        apiErrorHandlerWrapper(noAuthApiClient.post(`/sessions/create/${data.project_id}`, data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${data.token}`  // Replace with actual token if needed
            }
        })),

    deleteSession: (data: deleteSessionData): Promise<ApiResponse<ProjectData>> =>
        apiErrorHandlerWrapper(noAuthApiClient.delete(`/sessions/${data.session_id}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${data.token}`  // Replace with actual token if needed
            },
        })),

}