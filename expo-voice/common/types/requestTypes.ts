
export interface baseCredentials {
    token: string | null;
}
export interface LoginPostData {
    remember_me: boolean;
    email: string;
    password: string;
}
export interface RegisterPostData {
    email: string;
    password: string;
}

export interface addProjectPostData extends baseCredentials {
    parasha: string;
    aliyah: string;
    description: string;
    rabbi_email: string;
}
export interface editProjectData extends baseCredentials {
    project_id: number;
    description?: string;
    rabbi_email?: string;
}

export interface deleteProjectData extends baseCredentials {
    project_id: number;
}

export interface getVersionsData extends baseCredentials {
    project_id: number;
}
export interface addSessionData extends baseCredentials {
    project_id: number;
}

export interface deleteSessionData extends baseCredentials {
    session_id: number;
}
export interface addCommentData extends baseCredentials {
    session_id: number;
    comment: string;
}
