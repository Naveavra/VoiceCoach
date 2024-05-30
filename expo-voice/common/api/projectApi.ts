import { ApiResponseListData } from "../types/apiTypes";
import { getVersionsData as getSessionsData } from "../types/requestTypes";
import { ProjectData, SessionData } from "../types/systemTypes";
import { apiErrorHandlerWrapper } from "../utils";
import { noAuthApiClient } from "./apiClient";

export const projectApi = {


    getData: (data: getSessionsData): Promise<{ sessions: ApiResponseListData<SessionData>}> =>
        apiErrorHandlerWrapper(noAuthApiClient.get(`/projects/${data.project_id}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${data.token}`  // Replace with actual token if needed
            }
        })),
}