import { LockOutlined } from '@ant-design/icons';
import { App, Card, Input, Skeleton } from 'antd';
import { md5 } from 'js-md5';
import React, { ChangeEventHandler, Fragment, useCallback, useState } from 'react';
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
    const onError = useCallback(async (e: Error) => {
        console.warn(e);
        await message.error(`Failed to fetch streams: ${e.message}`);
    }, [message]);
    const onSuccess = useCallback((data: StreamStats) => {
        setStreamsData(transformStreamsData(data));
    }, [setStreamsData, transformStreamsData]);
    const { loading, refetch } = useFetch(api.getStreams, {
        immediate: true,
        refreshInterval: 2000,
        onSuccess,
        onError,
    });

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
        modal.info({
            icon: null,
            title: `Clients /${record.app}/${record.name}`,
            width: 800,
            height: 640,
            content: <ClientTable clients={record.clients} />,
        });
    }, [modal]);

    const showDetails = useCallback((record: StreamData) => {
        modal.info({
            icon: null,
            title: `Stream Details: /${record.app}/${record.name}`,
            width: 500,
            content: <StreamDetails app={record.app} stream={record.name} />,
        });
    }, [modal]);

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

    const sortedStreams = streamsData.sort(
        (
            { app: aApp, name: aName, id: aId },
            { app: bApp, name: bName, id: bId },
        ) => {
            return spaceship(aApp, bApp)
                || spaceship(aName, bName)
                || spaceship(aId, bId);
        },
    );

    return (
        <Fragment>
            <Card>
                <Input.Password
                    size="large"
                    prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />}
                    style={{ marginBottom: '16px' }}
                    placeholder="input password"
                    onChange={updatePass}
                    value={password}
                />
                {loading && sortedStreams.length === 0 ? (
                    <Skeleton active paragraph={{ rows: 10 }} />
                ) : (
                    <StreamTable
                        dataSource={sortedStreams}
                        loading={loading}
                        openVideo={openVideo}
                        showClients={showClients}
                        showDetails={showDetails}
                        deleteStream={deleteStream}
                    />
                )}
            </Card>
        </Fragment>
    );
};

export default Streams;
