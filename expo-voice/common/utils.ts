import { AxiosResponse } from 'axios';
import { ApiResponse, ApiResponseListData } from './types/apiTypes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

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

export const formatDate = (input: string, return_seconds: boolean): string => {
    const date = new Date(input);


    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = date.getUTCFullYear().toString();

    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const seconds = date.getUTCSeconds().toString().padStart(2, '0');
    if (return_seconds) {
        return `${day}-${month}-${year}-${hours}:${minutes}:${seconds}`;
    }
    return `${day}-${month}-${year} ${hours}:${minutes}`;
}

export const timeStringToMillis = (timeStr: string): number => {
    const [minutes, seconds, millis] = timeStr?.split(':').map(Number);
    return (minutes * 60 * 1000) + (seconds * 1000) + millis;
};
export const calculateDuration = (startTime: string, endTime: string): number => {
    const startMillis = timeStringToMillis(startTime);
    const endMillis = timeStringToMillis(endTime);
    return endMillis - startMillis;
};

export const millisToTimeString = (durationMillis: number): string => {
    const minutes = Math.floor(durationMillis / 60000);
    const seconds = Math.floor((durationMillis % 60000) / 1000);
    const millis = Math.floor((durationMillis % 1000) / 10); // Convert to two-digit milliseconds

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    const formattedMillis = String(millis).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}:${formattedMillis}`;
};

export const delay = (milliseconds: number | undefined) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
};

// path_to_sample = `project_#{project.id}`
// path_to_session = `session_${session.id}`

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

export const alertError = (msg: string, onClick: () => void) => {
    Alert.alert('Error', msg, [
        {
            text: 'OK',
            onPress: onClick,
            style: 'cancel',
        },
    ]);
}

export const formatTime = (time: number): string => {
    const mins = Math.floor(time / 60);
    const secs = time % 60;
    const paddedMins = mins < 10 ? `0${mins}` : mins;
    const paddedSecs = secs < 10 ? `0${secs}` : secs;
    return `${paddedMins}:${paddedSecs}`;
}

