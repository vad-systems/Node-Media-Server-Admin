import { Descriptions, Spin, Tag } from 'antd';
import React, { useCallback } from 'react';
import { api } from '../../api/service';
import { useFetch } from '../../hooks/useFetch';
import secondsToDhms from '../../util/secondsToDhms';

interface StreamDetailsProps {
    app: string;
    stream: string;
    ip?: string;
}

const StreamDetails = ({ app, stream, ip }: StreamDetailsProps) => {
    const getStream = useCallback(() => api.getStream(app, stream), [app, stream]);
    const { data, loading } = useFetch(getStream, {
        immediate: true,
        refreshInterval: 5000,
    });

    if (loading && !data) {
        return <Spin size="small" style={{ margin: '20px auto', display: 'block' }} />;
    }

    if (!data) return <div>No data found for this stream.</div>;

    return (
        <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="IP">{ip || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Live">{data.isLive ? <Tag color="success">YES</Tag> : <Tag color="error">NO</Tag>}</Descriptions.Item>
            <Descriptions.Item label="Viewers">{data.viewers}</Descriptions.Item>
            <Descriptions.Item label="Duration">{secondsToDhms(data.duration)}</Descriptions.Item>
            <Descriptions.Item label="Bitrate">{data.bitrate} kbps</Descriptions.Item>
            <Descriptions.Item label="Start Time">{data.startTime ? new Date(data.startTime).toLocaleString() : 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Arguments">
                <pre style={{ fontSize: '10px', margin: 0 }}>{JSON.stringify(data.arguments, null, 2)}</pre>
            </Descriptions.Item>
        </Descriptions>
    );
};

export default StreamDetails;
