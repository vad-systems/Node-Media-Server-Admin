import FlvJs from 'flv.js';
import flvjs from 'flv.js';
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

const FlvPlayer = ({ className, style, ...props }: FlvPlayerProps) => {
    const [flvPlayer, setFlvPlayer] = useState<FlvJs.Player | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    const initFlv = useCallback(($video: HTMLVideoElement) => {
        let flvPlayer: FlvJs.Player | null = null;

        if ($video) {
            if (flvjs.isSupported()) {
                flvPlayer = flvjs.createPlayer({ ...props }, props.config);
                flvPlayer.attachMediaElement($video);
                flvPlayer.load();
                flvPlayer.play();
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

    useEffect(() => {
        if (videoRef.current) {
            initFlv(videoRef.current);
        }
    }, [videoRef.current]);

    return (
        <video
            className={className}
            style={Object.assign({
                width: '100%',
            }, style)}
            ref={videoRef}
        />
    );
};

export default FlvPlayer;
