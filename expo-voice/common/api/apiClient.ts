import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { API_URL } from "../config";
import { store } from '../redux/store';

export const noAuthApiClient = axios.create({
    baseURL: API_URL,
});
export const ApiClient = () => (axios.create({
    baseURL: API_URL,
}));