import { DeleteOutlined, PlayCircleOutlined, StopOutlined, SyncOutlined, SwapOutlined } from '@ant-design/icons';
import { App, Button, Card, Col, Flex, Row, Skeleton, Space, Table, Tabs, Tag, Typography, Select } from 'antd';
import React, { useCallback, useMemo } from 'react';
import { api } from './api/service';
import { FissionStats, RelayInfo, ServerStatus, TransStats, SwitchTaskStatus } from './api/types';
import { useFetch } from './hooks/useFetch';
import { useTranslation } from './context/LanguageContext';
import secondsToDhms from './util/secondsToDhms';

const { Title } = Typography;

type FissionTask = FissionStats[string][string]['fission'][number];
type TransTask = TransStats[string][string]['trans'][number];

const Tasks = () => {
    const { message } = App.useApp();
    const { t } = useTranslation();

    const onError = useCallback(async (e: Error) => {
        await message.error(`${t('failed_fetch_tasks')}: ${e.message}`);
    }, [message, t]);

    const { data: serverStatus, loading: statusLoading, refetch: refetchStatus } = useFetch(api.getServerStatus, {
        immediate: true,
        refreshInterval: 5000,
        onError,
    });

    const { data: relayData, loading: relayLoading, refetch: refetchRelay } = useFetch(api.getRelayTasks, {
        immediate: true,
        refreshInterval: 5000,
        onError,
        enabled: !!serverStatus?.relay?.running,
    });

    const { data: transData, loading: transLoading, refetch: refetchTrans } = useFetch(api.getTransTasks, {
        immediate: true,
        refreshInterval: 5000,
        onError,
        enabled: !!serverStatus?.trans?.running,
    });

    const { data: fissionData, loading: fissionLoading, refetch: refetchFission } = useFetch(api.getFissionTasks, {
        immediate: true,
        refreshInterval: 5000,
        onError,
        enabled: !!serverStatus?.fission?.running,
    });
    
    const { data: switchData, loading: switchLoading, refetch: refetchSwitch } = useFetch(api.getSwitchTasks, {
        immediate: true,
        refreshInterval: 5000,
        onError,
        enabled: !!serverStatus?.switch?.running,
    });

    const { data: streamsData } = useFetch(api.getStreams, {
        immediate: true,
        refreshInterval: 5000,
    });

    const allStreamPaths = useMemo(() => {
        if (!streamsData) return [];
        const paths: string[] = [];
        Object.entries(streamsData).forEach(([app, streams]) => {
            Object.keys(streams).forEach(name => {
                paths.push(`${app}/${name}`);
            });
        });
        return Array.from(new Set(paths));
    }, [streamsData]);

    const handleAction = useCallback(async (
        server: 'rtmp' | 'av' | 'trans' | 'relay' | 'fission' | 'switch',
        action: 'start' | 'stop',
    ) => {
        try {
            if (action === 'start') {
                await api.startServer(server);
                message.success(`${t(`component_${server}`).toUpperCase()} ${t('started')}`);
            } else {
                await api.stopServer(server);
                message.success(`${t(`component_${server}`).toUpperCase()} ${t('stopped_action')}`);
            }
            refetchStatus();
        } catch (e: any) {
            message.error(`${t('action_failed')}: ${e.message}`);
        }
    }, [message, refetchStatus, t]);

    const handleTriggerSwitch = useCallback(async (path: string, source: string) => {
        try {
            await api.triggerSwitch({ path, source });
            message.success(t('switch_accepted').replace('{path}', path).replace('{source}', source));
            refetchSwitch();
        } catch (e: any) {
            message.error(`${t('switch_failed')}: ${e.message}`);
        }
    }, [api, message, refetchSwitch, t]);

    const handleRestart = useCallback(async (type: 'relay' | 'trans' | 'fission', id: string) => {
        try {
            if (type === 'relay') {
                await api.restartRelayTask(id);
                refetchRelay();
            } else if (type === 'trans') {
                await api.restartTransTask(id);
                refetchTrans();
            } else if (type === 'fission') {
                await api.restartFissionTask(id);
                refetchFission();
            }
            message.success(t('task_restarted'));
        } catch (e: any) {
            message.error(`${t('task_restart_failed')}: ${e.message}`);
        }
    }, [api, message, refetchRelay, refetchTrans, refetchFission, t]);

    const renderServiceControl = (key: keyof ServerStatus) => {
        const isRunning = serverStatus?.[key]?.running;
        const loading = statusLoading && !serverStatus;

        return (
            <Col xs={24} sm={12} md={8} lg={4} key={key}>
                <Card size="small" title={t(`component_${key}`)} style={{ marginBottom: 16 }}>
                    {loading ? (
                        <Skeleton active paragraph={{ rows: 1 }} />
                    ) : (
                        <Flex justify="space-between" align="center" wrap>
                            <Tag color={isRunning ? 'success' : 'error'}>
                                {isRunning ? t('running') : t('stopped')}
                            </Tag>
                            <Space style={{ gap: 8 }}>
                                <Button
                                    type="primary"
                                    icon={<PlayCircleOutlined />}
                                    disabled={isRunning || statusLoading}
                                    onClick={() => handleAction(key as any, 'start')}
                                    size="small"
                                />
                                <Button
                                    danger
                                    icon={<StopOutlined />}
                                    disabled={!isRunning || statusLoading}
                                    onClick={() => handleAction(key as any, 'stop')}
                                    size="small"
                                />
                            </Space>
                        </Flex>
                    )}
                </Card>
            </Col>
        );
    };

    const flatRelays = useMemo(() => {
        if (!relayData) {
            return [];
        }
        const list: RelayInfo[] = [];
        Object.values(relayData).forEach(apps => {
            Object.values(apps).forEach(streams => {
                streams.relays.forEach(relay => {
                    list.push(relay);
                });
            });
        });
        return list;
    }, [relayData]);

    const flatTrans = useMemo(() => {
        if (!transData) {
            return [];
        }
        const list: TransTask[] = [];
        Object.values(transData).forEach(apps => {
            Object.values(apps).forEach(streams => {
                streams.trans.forEach(trans => {
                    list.push(trans);
                });
            });
        });
        return list;
    }, [transData]);

    const flatFission = useMemo(() => {
        if (!fissionData) {
            return [];
        }
        const list: FissionTask[] = [];
        Object.values(fissionData).forEach(apps => {
            Object.values(apps).forEach(streams => {
                streams.fission.forEach(fission => {
                    list.push(fission);
                });
            });
        });
        return list;
    }, [fissionData]);

    const handleDelete = useCallback(async (type: 'relay' | 'trans' | 'fission', id: string) => {
        try {
            if (type === 'relay') {
                await api.deleteRelayTask(id);
                refetchRelay();
            } else if (type === 'trans') {
                await api.deleteTransTask(id);
                refetchTrans();
            } else if (type === 'fission') {
                await api.deleteFissionTask(id);
                refetchFission();
            }
            message.success(t('task_deleted'));
        } catch (e: any) {
            message.error(`${t('task_delete_failed')}: ${e.message}`);
        }
    }, [api, message, refetchRelay, refetchTrans, refetchFission, t]);

    const relayColumns = [
        { title: t('app'), dataIndex: 'app', key: 'app' },
        { title: t('stream_name'), dataIndex: 'name', key: 'name' },
        { title: t('url'), dataIndex: 'url', key: 'url', ellipsis: true },
        { title: t('mode'), dataIndex: 'mode', key: 'mode', render: (m: string) => <Tag>{m}</Tag> },
        {
            title: t('uptime'),
            dataIndex: 'ts',
            key: 'ts',
            render: (ts: number) => secondsToDhms((
                Date.now() - ts
            ) / 1000),
        },
        {
            title: t('actions'), key: 'action', render: (_: any, record: any) => (
                <Space>
                    <Button
                        icon={<SyncOutlined />}
                        onClick={() => handleRestart('relay', record.id)}
                        size="small"
                        title={t('restart')}
                    />
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete('relay', record.id)}
                        size="small"
                    />
                </Space>
            ),
        },
    ];

    const transColumns = [
        { title: t('app'), dataIndex: 'app', key: 'app' },
        { title: t('stream_name'), dataIndex: 'name', key: 'name' },
        { title: t('path'), dataIndex: 'path', key: 'path', ellipsis: true },
        {
            title: t('uptime'),
            dataIndex: 'ts',
            key: 'ts',
            render: (ts: number) => secondsToDhms((
                Date.now() - ts
            ) / 1000),
        },
        {
            title: t('actions'), key: 'action', render: (_: any, record: any) => (
                <Space>
                    <Button
                        icon={<SyncOutlined />}
                        onClick={() => handleRestart('trans', record.id)}
                        size="small"
                        title={t('restart')}
                    />
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete('trans', record.id)}
                        size="small"
                    />
                </Space>
            ),
        },
    ];

    const fissionColumns = [
        { title: t('app'), dataIndex: 'app', key: 'app' },
        { title: t('stream_name'), dataIndex: 'name', key: 'name' },
        { title: t('path'), dataIndex: 'path', key: 'path', ellipsis: true },
        {
            title: t('uptime'),
            dataIndex: 'ts',
            key: 'ts',
            render: (ts: number) => secondsToDhms((
                Date.now() - ts
            ) / 1000),
        },
        {
            title: t('actions'), key: 'action', render: (_: any, record: any) => (
                <Space>
                    <Button
                        icon={<SyncOutlined />}
                        onClick={() => handleRestart('fission', record.id)}
                        size="small"
                        title={t('restart')}
                    />
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete('fission', record.id)}
                        size="small"
                    />
                </Space>
            ),
        },
    ];

    const switchColumns = [
        { title: t('app'), dataIndex: 'app', key: 'app' },
        { title: t('stream_name'), dataIndex: 'name', key: 'name' },
        { title: t('output_path'), dataIndex: 'outputPath', key: 'outputPath', ellipsis: true },
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
            key: 'action',
            render: (_: any, record: SwitchTaskStatus) => {
                const options = Array.from(new Set([...record.sources, ...allStreamPaths]));
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
                            {record.sources.map(src => (
                                <Select.Option key={src} value={src}>{src}</Select.Option>
                            ))}
                        </Select.OptGroup>
                        <Select.OptGroup label={t('active_streams_select')}>
                            {allStreamPaths.filter(p => !record.sources.includes(p)).map(src => (
                                <Select.Option key={src} value={src}>{src}</Select.Option>
                            ))}
                        </Select.OptGroup>
                    </Select>
                );
            },
        },
    ];

    const items = [
        {
            key: 'relay',
            label: `${t('component_relay')} (${flatRelays.length})`,
            children: relayLoading && flatRelays.length === 0 ? <Skeleton active paragraph={{ rows: 5 }} /> : <Table
                dataSource={flatRelays}
                columns={relayColumns}
                rowKey="id"
                loading={relayLoading}
                pagination={false}
                scroll={{ x: 'max-content' }}
            />,
        },
        {
            key: 'trans',
            label: `${t('component_trans')} (${flatTrans.length})`,
            children: transLoading && flatTrans.length === 0 ? <Skeleton active paragraph={{ rows: 5 }} /> : <Table
                dataSource={flatTrans}
                columns={transColumns}
                rowKey="id"
                loading={transLoading}
                pagination={false}
                scroll={{ x: 'max-content' }}
            />,
        },
        {
            key: 'fission',
            label: `${t('component_fission')} (${flatFission.length})`,
            children: fissionLoading && flatFission.length === 0 ? <Skeleton active paragraph={{ rows: 5 }} /> : <Table
                dataSource={flatFission}
                columns={fissionColumns}
                rowKey="id"
                loading={fissionLoading}
                pagination={false}
                scroll={{ x: 'max-content' }}
            />,
        },
        {
            key: 'switch',
            label: `${t('component_switch')} (${switchData?.length || 0})`,
            children: switchLoading && !switchData ? <Skeleton active paragraph={{ rows: 5 }} /> : <Table
                dataSource={switchData || []}
                columns={switchColumns}
                rowKey="outputPath"
                loading={switchLoading}
                pagination={false}
                scroll={{ x: 'max-content' }}
            />,
        },
    ];

    return (
        <div style={{ padding: '0 4px' }}>
            <Title level={4} style={{ marginBottom: 16 }}>
                {t('service_controls')}
            </Title>
            <Row gutter={16}>
                {renderServiceControl('rtmp')}
                {renderServiceControl('av')}
                {renderServiceControl('trans')}
                {renderServiceControl('relay')}
                {renderServiceControl('fission')}
                {renderServiceControl('switch')}
            </Row>

            <Card
                style={{ marginTop: 8 }}
                title={
                    <Space>
                        <Title level={4} style={{ margin: 0 }}>{t('background_tasks')}</Title>
                        {(
                            relayLoading || transLoading || fissionLoading || switchLoading || statusLoading
                        ) && <SyncOutlined spin />}
                    </Space>
                }
            >
                <Tabs defaultActiveKey="relay" items={items} />
            </Card>
        </div>
    );
};

export default Tasks;
