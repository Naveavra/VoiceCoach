import { ApiResponse } from "../types/apiTypes";
import { addCommentData, addSessionData, deleteSessionData } from "../types/requestTypes";
import { ProjectData, SessionData } from "../types/systemTypes";
import { apiErrorHandlerWrapper } from "../utils";
import { noAuthApiClient } from "./apiClient";

export const sessionApi = {

    addSession: (data: addSessionData): Promise<ApiResponse<SessionData>> =>
        apiErrorHandlerWrapper(noAuthApiClient.post(`/sessions/create/${data.project_id}`, data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${data.token}`  // Replace with actual token if needed
            }
        })),

    deleteSession: (data: deleteSessionData): Promise<ApiResponse<SessionData>> =>
        apiErrorHandlerWrapper(noAuthApiClient.delete(`/sessions/${data.session_id}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${data.token}`  // Replace with actual token if needed
            },
        })),

    addComment: (data: addCommentData): Promise<ApiResponse<null>> =>
        apiErrorHandlerWrapper(noAuthApiClient.post(`/sessions/add_comment/${data.session_id}`, data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${data.token}`  // Replace with actual token if needed
            },
        })),

}