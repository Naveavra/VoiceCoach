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
    created_at: string;
    clean_text: string;
    mark_text: string;
}

export interface Analysis {
    teamim: { text: string, start: string, end: string, review: string }[]
    words: [string, number, string][] //[word,typeof,correct_word][]
}
//0 good
//1 exist but not in right place
//2 garbish 

export interface SessionData {
    id: number;
    projectId: string;
    url: string;
    created_at: string;
    analysis: Analysis | null
}