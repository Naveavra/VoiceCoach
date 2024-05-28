export interface RegisterResponse {
    msg: string
}


export interface TokenResponse {
    token: string;
    data: AppUserData;
}
export interface AppUserData {
    id: string;
    name: string;
    email: string;
}

export interface ProjectData {
    id: number;
    parasha: string;
    aliyah: string;
    description: string;
    sample_url: string;
    device_uri: string;
    createdAt: string;
}

export interface SessionData {
    id: string;
    projectId: string;
    createdAt: string;
}