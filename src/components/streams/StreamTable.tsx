import { DeleteOutlined, InfoCircleOutlined, SyncOutlined, SwapOutlined } from '@ant-design/icons';
import { Table, Space, Tooltip } from 'antd';
import React, { useMemo } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import StateTag from '../StateTag';
import { StreamData } from './types';

const joinNonEmpty = (parts: Array<string | undefined>, sep: string) =>
    parts.filter(p => p && p !== '').join(sep);

type StreamTableProps = {
    dataSource: StreamData[];
    loading: boolean;
    openVideo: (record: StreamData) => void;
    showClients: (record: StreamData) => void;
    showDetails: (record: StreamData) => void;
    deleteStream: (record: StreamData) => void;
};

const StreamTable = ({ dataSource, loading, openVideo, showClients, showDetails, deleteStream }: StreamTableProps) => {
    const { t } = useTranslation();
    const columns = useMemo(() => [
        {
            title: t('stream'),
            dataIndex: 'name',
            key: 'stream',
            render: (name: string, record: StreamData) => {
                if (record.isGroup) {
                    const label = record.app && !name.startsWith(record.app) ? `${record.app} ${name}` : name;
                    return <strong>{label}</strong>;
                }
                const path = `${record.app}/${name}`;
                return (
                    <Space direction="vertical" size={0}>
                        <Space size={4}>
                            <a href="##" onClick={(e) => {
                                e.preventDefault();
                                openVideo(record);
                            }}>{path}</a>
                            {record.switchInfo && (
                                <Tooltip title={`${t('switchable')}: ${record.switchInfo.activeSource}`}>
                                    <SwapOutlined style={{ color: '#1890ff' }} />
                                    {record.switchInfo.isSwitching && <SyncOutlined spin style={{ fontSize: '12px' }} />}
                                </Tooltip>
                            )}
                        </Space>
                        {record.id && (
                            <Tooltip title={t('stream_id')}>
                                <small style={{ color: '#888' }}>{record.id}</small>
                            </Tooltip>
                        )}
                    </Space>
                );
            },
        },
        {
            title: t('state'),
            key: 'state',
            render: (_: any, record: StreamData) => {
                if (record.isGroup) return null;
                return (
                    <Space size={4} wrap>
                        <StateTag kind="broadcast" state={record.state} />
                        <StateTag kind="session" state={record.publisherState} />
                    </Space>
                );
            },
        },
        {
            title: t('audio'),
            key: 'audio',
            render: (_: any, record: StreamData) => {
                if (record.isGroup) return null;
                const rate = joinNonEmpty([record.freq, record.chan], '/');
                return joinNonEmpty([record.ac, rate], ' ') || '-';
            },
        },
        {
            title: t('video'),
            key: 'video',
            render: (_: any, record: StreamData) => {
                if (record.isGroup) return null;
                const sizeFps = joinNonEmpty([record.size, record.fps ? `${record.fps}fps` : undefined], '@');
                return joinNonEmpty([record.vc, sizeFps], ' ') || '-';
            },
        },
        {
            title: t('time'),
            dataIndex: 'time',
            key: 'time',
            render: (time: string, record: any) => record.isGroup ? null : time,
        },
        {
            title: t('clients'),
            dataIndex: 'clients',
            key: 'clients',
            render: (_: any, record: any) => {
                if (record.isGroup) return null;
                return (
                    <a href="##" onClick={(e) => {
                        e.preventDefault();
                        showClients(record);
                    }}>{record.clientCount}</a>
                );
            },
        },
        {
            title: t('actions'),
            key: 'actions',
            render: (_: any, record: any) => {
                if (record.isGroup) return null;
                return (
                    <Space size="middle">
                        <a href="##" onClick={(e) => {
                            e.preventDefault();
                            showDetails(record);
                        }} title={t('details')}>
                            <InfoCircleOutlined />
                        </a>
                        <a href="##" onClick={(e) => {
                            e.preventDefault();
                            deleteStream(record);
                        }} style={{ color: 'red' }} title={t('delete')}>
                            <DeleteOutlined />
                        </a>
                    </Space>
                );
            },
        },
    ], [openVideo, showClients, showDetails, deleteStream, t]);

    return (
        <Table
            dataSource={dataSource}
            columns={columns}
            loading={loading}
            bordered
            pagination={false}
        />
    );
};

export default StreamTable;
