import { AxiosResponse } from 'axios';
import { ApiResponse ,ApiResponseListData } from './types/apiTypes';

export const apiErrorHandlerWrapper = (promise: Promise<AxiosResponse>): Promise<ApiResponseListData<any> | ApiResponse<any>> => {
    return promise
        .then((res) => {
            if (res.status >= 500 && res.status < 600) {
                return Promise.reject({
                    message: res.data
                });
            }
            return Promise.resolve(res.data)
        })
        .catch((err) => {
            console.log("err", err);
            return Promise.reject({
                message: err.response.data
                //message: "error in api call"
            })
        });
}