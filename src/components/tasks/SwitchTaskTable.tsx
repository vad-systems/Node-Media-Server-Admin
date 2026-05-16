import { StopOutlined, SyncOutlined } from '@ant-design/icons';
import { App, Button, Select, Skeleton, Space, Table, Tag } from 'antd';
import React, { useCallback, useMemo } from 'react';
import { api } from '../../api/service';
import { SwitchTaskStatus } from '../../api/types';
import { useTranslation } from '../../context/LanguageContext';
import StateTag from '../StateTag';

interface SwitchTaskTableProps {
    data: SwitchTaskStatus[] | null | undefined;
    loading: boolean;
    allStreamPaths: string[];
    refetch: () => void;
}

const SwitchTaskTable: React.FC<SwitchTaskTableProps> = ({ data, loading, allStreamPaths, refetch }) => {
    const { t } = useTranslation();
    const { message } = App.useApp();

    const handleTriggerSwitch = useCallback(async (path: string, source: string) => {
        try {
            await api.triggerSwitch({ path, source });
            message.success(t('switch_accepted').replace('{path}', path).replace('{source}', source));
            refetch();
        } catch (e: any) {
            message.error(`${t('switch_failed')}: ${e.message}`);
        }
    }, [message, refetch, t]);

    const handleStopSwitch = useCallback(async (path: string) => {
        try {
            await api.stopSwitchTask(path);
            message.success(t('switch_stopped').replace('{path}', path));
            refetch();
        } catch (e: any) {
            message.error(`${t('switch_stop_failed')}: ${e.message}`);
        }
    }, [message, refetch, t]);

    const columns = useMemo(() => [
        { title: t('app'), dataIndex: 'app', key: 'app' },
        { title: t('stream_name'), dataIndex: 'name', key: 'name' },
        { title: t('output_path'), dataIndex: 'outputPath', key: 'outputPath', ellipsis: true },
        {
            title: t('state'),
            key: 'state',
            render: (_: any, record: SwitchTaskStatus) => <StateTag kind="broadcast" state={record.state} />,
        },
        {
            title: t('status'),
            key: 'status',
            render: (_: any, record: SwitchTaskStatus) => (
                <Space>
                    <Tag color="blue">{record.activeSource || t('no_data')}</Tag>
                    {record.isSwitching && <SyncOutlined spin />}
                    {record.pendingSource && <Tag color="orange">{t('pending')}: {record.pendingSource}</Tag>}
                </Space>
            ),
        },
        {
            title: t('switch_to'),
            key: 'switch_to',
            render: (_: any, record: SwitchTaskStatus) => {
                const isExcluded = (p: string) => p === record.outputPath || p.startsWith(`${record.outputPath}/`);
                const filteredSources = record.sources.filter(p => !isExcluded(p));
                const filteredActive = allStreamPaths.filter(p => !record.sources.includes(p) && !isExcluded(p));
                return (
                    <Select
                        size="small"
                        placeholder={t('switch_to')}
                        style={{ width: 200 }}
                        showSearch
                        onChange={(value) => handleTriggerSwitch(record.outputPath, value)}
                        value={record.activeSource}
                        disabled={record.isSwitching}
                    >
                        <Select.OptGroup label={t('configured_sources')}>
                            {filteredSources.map(src => (
                                <Select.Option key={src} value={src}>{src}</Select.Option>
                            ))}
                        </Select.OptGroup>
                        <Select.OptGroup label={t('active_streams_select')}>
                            {filteredActive.map(src => (
                                <Select.Option key={src} value={src}>{src}</Select.Option>
                            ))}
                        </Select.OptGroup>
                    </Select>
                );
            },
        },
        {
            title: t('actions'),
            key: 'action',
            render: (_: any, record: SwitchTaskStatus) => (
                <Space>
                    <Button
                        danger
                        icon={<StopOutlined />}
                        onClick={() => handleStopSwitch(record.outputPath)}
                        size="small"
                        title={t('stop')}
                    />
                </Space>
            ),
        },
    ], [t, allStreamPaths, handleTriggerSwitch, handleStopSwitch]);

    if (loading && !data) {
        return <Skeleton active paragraph={{ rows: 5 }} />;
    }

    return (
        <Table
            dataSource={data || []}
            columns={columns}
            rowKey="outputPath"
            loading={loading}
            pagination={false}
            scroll={{ x: 'max-content' }}
        />
    );
};

export default SwitchTaskTable;
