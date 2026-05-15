import { Descriptions, Spin } from 'antd';
import React, { useCallback } from 'react';
import { api } from '../../api/service';
import { useFetch } from '../../hooks/useFetch';
import secondsToDhms from '../../util/secondsToDhms';
import bitrateToSize from '../../util/bitrateToSize';
import { useTranslation } from '../../context/LanguageContext';
import StateTag from '../StateTag';

interface StreamDetailsProps {
    app: string;
    stream: string;
    ip?: string;
}

const StreamDetails = ({ app, stream, ip }: StreamDetailsProps) => {
    const { t } = useTranslation();
    const getStream = useCallback(() => api.getStream(app, stream), [app, stream]);
    const { data, loading } = useFetch(getStream, {
        immediate: true,
        refreshInterval: 5000,
    });

    if (loading && !data) {
        return <Spin size="small" style={{ margin: '20px auto', display: 'block' }} />;
    }

    if (!data) return <div>{t('no_data')}</div>;

    return (
        <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="IP">{ip || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label={t('state')}>
                <StateTag kind="broadcast" state={data.state} />
                <StateTag kind="session" state={data.publisherState} />
            </Descriptions.Item>
            <Descriptions.Item label={t('viewers')}>{data.viewers}</Descriptions.Item>
            <Descriptions.Item label={t('duration')}>{secondsToDhms(data.duration)}</Descriptions.Item>
            <Descriptions.Item label={t('bitrate')}>{bitrateToSize(data.bitrate)}</Descriptions.Item>
            <Descriptions.Item label={t('start_time')}>{data.startTime ? new Date(data.startTime).toLocaleString() : 'N/A'}</Descriptions.Item>
            <Descriptions.Item label={t('arguments')}>
                <pre style={{ fontSize: '10px', margin: 0 }}>{JSON.stringify(data.arguments, null, 2)}</pre>
            </Descriptions.Item>
        </Descriptions>
    );
};

export default StreamDetails;
