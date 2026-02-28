import { App, Button, Card, Empty, List, Space, Table, Tabs, Tag, Typography, Skeleton } from 'antd';
import { DeleteOutlined, SyncOutlined } from '@ant-design/icons';
import React, { useCallback, useMemo } from 'react';
import { api } from './api/service';
import { FissionStats, RelayInfo, RelayStats, TransStats } from './api/types';
import { useFetch } from './hooks/useFetch';
import secondsToDhms from './util/secondsToDhms';

const { Title, Text } = Typography;

type FissionTask = FissionStats[string][string]['fission'][number];
type TransTask = TransStats[string][string]['trans'][number];

const Tasks = () => {
    const { message } = App.useApp();

    const onError = useCallback(async (e: Error) => {
        await message.error(`Failed to fetch tasks: ${e.message}`);
    }, [message]);

    const { data: relayData, loading: relayLoading, refetch: refetchRelay } = useFetch(api.getRelayTasks, {
        immediate: true,
        refreshInterval: 5000,
        onError,
    });

    const { data: transData, loading: transLoading, refetch: refetchTrans } = useFetch(api.getTransTasks, {
        immediate: true,
        refreshInterval: 5000,
        onError,
    });

    const { data: fissionData, loading: fissionLoading, refetch: refetchFission } = useFetch(api.getFissionTasks, {
        immediate: true,
        refreshInterval: 5000,
        onError,
    });

    const flatRelays = useMemo(() => {
        if (!relayData) return [];
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
        if (!transData) return [];
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
        if (!fissionData) return [];
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
            message.success('Task deleted successfully');
        } catch (e: any) {
            message.error(`Failed to delete task: ${e.message}`);
        }
    }, [api, message, refetchRelay, refetchTrans, refetchFission]);

    const relayColumns = [
        { title: 'App', dataIndex: 'app', key: 'app' },
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'URL', dataIndex: 'url', key: 'url', ellipsis: true },
        { title: 'Mode', dataIndex: 'mode', key: 'mode', render: (m: string) => <Tag>{m}</Tag> },
        { title: 'Uptime', dataIndex: 'ts', key: 'ts', render: (ts: number) => secondsToDhms((Date.now() - ts) / 1000) },
        {
            title: 'Action', key: 'action', render: (_: any, record: any) => (
                <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete('relay', record.id)} size="small" />
            )
        },
    ];

    const transColumns = [
        { title: 'App', dataIndex: 'app', key: 'app' },
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Path', dataIndex: 'path', key: 'path', ellipsis: true },
        { title: 'Uptime', dataIndex: 'ts', key: 'ts', render: (ts: number) => secondsToDhms((Date.now() - ts) / 1000) },
        {
            title: 'Action', key: 'action', render: (_: any, record: any) => (
                <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete('trans', record.id)} size="small" />
            )
        },
    ];

    const items = [
        {
            key: 'relay',
            label: `Relay (${flatRelays.length})`,
            children: relayLoading && flatRelays.length === 0 ? <Skeleton active paragraph={{ rows: 5 }} /> : <Table dataSource={flatRelays} columns={relayColumns} rowKey="id" loading={relayLoading} pagination={false} scroll={{ x: 'max-content' }} />,
        },
        {
            key: 'trans',
            label: `Trans (${flatTrans.length})`,
            children: transLoading && flatTrans.length === 0 ? <Skeleton active paragraph={{ rows: 5 }} /> : <Table dataSource={flatTrans} columns={transColumns} rowKey="id" loading={transLoading} pagination={false} scroll={{ x: 'max-content' }} />,
        },
        {
            key: 'fission',
            label: `Fission (${flatFission.length})`,
            children: fissionLoading && flatFission.length === 0 ? <Skeleton active paragraph={{ rows: 5 }} /> : <Table dataSource={flatFission} columns={transColumns} rowKey="id" loading={fissionLoading} pagination={false} scroll={{ x: 'max-content' }} />,
        },
    ];

    return (
        <Card title={
            <Space>
                <Title level={4} style={{ margin: 0 }}>Background Tasks</Title>
                {(relayLoading || transLoading || fissionLoading) && <SyncOutlined spin />}
            </Space>
        }>
            <Tabs defaultActiveKey="relay" items={items} />
        </Card>
    );
};

export default Tasks;
