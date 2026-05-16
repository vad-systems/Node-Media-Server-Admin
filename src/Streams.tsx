import { ApartmentOutlined, LockOutlined, SearchOutlined, SyncOutlined } from '@ant-design/icons';
import { App, Button, Card, Input, Flex, Modal, Radio, Space, Typography } from 'antd';
import { md5 } from 'js-md5';
import React, { ChangeEventHandler, Fragment, useCallback, useState, useMemo } from 'react';
import Cookies from 'universal-cookie';
import { useLocalStorage } from 'usehooks-ts';
import { api } from './api/service';
import { StreamStats } from './api/types.js';
import FlvPlayer from './FlvPlayer';
import StateTag from './components/StateTag';
import ClientTable from './components/streams/ClientTable';
import StreamDetails from './components/streams/StreamDetails';
import StreamTable from './components/streams/StreamTable';
import StreamTree from './components/streams/StreamTree';
import { StreamData } from './components/streams/types';
import { transformStreamsData } from './components/streams/utils';
import { useFetch } from './hooks/useFetch';
import { useTranslation } from './context/LanguageContext';
import spaceship from './util/spaceship';

const Streams = () => {
    const { message } = App.useApp();
    const { t } = useTranslation();
    const [cookies] = useState(new Cookies());

    const [password, setPassword] = useState(cookies.get('pass') || '');
    const [streamsData, setStreamsData] = useState<StreamData[]>([]);
    const [grouping, setGrouping] = useLocalStorage<'none' | 'app' | 'prefix'>('nms.admin.streams.grouping', 'none');
    const [viewingStreamKey, setViewingStreamKey] = useState<string | null>(null);
    const [modalType, setModalType] = useState<'clients' | 'details' | null>(null);
    const [playerStream, setPlayerStream] = useState<{ app: string; name: string; sign: string } | null>(null);
    const [treeOpen, setTreeOpen] = useState(false);
    const [filter, setFilter] = useState('');

    const { data: switchData, loading: switchLoading, refetch: refetchSwitch } = useFetch(api.getSwitchTasks, {
        immediate: true,
        refreshInterval: 5000,
    });

    const onError = useCallback(async (e: Error) => {
        console.warn(e);
        await message.error(`${t('failed_fetch_streams')}: ${e.message}`);
    }, [message, t]);
    const onSuccess = useCallback((data: StreamStats) => {
        let transformed = transformStreamsData(data);
        if (switchData) {
            transformed = transformed.map(s => ({
                ...s,
                switchInfo: switchData.find(st => st.outputPath === `/${s.app}/${s.name}`)
            }));
        }
        setStreamsData(transformed);
    }, [setStreamsData, switchData]);
    const { loading, refetch } = useFetch(api.getStreams, {
        immediate: true,
        refreshInterval: 2000,
        onSuccess,
        onError,
    });

    const currentViewingStream = useMemo(() => {
        if (!viewingStreamKey) return null;
        return streamsData.find(s => `${s.app}/${s.name}` === viewingStreamKey) || null;
    }, [viewingStreamKey, streamsData]);

    const updatePass = useCallback<ChangeEventHandler<HTMLInputElement>>(({ target }) => {
        const password = target.value;
        setPassword(password);
        cookies.set('pass', password, { path: '/', maxAge: 31536000 });
    }, [cookies]);

    const openVideo = useCallback((record: StreamData) => {
        let sign = '';
        if (password) {
            const hash = md5.create();
            const ext = Date.now() + 30000;
            hash.update(`/${record.app}/${record.name}-${ext}-${password}`);
            const key = hash.hex();
            sign = `?sign=${ext}-${key}`;
        }
        setPlayerStream({ app: record.app, name: record.name, sign });
    }, [password]);

    const closePlayer = useCallback(() => setPlayerStream(null), []);

    // Live view of the currently-playing stream, so the dialog title reflects polling updates.
    const livePlayerStream = useMemo(() => {
        if (!playerStream) return null;
        return streamsData.find(s => s.app === playerStream.app && s.name === playerStream.name) || null;
    }, [playerStream, streamsData]);

    const showClients = useCallback((record: StreamData) => {
        setViewingStreamKey(`${record.app}/${record.name}`);
        setModalType('clients');
    }, []);

    const showDetails = useCallback((record: StreamData) => {
        setViewingStreamKey(`${record.app}/${record.name}`);
        setModalType('details');
    }, []);


    const deleteStream = useCallback((record: StreamData) => {
        let sign = '';
        if (password) {
            const hash = md5.create();
            const ext = Date.now() + 30000;
            hash.update(`/${record.app}/${record.name}-${ext}-${password}`);
            const key = hash.hex();
            sign = `?sign=${ext}-${key}`;
        }

        api.deleteStream(record.app, record.name, sign)
            .then(() => {
                message.success(t('stream_deleted').replace('{path}', `${record.app}/${record.name}`));
                refetch();
            })
            .catch((e) => {
                message.error(`${t('failed_delete_stream')}: ${e.message}`);
            });
    }, [password, refetch, message, t]);

    const displayData = useMemo(() => {
        const q = filter.trim().toLowerCase();
        const filtered = q
            ? streamsData.filter(s =>
                s.app?.toLowerCase().includes(q)
                || s.name?.toLowerCase().includes(q)
                || s.id?.toLowerCase().includes(q)
                || s.broadcastId?.toLowerCase().includes(q)
                || `${s.app}/${s.name}`.toLowerCase().includes(q))
            : streamsData;
        const sorted = [...filtered].sort(
            (
                { app: aApp, name: aName, id: aId },
                { app: bApp, name: bName, id: bId },
            ) => {
                return spaceship(aApp, bApp)
                    || spaceship(aName, bName)
                    || spaceship(aId, bId);
            },
        );

        if (grouping === 'none') return sorted;

        if (grouping === 'app') {
            const groups: Record<string, StreamData[]> = {};
            sorted.forEach(s => {
                if (!groups[s.app]) groups[s.app] = [];
                groups[s.app].push(s);
            });
            return Object.entries(groups).map(([app, streams]) => ({
                key: `group-app-${app}`,
                app,
                name: `(${streams.length} streams)`,
                isGroup: true,
                children: streams,
            })) as any[];
        }

        if (grouping === 'prefix') {
            const groups: Record<string, StreamData[]> = {};
            sorted.forEach(s => {
                const prefix = s.name.replace(/_[0-9]+$/, '');
                if (!groups[prefix]) groups[prefix] = [];
                groups[prefix].push(s);
            });
            return Object.entries(groups).map(([prefix, streams]) => {
                const sameApp = streams.length > 0 && streams.every(s => s.app === streams[0].app);
                return {
                    key: `group-prefix-${prefix}`,
                    app: sameApp ? streams[0].app : 'Multiple',
                    name: `${prefix} (${streams.length} streams)`,
                    isGroup: true,
                    children: streams,
                };
            }) as any[];
        }

        return sorted;
    }, [streamsData, grouping, filter]);

    const closeModal = () => {
        setViewingStreamKey(null);
        setModalType(null);
    };

    return (
        <Fragment>
            <Card 
                title={
                    <Flex align="center" gap="small">
                        <span>{t('active_streams')}</span>
                        {loading && <SyncOutlined spin style={{ color: '#1890ff' }} />}
                    </Flex>
                }
                extra={
                    <Flex align="center" gap="small" wrap="wrap" justify="flex-end">
                        <Flex align="center" gap="small">
                            <Input
                                size="small"
                                allowClear
                                prefix={<SearchOutlined style={{ color: 'rgba(0,0,0,.35)' }} />}
                                placeholder={t('filter_streams')}
                                value={filter}
                                onChange={e => setFilter(e.target.value)}
                                style={{ width: 200 }}
                            />
                        </Flex>
                        <Flex align="center" gap="small">
                            <Radio.Group value={grouping} onChange={e => setGrouping(e.target.value)} size="small">
                                <Radio.Button value="none">{t('none')}</Radio.Button>
                                <Radio.Button value="app">{t('app')}</Radio.Button>
                                <Radio.Button value="prefix">{t('prefix')}</Radio.Button>
                            </Radio.Group>
                        </Flex>
                        <Flex align="center" gap="small">
                            <Button
                                size="small"
                                icon={<ApartmentOutlined />}
                                onClick={() => setTreeOpen(true)}
                            >
                                {t('tree_view')}
                            </Button>
                        </Flex>
                    </Flex>
                }
            >
                <Input.Password
                    size="large"
                    prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                    style={{ marginBottom: '16px' }}
                    placeholder={t('stream_secret')}
                    onChange={updatePass}
                    value={password}
                />
                <StreamTable
                    dataSource={displayData}
                    loading={loading && streamsData.length === 0}
                    openVideo={openVideo}
                    showClients={showClients}
                    showDetails={showDetails}
                    deleteStream={deleteStream}
                />
            </Card>

            <Modal
                title={modalType === 'clients' ? `${t('clients')} /${currentViewingStream?.app}/${currentViewingStream?.name}` : `${t('stream_details')}: /${currentViewingStream?.app}/${currentViewingStream?.name}`}
                open={!!modalType}
                onCancel={closeModal}
                footer={null}
                width={modalType === 'clients' ? 800 : 500}
                destroyOnHidden
            >
                {modalType === 'clients' && currentViewingStream && (
                    <ClientTable clients={currentViewingStream.clients} />
                )}
                {modalType === 'details' && currentViewingStream && (
                    <StreamDetails app={currentViewingStream.app} stream={currentViewingStream.name} ip={currentViewingStream.ip} />
                )}
            </Modal>

            <Modal
                title={t('streams_tree')}
                open={treeOpen}
                onCancel={() => setTreeOpen(false)}
                footer={null}
                width={720}
                destroyOnHidden
            >
                {treeOpen && <StreamTree />}
            </Modal>

            <Modal
                open={!!playerStream}
                onCancel={closePlayer}
                footer={null}
                width={720}
                closable
                maskClosable
                destroyOnHidden
                title={
                    <Space size={8} wrap align="center">
                        <span>{t('video_player')}</span>
                        {playerStream && (
                            <Typography.Text code style={{ fontSize: 13 }}>
                                /{playerStream.app}/{playerStream.name}
                            </Typography.Text>
                        )}
                        {livePlayerStream?.state !== undefined && (
                            <StateTag kind="broadcast" state={livePlayerStream.state} />
                        )}
                        {livePlayerStream?.publisherState !== undefined && (
                            <StateTag kind="session" state={livePlayerStream.publisherState} />
                        )}
                    </Space>
                }
            >
                {playerStream && (
                    <FlvPlayer
                        url={`/${playerStream.app}/${playerStream.name}.flv${playerStream.sign}`}
                        type="flv"
                        switchInfo={livePlayerStream?.switchInfo}
                        onSwitched={refetchSwitch}
                        app={playerStream.app}
                        name={playerStream.name}
                        streamUptime={livePlayerStream?.time}
                        publisherId={livePlayerStream?.id}
                        publisherState={livePlayerStream?.publisherState}
                        broadcastId={livePlayerStream?.broadcastId}
                        broadcastState={livePlayerStream?.state}
                    />
                )}
            </Modal>
        </Fragment>
    );
};

export default Streams;
