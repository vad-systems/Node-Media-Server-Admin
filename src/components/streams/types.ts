import React from 'react';
import { BroadcastState, SessionState, SwitchTaskStatus } from '../../api/types';

export type ClientData = {
    app: string;
    stream: string;
    bytes: number;
    clientId: string;
    connectCreated: number;
    ip: string;
    protocol: string;
};

export type StreamData = {
    key: React.Key;
    app: string;
    name: string;
    id: string;
    broadcastId?: string;
    ip: string;
    ac: string;
    freq: string;
    chan: string;
    vc: string;
    size: string;
    fps: string;
    time: string;
    state?: BroadcastState;
    publisherState?: SessionState;
    clients: ClientData[];
    clientCount: number;
    switchInfo?: SwitchTaskStatus;
    isGroup?: boolean;
    children?: StreamData[];
};
