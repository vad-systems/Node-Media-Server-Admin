import { CameraOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Divider, Space, Tooltip, Typography } from 'antd';
import FlvJs from 'flv.js';
import React, { CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import StateTag from './components/StateTag';
import SwitchControl from './components/streams/SwitchControl';
import { BroadcastState, SessionState, SwitchTaskStatus } from './api/types';
import { api } from './api/service';
import { useFetch } from './hooks/useFetch';
import secondsToDhmsSimple from './util/secondsToDhmsSimple';
import { useTranslation } from './context/LanguageContext';
import MediaSegment = FlvJs.MediaSegment;

type MediaType = 'flv' | 'mp4';

type FlvPlayerProps = {
    className?: string,
    style?: CSSProperties,
    url?: string,
    type: MediaType,
    isLive?: boolean,
    cors?: boolean,
    withCredentials?: boolean,
    hasAudio?: boolean,
    hasVideo?: boolean,
    duration?: number,
    filesize?: number,
    segments?: MediaSegment[],
    config?: FlvJs.Config,
    switchInfo?: SwitchTaskStatus | null,
    onSwitched?: () => void,
    app?: string,
    name?: string,
    streamUptime?: string,
    publisherId?: string,
    publisherState?: SessionState,
    broadcastId?: string,
    broadcastState?: BroadcastState,
};

const FlvPlayer = (props: FlvPlayerProps) => {
    const { t } = useTranslation();
    const [flvPlayer, setFlvPlayer] = useState<FlvJs.Player | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const {
        className, style, switchInfo, onSwitched,
        app, name,
        streamUptime: initialUptime,
        publisherId: initialPublisherId,
        publisherState: initialPublisherState,
        broadcastId: initialBroadcastId,
        broadcastState: initialBroadcastState,
        ...playerProps
    } = props;

    // Self-poll streams so the dialog metadata updates live.
    const { data: streamsData } = useFetch(api.getStreams, {
        immediate: true,
        refreshInterval: 2000,
        enabled: !!app && !!name,
    });

    const live = useMemo(() => {
        if (!app || !name || !streamsData) return null;
        const entry = streamsData[app]?.[name];
        if (!entry) return null;
        const publisher = entry.publisher;
        const uptime = publisher?.connectCreated
            ? secondsToDhmsSimple((Date.now() - new Date(publisher.connectCreated).getTime()) / 1000)
            : undefined;
        return {
            broadcastId: entry.id,
            broadcastState: entry.state,
            uptime,
            publisherId: publisher?.clientId,
            publisherState: publisher?.state,
        };
    }, [streamsData, app, name]);

    const broadcastId = live?.broadcastId ?? initialBroadcastId;
    const broadcastState = live?.broadcastState ?? initialBroadcastState;
    const streamUptime = live?.uptime ?? initialUptime;
    const publisherId = live?.publisherId ?? initialPublisherId;
    const publisherState = live?.publisherState ?? initialPublisherState;

    const streamPath = app && name ? `${app}/${name}` : undefined;
    const hasInfo = streamPath !== undefined || streamUptime !== undefined
        || publisherId !== undefined || publisherState !== undefined
        || broadcastId !== undefined || broadcastState !== undefined;

    const initFlv = useCallback(($video: HTMLVideoElement) => {
        let flvPlayer: FlvJs.Player | null = null;

        if ($video) {
            if (FlvJs.isSupported()) {
                flvPlayer = FlvJs.createPlayer({ ...playerProps }, playerProps.config);
                flvPlayer.attachMediaElement($video);
                flvPlayer.load();
                flvPlayer.play()?.catch(() => {
                    // Auto-play might be blocked, it's fine
                });
                setFlvPlayer(flvPlayer);
            }
        }

        return () => {
            if (flvPlayer) {
                flvPlayer.unload();
                flvPlayer.detachMediaElement();
                flvPlayer.destroy();
            }
        };
    }, [props]);

    const handleReload = () => {
        if (flvPlayer) {
            flvPlayer.unload();
            flvPlayer.load();
            flvPlayer.play();
        }
    };

    const takeScreenshot = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            const link = document.createElement('a');
            link.download = `snapshot-${new Date().getTime()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }
    };

    useEffect(() => {
        if (videoRef.current) {
            return initFlv(videoRef.current);
        }
    }, [initFlv]);

    return (
        <div className={className} style={style}>
        {hasInfo && (
            <div style={{ marginBottom: 8 }}>
                <Space wrap size={8} align="center">
                    {streamPath && (
                        <Typography.Text strong style={{ fontSize: 16 }}>{streamPath}</Typography.Text>
                    )}
                    {broadcastState !== undefined && (
                        <StateTag kind="broadcast" state={broadcastState} />
                    )}
                    {publisherState !== undefined && (
                        <StateTag kind="session" state={publisherState} />
                    )}
                </Space>
            </div>
        )}
        <div
            style={{ position: 'relative', width: '100%', backgroundColor: '#000' }}
        >
            <video
                controls
                autoPlay
                muted
                style={{
                    width: '100%',
                    display: 'block',
                }}
                ref={videoRef}
            />
            <div
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    zIndex: 10,
                }}
            >
                <Space>
                    <Tooltip title={t('reload')}>
                        <Button
                            size="small"
                            shape="circle"
                            icon={<ReloadOutlined />}
                            onClick={handleReload}
                            ghost
                        />
                    </Tooltip>
                    <Tooltip title={t('snapshot')}>
                        <Button
                            size="small"
                            shape="circle"
                            icon={<CameraOutlined />}
                            onClick={takeScreenshot}
                            ghost
                        />
                    </Tooltip>
                </Space>
            </div>
        </div>
        {hasInfo && (streamUptime || broadcastId || publisherId) && (
            <div style={{ marginTop: 8, fontSize: 12 }}>
                <Space split={<Divider type="vertical" style={{ margin: 0 }} />} wrap size={4}>
                    {streamUptime !== undefined && (
                        <Typography.Text type="secondary">
                            {t('uptime')}: {streamUptime}
                        </Typography.Text>
                    )}
                    {broadcastId !== undefined && (
                        <Typography.Text type="secondary">
                            {t('broadcast_id')}: <Typography.Text code copyable={{ text: broadcastId }}>{broadcastId}</Typography.Text>
                        </Typography.Text>
                    )}
                    {publisherId !== undefined && (
                        <Typography.Text type="secondary">
                            {t('publisher_id')}: <Typography.Text code copyable={{ text: publisherId }}>{publisherId}</Typography.Text>
                        </Typography.Text>
                    )}
                </Space>
            </div>
        )}
        {switchInfo && <SwitchControl switchInfo={switchInfo} onSwitched={onSwitched} />}
        </div>
    );
};

export default FlvPlayer;
