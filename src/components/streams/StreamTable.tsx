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
            onCell: groupCellSpan,
            render: (name: string, record: StreamData) => {
                const appTagStyle = (isMultiple: boolean): React.CSSProperties => ({
                    display: 'inline-block',
                    padding: '0 6px',
                    marginRight: 6,
                    background: isMultiple ? 'rgba(250,140,22,0.15)' : 'rgba(24,144,255,0.12)',
                    color: isMultiple ? '#fa8c16' : '#1890ff',
                    borderRadius: 3,
                    fontWeight: 600,
                });
                if (record.isGroup) {
                    // Group label – keep the parenthesized count on the same line as the leading label,
                    // and keep the whole header (including the antd expand/collapse control area) from wrapping.
                    // For prefix grouping, visually highlight the app name as a prefix tag.
                    const countMatch = name.match(/^(.*?)\s*(\([^)]*\))\s*$/);
                    const baseLabel = countMatch ? countMatch[1].trim() : name;
                    const countLabel = countMatch ? countMatch[2] : '';
                    const isMultiple = record.app === 'Multiple';
                    const showAppPrefix = !!record.app && !baseLabel.startsWith(record.app);
                    return (
                        <span
                            style={{
                                position: 'sticky',
                                left: 16,
                                whiteSpace: 'nowrap',
                                display: 'inline-flex',
                                alignItems: 'center',
                            }}
                        >
                            {showAppPrefix && (
                                <span style={appTagStyle(isMultiple)}>{isMultiple ? t('multiple') : record.app}</span>
                            )}
                            <strong>{baseLabel}</strong>
                            {countLabel && <span style={{ marginLeft: 6, color: '#888' }}>{countLabel}</span>}
                        </span>
                    );
                }
                return (
                    <Space direction="vertical" size={0} style={{ maxWidth: '50vw' }}>
                        <span style={{ wordBreak: 'break-word' }}>
                            <span style={appTagStyle(false)}>{record.app}</span>
                            <a href="##" onClick={(e) => {
                                e.preventDefault();
                                openVideo(record);
                            }}>{name}</a>
                            {record.switchInfo && (
                                <Tooltip title={`${t('switchable')}: ${record.switchInfo.activeSource}`}>
                                    <SwapOutlined style={{ color: '#fa8c16', marginLeft: 6, fontSize: '16px' }} />
                                    {record.switchInfo.isSwitching && <SyncOutlined spin style={{ color: '#fa8c16', fontSize: '12px', marginLeft: 4 }} />}
                                </Tooltip>
                            )}
                        </span>
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
            align: 'center' as const,
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
            width: 180,
            onCell: hiddenCellSpan,
            render: (_: any, record: StreamData) => {
                if (record.isGroup) return null;
                if (!record.ac && !record.freq && !record.chan) return '-';
                const chanNum = record.chan ? parseInt(record.chan, 10) : NaN;
                let chanLabel: string | undefined;
                if (record.chan) {
                    if (chanNum === 1) chanLabel = t('audio_mono');
                    else if (chanNum === 2) chanLabel = t('audio_stereo');
                    else if (!isNaN(chanNum)) chanLabel = `${chanNum} ${t('audio_channels')}`;
                    else chanLabel = record.chan;
                }
                return (
                    <Space size={6} wrap>
                        {record.ac && (
                            <span style={{
                                display: 'inline-block',
                                padding: '0 6px',
                                background: 'rgba(82,196,26,0.15)',
                                color: '#52c41a',
                                borderRadius: 3,
                                fontWeight: 600,
                            }}>{record.ac}</span>
                        )}
                        {record.freq && <span>{record.freq}</span>}
                        {chanLabel && <span style={{ color: '#888' }}>{chanLabel}</span>}
                    </Space>
                );
            },
        },
        {
            title: t('video'),
            key: 'video',
            width: 220,
            onCell: hiddenCellSpan,
            render: (_: any, record: StreamData) => {
                if (record.isGroup) return null;
                if (!record.vc && !record.size && !record.fps) return '-';
                const sizeFps = joinNonEmpty([record.size, record.fps ? `${record.fps}fps` : undefined], '@');
                return (
                    <Space size={6} wrap>
                        {record.vc && (
                            <span style={{
                                display: 'inline-block',
                                padding: '0 6px',
                                background: 'rgba(114,46,209,0.15)',
                                color: '#722ed1',
                                borderRadius: 3,
                                fontWeight: 600,
                            }}>{record.vc}</span>
                        )}
                        {sizeFps && <span>{sizeFps}</span>}
                    </Space>
                );
            },
        },
        {
            title: t('time'),
            dataIndex: 'time',
            key: 'time',
            width: 120,
            align: 'right' as const,
            onCell: hiddenCellSpan,
            render: (time: string, record: any) => record.isGroup ? null : time,
        },
        {
            title: t('clients'),
            dataIndex: 'clients',
            key: 'clients',
            width: 90,
            align: 'center' as const,
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
            align: 'center' as const,
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
            size="small"
            pagination={false}
            scroll={{ x: 'max-content' }}
            indentSize={0}
            className="streams-compact-table"
        />
    );
};

export default StreamTable;
