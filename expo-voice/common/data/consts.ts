import { ProjectData, SessionData } from "../types/systemTypes";

export const emptyProject: ProjectData = {
    id: -1,
    parasha: '',
    aliyah: '',
    description: '',
    sample_url: '',
    device_uri: '',
    created_at: '',
    clean_text: '',
    mark_text: ''
}

export const emptySession: SessionData = {
    id: -1,
    projectId: '',
    url: '',
    created_at: '',
    analysis : null

}