import { CameraOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Space, Tooltip } from 'antd';
import FlvJs from 'flv.js';
import React, { CSSProperties, useCallback, useEffect, useRef, useState } from 'react';
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
};

const FlvPlayer = (props: FlvPlayerProps) => {
    const [flvPlayer, setFlvPlayer] = useState<FlvJs.Player | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const { className, style, ...playerProps } = props;

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
        <div
            className={className}
            style={Object.assign({ position: 'relative', width: '100%', backgroundColor: '#000' }, style)}
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
                    <Tooltip title="Reload Player">
                        <Button
                            size="small"
                            shape="circle"
                            icon={<ReloadOutlined />}
                            onClick={handleReload}
                            ghost
                        />
                    </Tooltip>
                    <Tooltip title="Take Snapshot">
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
    );
};

export default FlvPlayer;
