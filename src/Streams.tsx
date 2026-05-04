import { LockOutlined, SyncOutlined } from '@ant-design/icons';
import { App, Card, Input, Flex, Modal, Radio } from 'antd';
import { md5 } from 'js-md5';
import React, { ChangeEventHandler, Fragment, useCallback, useState, useMemo } from 'react';
import Cookies from 'universal-cookie';
import { api } from './api/service';
import { StreamStats } from './api/types.js';
import Flvplayer from './FlvPlayer';
import ClientTable from './components/streams/ClientTable';
import StreamDetails from './components/streams/StreamDetails';
import StreamTable from './components/streams/StreamTable';
import { StreamData } from './components/streams/types';
import { transformStreamsData } from './components/streams/utils';
import { useFetch } from './hooks/useFetch';
import spaceship from './util/spaceship';

const Streams = () => {
    const { message, modal } = App.useApp();
    const [cookies] = useState(new Cookies());

    const [password, setPassword] = useState(cookies.get('pass') || '');
    const [streamsData, setStreamsData] = useState<StreamData[]>([]);
    const [grouping, setGrouping] = useState<'none' | 'app' | 'prefix'>('none');
    const [viewingStreamKey, setViewingStreamKey] = useState<string | null>(null);
    const [modalType, setModalType] = useState<'clients' | 'details' | null>(null);

    const onError = useCallback(async (e: Error) => {
        console.warn(e);
        await message.error(`Failed to fetch streams: ${e.message}`);
    }, [message]);
    const onSuccess = useCallback((data: StreamStats) => {
        setStreamsData(transformStreamsData(data));
    }, [setStreamsData]);
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

        modal.info({
            icon: null,
            title: 'Video Player',
            width: 640,
            height: 480,
            content: <Flvplayer
                url={`/${record.app}/${record.name}.flv${sign}`}
                type="flv"
            />,
        });
    }, [password, modal]);

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
                message.success(`Stream /${record.app}/${record.name} deleted`);
                refetch();
            })
            .catch((e) => {
                message.error(`Failed to delete stream: ${e.message}`);
            });
    }, [password, refetch, message]);

    const displayData = useMemo(() => {
        const sorted = [...streamsData].sort(
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
    }, [streamsData, grouping]);

    const closeModal = () => {
        setViewingStreamKey(null);
        setModalType(null);
    };

    return (
        <Fragment>
            <Card 
                title={
                    <Flex align="center" gap="small">
                        <span>Active Streams</span>
                        {loading && <SyncOutlined spin style={{ color: '#1890ff' }} />}
                    </Flex>
                }
                extra={
                    <Radio.Group value={grouping} onChange={e => setGrouping(e.target.value)} size="small">
                        <Radio.Button value="none">None</Radio.Button>
                        <Radio.Button value="app">App</Radio.Button>
                        <Radio.Button value="prefix">Prefix</Radio.Button>
                    </Radio.Group>
                }
            >
                <Input.Password
                    size="large"
                    prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                    style={{ marginBottom: '16px' }}
                    placeholder="input password"
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
                title={modalType === 'clients' ? `Clients /${currentViewingStream?.app}/${currentViewingStream?.name}` : `Stream Details: /${currentViewingStream?.app}/${currentViewingStream?.name}`}
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
        </Fragment>
    );
};

export default Streams;
