import { DeleteOutlined, InfoCircleOutlined, SyncOutlined, SwapOutlined } from '@ant-design/icons';
import { Table, Space, Tag, Tooltip } from 'antd';
import React, { Fragment, useMemo } from 'react';
import { useTranslation } from '../../context/LanguageContext';
import { StreamData } from './types';

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
            title: t('app'),
            dataIndex: 'app',
            key: 'app',
        },
        {
            title: t('stream_name'),
            dataIndex: 'name',
            key: 'name',
            render: (name: string, record: StreamData) => {
                if (record.isGroup) return <strong>{name}</strong>;
                return (
                    <Space>
                        <a href="##" onClick={(e) => {
                            e.preventDefault();
                            openVideo(record);
                        }}>{name}</a>
                        {record.switchInfo && (
                            <Tooltip title={`${t('switchable')}: ${record.switchInfo.activeSource}`}>
                                <SwapOutlined style={{ color: '#1890ff' }} />
                                {record.switchInfo.isSwitching && <SyncOutlined spin style={{ fontSize: '12px' }} />}
                            </Tooltip>
                        )}
                    </Space>
                );
            },
        },
        {
            title: t('stream_id'),
            dataIndex: 'id',
            key: 'id',
            render: (id: string, record: any) => record.isGroup ? null : id,
        },
        {
            title: t('audio'),
            children: [
                {
                    title: t('codec'),
                    dataIndex: 'ac',
                    key: 'ac',
                }, {
                    title: t('freq'),
                    dataIndex: 'freq',
                    key: 'freq',
                }, {
                    title: t('chan'),
                    dataIndex: 'chan',
                    key: 'chan',
                },
            ],
        },
        {
            title: t('video'),
            children: [
                {
                    title: t('codec'),
                    dataIndex: 'vc',
                    key: 'vc',
                }, {
                    title: t('size'),
                    dataIndex: 'size',
                    key: 'size',
                }, {
                    title: t('fps'),
                    dataIndex: 'fps',
                    key: 'fps',
                },
            ],
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
            dataIndex: 'actions',
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
            scroll={{ x: 'max-content' }}
            pagination={false}
        />
    );
};

export default StreamTable;
