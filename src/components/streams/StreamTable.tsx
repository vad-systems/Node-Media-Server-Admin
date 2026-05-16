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

const TOTAL_COLUMNS = 7;

const groupCellSpan = (record: StreamData) =>
    record.isGroup ? { colSpan: TOTAL_COLUMNS } : {};
const hiddenCellSpan = (record: StreamData) =>
    record.isGroup ? { colSpan: 0 } : {};

const StreamTable = ({ dataSource, loading, openVideo, showClients, showDetails, deleteStream }: StreamTableProps) => {
    const { t } = useTranslation();
    const columns = useMemo(() => [
        {
            title: t('stream'),
            dataIndex: 'name',
            key: 'stream',
            fixed: 'left' as const,
            width: 260,
            onCell: groupCellSpan,
            render: (name: string, record: StreamData) => {
                if (record.isGroup) {
                    // Group label – keep the parenthesized count on the same line as the leading label,
                    // and keep the whole header (including the antd expand/collapse control area) from wrapping.
                    // For prefix grouping, visually highlight the app name as a prefix tag.
                    const countMatch = name.match(/^(.*?)\s*(\([^)]*\))\s*$/);
                    const baseLabel = countMatch ? countMatch[1].trim() : name;
                    const countLabel = countMatch ? countMatch[2] : '';
                    const isMultiple = record.app === 'Multiple';
                    const showAppPrefix = !!record.app && !baseLabel.startsWith(record.app);
                    const prefixStyle: React.CSSProperties = isMultiple
                        ? {
                            display: 'inline-block',
                            padding: '0 6px',
                            marginRight: 6,
                            background: 'rgba(250,140,22,0.15)',
                            color: '#fa8c16',
                            borderRadius: 3,
                            fontWeight: 600,
                        }
                        : {
                            display: 'inline-block',
                            padding: '0 6px',
                            marginRight: 6,
                            background: 'rgba(24,144,255,0.12)',
                            color: '#1890ff',
                            borderRadius: 3,
                            fontWeight: 600,
                        };
                    return (
                        <span style={{ whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center' }}>
                            {showAppPrefix && (
                                <span style={prefixStyle}>{isMultiple ? t('multiple') : record.app}</span>
                            )}
                            <strong>{baseLabel}</strong>
                            {countLabel && <span style={{ marginLeft: 6, color: '#888' }}>{countLabel}</span>}
                        </span>
                    );
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
            width: 160,
            onCell: hiddenCellSpan,
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
            width: 160,
            onCell: hiddenCellSpan,
            render: (_: any, record: StreamData) => {
                if (record.isGroup) return null;
                const rate = joinNonEmpty([record.freq, record.chan], '/');
                return joinNonEmpty([record.ac, rate], ' ') || '-';
            },
        },
        {
            title: t('video'),
            key: 'video',
            width: 200,
            onCell: hiddenCellSpan,
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
            width: 120,
            onCell: hiddenCellSpan,
            render: (time: string, record: any) => record.isGroup ? null : time,
        },
        {
            title: t('clients'),
            dataIndex: 'clients',
            key: 'clients',
            width: 90,
            onCell: hiddenCellSpan,
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
            width: 100,
            onCell: hiddenCellSpan,
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
            scroll={{ x: 'max-content' }}
        />
    );
};

export default StreamTable;
