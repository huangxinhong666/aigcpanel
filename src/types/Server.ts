export enum EnumServerStatus {
    STOPPED = 'stopped',
    STARTING = 'starting',
    RUNNING = 'running',
    STOPPING = 'stopping',
    ERROR = 'error',
}

export enum EnumServerType {
    LOCAL = 'local',
    LOCAL_DIR = 'localDir',
    CLOUD = 'cloud',
}

export type ServerRecord = {
    key: string,
    name: string,
    title: string,
    version: string,
    type?: EnumServerType,
    functions: string[],
    localPath?: string,
    settings?: {
        name: string,
        type: string,
        title: any,
        default: any,
        placeholder: string,
        options?: {
            value: any,
            label: string,
        }[]
    }[]
    setting?: {
        [key: string]: any,
    },
    cloudConfig?: any,
    status?: any,
    runtime?: any,
}

export type ServerRuntime = {
    status: EnumServerStatus,
    // shellController: any,
    // httpUrl: string,
    logFile: string,
    pingCheckTimer?: any,
    startTimestampMS?: number,
    eventChannelName?: string,
}


