import { SyncOutlined } from '@ant-design/icons';
import { App, Card, Row, Space, Tabs, Typography } from 'antd';
import React, { useCallback, useMemo } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import { api } from './api/service';
import { FissionStats, RelayInfo, TransStats } from './api/types';
import ServiceControl, { ServerComponentKey } from './components/tasks/ServiceControl';
import BasicTaskTable from './components/tasks/BasicTaskTable';
import SwitchTaskTable from './components/tasks/SwitchTaskTable';
import StaticTaskTable from './components/tasks/StaticTaskTable';
import { useTaskActions } from './components/tasks/useTaskActions';
import { useTranslation } from './context/LanguageContext';
import { useFetch } from './hooks/useFetch';

const { Title } = Typography;

type FissionTask = FissionStats[string][string]['fission'][number];
type TransTask = TransStats[string][string]['trans'][number];

const Tasks = () => {
    const { message } = App.useApp();
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useLocalStorage<string>('nms.admin.tasks.activeTab', 'relay');

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

    const { data: staticData, loading: staticLoading } = useFetch(api.getStaticTasks, {
        immediate: true,
        refreshInterval: 5000,
        onError,
        enabled: !!serverStatus?.static?.running,
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
                paths.push(`/${app}/${name}`);
            });
        });
        return Array.from(new Set(paths));
    }, [streamsData]);

    const handleAction = useCallback(async (server: ServerComponentKey, action: 'start' | 'stop') => {
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

    const { handleStart, handleRestart, handleDelete } = useTaskActions({
        refetchRelay, refetchTrans, refetchFission,
    });

    const flatRelays = useMemo(() => {
        if (!relayData) return [];
        const list: RelayInfo[] = [];
        Object.values(relayData).forEach(apps => {
            Object.values(apps).forEach(streams => {
                streams.relays.forEach(relay => list.push(relay));
            });
        });
        return list;
    }, [relayData]);

    const flatTrans = useMemo(() => {
        if (!transData) return [];
        const list: TransTask[] = [];
        Object.values(transData).forEach(apps => {
            Object.values(apps).forEach(streams => {
                streams.trans.forEach(trans => list.push(trans));
            });
        });
        return list;
    }, [transData]);

    const flatFission = useMemo(() => {
        if (!fissionData) return [];
        const list: FissionTask[] = [];
        Object.values(fissionData).forEach(apps => {
            Object.values(apps).forEach(streams => {
                streams.fission.forEach(fission => list.push(fission));
            });
        });
        return list;
    }, [fissionData]);

    const items = [
        {
            key: 'relay',
            label: `${t('component_relay')} (${flatRelays.length})`,
            children: (
                <BasicTaskTable
                    type="relay"
                    data={flatRelays}
                    loading={relayLoading}
                    pathField="url"
                    showMode
                    onStart={handleStart}
                    onRestart={handleRestart}
                    onDelete={handleDelete}
                />
            ),
        },
        {
            key: 'trans',
            label: `${t('component_trans')} (${flatTrans.length})`,
            children: (
                <BasicTaskTable
                    type="trans"
                    data={flatTrans}
                    loading={transLoading}
                    pathField="path"
                    onStart={handleStart}
                    onRestart={handleRestart}
                    onDelete={handleDelete}
                />
            ),
        },
        {
            key: 'fission',
            label: `${t('component_fission')} (${flatFission.length})`,
            children: (
                <BasicTaskTable
                    type="fission"
                    data={flatFission}
                    loading={fissionLoading}
                    pathField="path"
                    onStart={handleStart}
                    onRestart={handleRestart}
                    onDelete={handleDelete}
                />
            ),
        },
        {
            key: 'switch',
            label: `${t('component_switch')} (${switchData?.length || 0})`,
            children: (
                <SwitchTaskTable
                    data={switchData}
                    loading={switchLoading}
                    allStreamPaths={allStreamPaths}
                    refetch={refetchSwitch}
                />
            ),
        },
        {
            key: 'static',
            label: `${t('component_static')} (${staticData?.length || 0})`,
            children: <StaticTaskTable data={staticData} loading={staticLoading} />,
        },
    ];

    const serviceKeys: ServerComponentKey[] = ['rtmp', 'av', 'trans', 'relay', 'fission', 'switch', 'static'];

    return (
        <div style={{ padding: '0 4px' }}>
            <Title level={4} style={{ marginBottom: 16 }}>
                {t('service_controls')}
            </Title>
            <Row gutter={16}>
                {serviceKeys.map(key => (
                    <ServiceControl
                        key={key}
                        componentKey={key}
                        serverStatus={serverStatus}
                        loading={statusLoading}
                        onAction={handleAction}
                    />
                ))}
            </Row>

            <Card
                style={{ marginTop: 8 }}
                title={
                    <Space>
                        <Title level={4} style={{ margin: 0 }}>{t('background_tasks')}</Title>
                        {(
                            relayLoading || transLoading || fissionLoading || switchLoading || staticLoading || statusLoading
                        ) && <SyncOutlined spin />}
                    </Space>
                }
            >
                <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} />
            </Card>
        </div>
    );
};

export default Tasks;
