import React from 'react';

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
    ip: string;
    ac: string;
    freq: string;
    chan: string;
    vc: string;
    size: string;
    fps: string;
    time: string;
    clients: ClientData[];
    clientCount: number;
    isGroup?: boolean;
    children?: StreamData[];
};
