export interface ComponentStatus {
    running: boolean;
}

export interface ServerStatus {
    av: ComponentStatus;
    fission: ComponentStatus;
    http: ComponentStatus;
    relay: ComponentStatus;
    rtmp: ComponentStatus;
    trans: ComponentStatus;
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
}

export interface HttpsConfig {
    port?: number;
}

export interface RtmpConfig {
    port?: number;
    chunk_size?: number;
    ping?: number;
    ping_timeout?: number;
    gop_cache?: boolean;
}

export interface TransConfig {
    ffmpeg: string;
    tasks: object[];
}

export interface RelayConfig {
    ffmpeg: string;
    tasks: object[];
}

export interface FissionConfig {
    ffmpeg: string;
    tasks: object[];
}

export interface Config {
    http: HttpConfig;
    https: HttpsConfig;
    rtmp?: RtmpConfig;
    trans?: TransConfig;
    relay?: RelayConfig;
    fission?: FissionConfig;
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
