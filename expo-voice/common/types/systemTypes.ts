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
    created_at: string;
    clean_text: string;
    mark_text: string;
    sessions: SessionData[];
}

export interface SessionData {
    id: number;
    projectId: string;
    url: string;
    created_at: string;
}