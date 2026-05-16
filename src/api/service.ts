import { Config, FissionStats, RelayInfo, RelayStats, ServerInfo, ServerStatus, SingleStreamInfo, StaticStats, StreamsTree, StreamStats, SwitchRequest, SwitchStats, TransStats } from './types';

const API_BASE_URL = process.env.API_BASE_URL || '';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${path}`;
    const response = await fetch(url, {
        credentials: 'include',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || response.statusText);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return response.json();
    }

    throw new Error('Unexpected response type');
}

export const api = {
    getServerInfo: () => request<ServerInfo>('/api/server'),
    getServerStatus: () => request<ServerStatus>('/api/server/status'),
    getConfig: () => request<Config>('/api/server/config'),
    updateConfig: (config: object) => request<Config>('/api/server/config', {
        method: 'PATCH',
        body: JSON.stringify(config),
    }),
    startServer: (server: 'rtmp' | 'av' | 'trans' | 'relay' | 'fission' | 'switch' | 'static') =>
        request<{ status: string }>(`/api/server/${server}/start`, { method: 'POST' }),
    stopServer: (server: 'rtmp' | 'av' | 'trans' | 'relay' | 'fission' | 'switch' | 'static') =>
        request<{ status: string }>(`/api/server/${server}/stop`, { method: 'POST' }),

    getStreams: () => request<StreamStats>('/api/streams'),
    getStreamsTree: () => request<StreamsTree>('/api/streams/tree'),
    getStream: (app: string, stream: string) =>
        request<SingleStreamInfo>(`/api/streams/${app}/${stream}`),
    deleteStream: (app: string, stream: string, sign: string = '') =>
        request<string>(`/api/streams/${app}/${stream}${sign}`, { method: 'DELETE' }),
    stopStream: (app: string, stream: string) =>
        request<{ status: string }>(`/api/streams/${app}/${stream}/stop`, { method: 'POST' }),
    startSession: (id: string) =>
        request<{ status: string }>(`/api/streams/session/${id}/start`, { method: 'POST', body: '{}' }),
    stopSession: (id: string) =>
        request<{ status: string }>(`/api/streams/session/${id}/stop`, { method: 'POST' }),
    restartSession: (id: string) =>
        request<{ status: string }>(`/api/streams/session/${id}/restart`, { method: 'POST' }),

    getFissionTasks: () => request<FissionStats>('/api/fission'),
    deleteFissionTask: (id: string) => request<void>(`/api/fission/${id}`, { method: 'DELETE' }),
    startFissionTask: (id: string) => request<{ status: string }>(`/api/fission/start/${id}`, { method: 'POST', body: '{}' }),
    restartFissionTask: (id: string) => request<void>(`/api/fission/restart/${id}`, { method: 'POST' }),

    getRelayTasks: () => request<RelayStats>('/api/relay'),
    getRelayTask: (id: string) => request<RelayInfo[]>(`/api/relay/${id}`),
    deleteRelayTask: (id: string) => request<void>(`/api/relay/${id}`, { method: 'DELETE' }),
    startRelayTask: (id: string) => request<{ status: string }>(`/api/relay/start/${id}`, { method: 'POST', body: '{}' }),
    restartRelayTask: (id: string) => request<void>(`/api/relay/restart/${id}`, { method: 'POST' }),
    getRelayTasksByStream: (app: string, name: string) =>
        request<RelayInfo[]>(`/api/relay/${app}/${name}`),

    getTransTasks: () => request<TransStats>('/api/trans'),
    deleteTransTask: (id: string) => request<void>(`/api/trans/${id}`, { method: 'DELETE' }),
    startTransTask: (id: string) => request<{ status: string }>(`/api/trans/start/${id}`, { method: 'POST', body: '{}' }),
    restartTransTask: (id: string) => request<void>(`/api/trans/restart/${id}`, { method: 'POST' }),

    getSwitchTasks: () => request<SwitchStats>('/api/switch'),
    triggerSwitch: (data: SwitchRequest) => request<{ status: string }>('/api/switch', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    stopSwitchTask: (path: string) => request<{ status: string }>('/api/switch/stop', {
        method: 'POST',
        body: JSON.stringify({ path }),
    }),

    getStaticTasks: () => request<StaticStats>('/api/static'),

    // Server-sent events stream of log messages.
    getServerLogsUrl: () => `${API_BASE_URL}/api/server/logs`,

    // Server-sent events stream of server info / stats.
    getServerInfoUrl: () => `${API_BASE_URL}/api/server`,
};
