
export interface ApiError {
    message: {
        error: string;
    }
};
export type ApiResponseListData<T> = T[] | ApiError;
export type ApiResponse<T, P = any> = T | ApiError;
export type ApiListData<T> = T[];
