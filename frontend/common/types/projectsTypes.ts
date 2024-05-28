import { baseCredentials } from "./authTypes";

export interface addProjectPostData extends baseCredentials {
    parasha: string;
    aliyah: string;
    description: string;
    //todo add parasha
}

export interface deleteProjectData extends baseCredentials {
    project_id: number;
}

export interface getVersionsData extends baseCredentials {
    project_id: number;
}