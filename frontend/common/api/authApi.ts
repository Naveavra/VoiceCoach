import { LoginPostData } from "../types/authTypes";
import { RegisterResponse, TokenResponse } from "../types/systemTypes";
import { apiErrorHandlerWrapper } from "../utils";
import { noAuthApiClient } from "./apiClient";


export const authApi = {
    login: (credentials: LoginPostData): Promise<TokenResponse> =>
        apiErrorHandlerWrapper(noAuthApiClient.post('/users/login', credentials)),
    register: (credentials: Omit<LoginPostData,'remember_me'>): Promise<RegisterResponse> =>
        apiErrorHandlerWrapper(noAuthApiClient.post('/users/register', credentials)),
}
