import { AxiosResponse } from 'axios';
import { ApiResponse, ApiResponseListData } from './types/apiTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export const formatDate = (input: string): string => {
    const date = new Date(input);

    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = date.getUTCFullYear().toString();

    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const seconds = date.getUTCSeconds().toString().padStart(2, '0');

    return `${day}-${month}-${year} ${hours}:${minutes}`;
}

export const delay = (milliseconds: number | undefined) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
};

export const saveAsync = async (key: string, value: any) => {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error("Error saving data:", error);
    }
}

export const getAsync = async (key: string) => {
    try {
        const value = await AsyncStorage.getItem(key)
        return value ? JSON.parse(value) : null;
    } catch (error) {
        console.error("Error getting data:", error);
    }
}

