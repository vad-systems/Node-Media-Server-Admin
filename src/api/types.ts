export interface ComponentStatus {
    running: boolean;
}

export interface ServerStatus {
    av: ComponentStatus;
    fission: ComponentStatus;
    relay: ComponentStatus;
    rtmp: ComponentStatus;
    trans: ComponentStatus;
    switch: ComponentStatus;
}

export interface ServerInfo {
    os: {
        arch: string;
        platform: string;
        release: string;
    };
    cpu: {
        num: number;
        load: number;
        model: string;
        speed: number;
    };
    mem: {
        total: number;
        free: number;
    };
    net: {
        inbytes: number;
        outbytes: number;
    };
    nodejs: {
        uptime: number;
        version: string;
        mem: object;
    };
    clients: {
        accepted: number;
        active: number;
        idle: number;
        rtmp: number;
        http: number;
        ws: number;
    };
    version: string;
}

export interface HttpConfig {
    mediaroot?: string;
    port?: number;
    allow_origin?: string;
    api?: boolean;
    webroot?: string;
}

export interface HttpsConfig {
    port?: number;
    key?: string;
    cert?: string;
    passphrase?: string;
}

export interface RtmpConfig {
    port?: number;
    ssl?: {
        port?: number;
        key?: string;
        cert?: string;
    };
    chunk_size?: number;
    ping?: number;
    ping_timeout?: number;
    gop_cache?: boolean;
}

export interface TransTaskConfig {
    app: string;
    pattern: string;
    rtmp?: boolean;
    rtmpApp?: string;
    mp4?: boolean;
    mp4Flags?: string;
    hls?: boolean;
    hlsFlags?: string;
    hlsKeep?: boolean;
    dash?: boolean;
    dashFlags?: string;
    dashKeep?: boolean;
    vc?: string;
    vcParam?: string[];
    ac?: string;
    acParam?: string[];
}

export interface TransConfig {
    ffmpeg: string;
    tasks: TransTaskConfig[];
}

export interface RelayTaskConfig {
    mode: 'push' | 'pull';
    edge?: string;
    rescale?: string;
    rtsp_transport?: 'udp' | 'tcp' | 'udp_multicast' | 'http';
    appendName?: boolean;
    app?: string;
    pattern?: string;
}

export interface RelayConfig {
    ffmpeg: string;
    tasks: RelayTaskConfig[];
}

export interface FissionModelConfig {
    vb?: string;
    vf?: string;
    vs?: string;
    ab?: string;
}

export interface FissionTaskConfig {
    app: string;
    pattern: string;
    model: FissionModelConfig[];
}

export interface FissionConfig {
    ffmpeg: string;
    tasks: FissionTaskConfig[];
}

export interface SwitchTaskConfig {
    app: string;
    name: string;
    sources: string[];
    defaultSource?: string;
    switchTimeout?: number;
    slatePath?: string;
}

export interface SwitchConfig {
    tasks: SwitchTaskConfig[];
}

export interface Config {
    http: HttpConfig;
    https: HttpsConfig;
    rtmp?: RtmpConfig;
    trans?: TransConfig;
    relay?: RelayConfig;
    fission?: FissionConfig;
    switch?: SwitchConfig;
    auth?: AuthConfig;
    cluster?: object;
    logType?: number;
    rollingLogLength?: number;
}

export interface AuthConfig {
    api?: boolean;
    api_user?: string;
    api_pass?: string;
    play?: boolean;
    publish?: boolean;
    secret?: string;
}

export interface PublisherInfo {
    app: string;
    stream: string;
    clientId: string;
    ip: string;
    protocol: string;
    connectCreated: number;
    video: {
        codec: string;
        width: number;
        height: number;
        profile: string;
        level: number;
        fps: number;
    } | null;
    audio: {
        codec: string;
        profile: string;
        channels: number;
        samplerate: number;
    } | null;
    bytes: number;
}

export interface SubscriberInfo {
    app: string;
    stream: string;
    clientId: string;
    connectCreated: number;
    bytes: number;
    ip: string;
    protocol: string;
}

export interface StreamStats {
    [app: string]: {
        [name: string]: {
            key: string;
            app: string;
            name: string;
            publisher: PublisherInfo | null;
            subscribers: SubscriberInfo[];
        };
    };
}

export interface SingleStreamInfo {
    isLive: boolean;
    viewers: number;
    duration: number;
    bitrate: number;
    startTime: number | null;
    arguments: object;
}

export interface RelayInfo {
    app: string;
    name: string;
    path: string;
    url: string;
    mode: string;
    ts: number;
    id: string;
}

export interface FissionStats {
    [app: string]: {
        [name: string]: {
            fission: Array<{
                app: string;
                name: string;
                path: string;
                id: string;
                ts: number;
                config: object;
            }>;
        };
    };
}

export interface RelayStats {
    [app: string]: {
        [name: string]: {
            relays: RelayInfo[];
        };
    };
}

export interface TransStats {
    [app: string]: {
        [name: string]: {
            trans: Array<{
                app: string;
                name: string;
                path: string;
                id: string;
                ts: number;
                config: object;
            }>;
        };
    };
}

export interface SwitchTaskStatus {
    app: string;
    name: string;
    outputPath: string;
    activeSource: string | null;
    pendingSource: string | null;
    isSwitching: boolean;
    sources: string[];
    defaultSource: string | null;
    slatePath: string | null;
}

export type SwitchStats = SwitchTaskStatus[];

export interface SwitchRequest {
    path: string;
    source: string;
}
