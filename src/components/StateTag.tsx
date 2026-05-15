import { Tag } from 'antd';
import React from 'react';
import { BroadcastState, SessionState } from '../api/types';
import { useTranslation } from '../context/LanguageContext';

const sessionStateColor: Record<SessionState, string> = {
    CONNECTING: 'processing',
    CONNECTED: 'cyan',
    STARTING: 'processing',
    RUNNING: 'success',
    STOPPING: 'warning',
    STOPPED: 'default',
    RESTARTING: 'processing',
};

const broadcastStateColor: Record<BroadcastState, string> = {
    REGISTERING: 'processing',
    REGISTERED: 'cyan',
    LIVE: 'success',
    SWITCHING: 'processing',
    OFFLINE: 'default',
    STOPPING: 'warning',
    STOPPED: 'default',
};

type Props =
    | { kind: 'session'; state?: SessionState | null }
    | { kind: 'broadcast'; state?: BroadcastState | null };

const StateTag = (props: Props) => {
    const { t } = useTranslation();
    if (!props.state) return null;
    const color = props.kind === 'session'
        ? sessionStateColor[props.state]
        : broadcastStateColor[props.state];
    const key = props.kind === 'session'
        ? `session_state_${props.state}`
        : `broadcast_state_${props.state}`;
    const label = t(key);
    return <Tag color={color}>{label === key ? props.state : label}</Tag>;
};

export default StateTag;
