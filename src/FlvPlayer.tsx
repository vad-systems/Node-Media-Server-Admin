import { CameraOutlined } from '@ant-design/icons';
import { Button, Space, Tooltip, Typography } from 'antd';
import FlvJs from 'flv.js';
import React, { CSSProperties, useCallback, useEffect, useMemo, useRef } from 'react';
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
    const streamUptime = live?.uptime ?? initialUptime;
    const publisherId = live?.publisherId ?? initialPublisherId;

    // Suppress unused warnings; states are surfaced via the dialog title in the parent.
    void (live?.broadcastState ?? initialBroadcastState);
    void (live?.publisherState ?? initialPublisherState);

    const hasInfo = streamUptime !== undefined
        || publisherId !== undefined
        || broadcastId !== undefined;

    const {
        url, type, isLive, cors, withCredentials, hasAudio, hasVideo,
        duration, filesize, segments, config: flvConfig,
    } = playerProps;

    // Only the inputs that actually affect the flv.js player instance.
    // Polling-induced parent re-renders must NOT recreate the player, otherwise
    // the video keeps restarting every few seconds.
    const playerKey = useMemo(
        () => JSON.stringify({
            url, type, isLive, cors, withCredentials, hasAudio, hasVideo,
            duration, filesize, segments, flvConfig,
        }),
        [url, type, isLive, cors, withCredentials, hasAudio, hasVideo,
            duration, filesize, segments, flvConfig],
    );

    const initFlv = useCallback(($video: HTMLVideoElement) => {
        let flvPlayer: FlvJs.Player | null = null;

        if ($video) {
            if (FlvJs.isSupported()) {
                // Treat these streams as live so flv.js skips the seek bar / chasing buffer accordingly.
                flvPlayer = FlvJs.createPlayer(
                    {
                        isLive: true,
                        url, type: type as MediaType, cors, withCredentials,
                        hasAudio, hasVideo, duration, filesize, segments,
                    },
                    { enableStashBuffer: false, ...flvConfig },
                );
                flvPlayer.attachMediaElement($video);
                flvPlayer.load();
                flvPlayer.play()?.catch(() => {
                    // Auto-play might be blocked, it's fine
                });
            }
        }

        return () => {
            if (flvPlayer) {
                flvPlayer.unload();
                flvPlayer.detachMediaElement();
                flvPlayer.destroy();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playerKey]);

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
        <div
            style={{ position: 'relative', width: '100%', backgroundColor: '#000' }}
        >
            <video
                controls
                controlsList="nodownload noplaybackrate"
                disablePictureInPicture={false}
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
            <div
                style={{
                    marginTop: 8,
                    fontSize: 12,
                    display: 'grid',
                    gridTemplateColumns: '1fr 2fr 2fr',
                    columnGap: 12,
                    alignItems: 'baseline',
                }}
            >
                <div style={{ minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <Typography.Text type="secondary">
                        {t('uptime')}: {streamUptime ?? '-'}
                    </Typography.Text>
                </div>
                <div style={{ minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <Typography.Text type="secondary">{t('broadcast_id')}: </Typography.Text>
                    {broadcastId
                        ? <Typography.Text code copyable={{ text: broadcastId }}>{broadcastId}</Typography.Text>
                        : <Typography.Text type="secondary">-</Typography.Text>}
                </div>
                <div style={{ minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <Typography.Text type="secondary">{t('publisher_id')}: </Typography.Text>
                    {publisherId
                        ? <Typography.Text code copyable={{ text: publisherId }}>{publisherId}</Typography.Text>
                        : <Typography.Text type="secondary">-</Typography.Text>}
                </div>
            </div>
        )}
        {switchInfo && <SwitchControl switchInfo={switchInfo} onSwitched={onSwitched} />}
        </div>
    );
};

export default FlvPlayer;
