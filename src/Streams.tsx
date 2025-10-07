import { DeleteOutlined, LockOutlined } from '@ant-design/icons';
import { Card, Input, Modal, Table } from 'antd';
import { md5 } from 'js-md5';
import React, { ChangeEventHandler, Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import Cookies from 'universal-cookie';
import Flvplayer from './FlvPlayer.js';
import bytesToSize from './util/bytesToSize.js';
import secondsToDhmsSimple from './util/secondsToDhmsSimple.js';

type ClientData = {
    app: string;
    stream: string;
    bytes: number;
    clientId: string;
    connectCreated: string;
    ip: string;
    protocol: string;
};

type StreamData = {
    key: number;
    app: string;
    name: string;
    id: string;
    ip: string;
    ac: string;
    freq: string;
    chan: string;
    vc: string;
    size: string;
    fps: string;
    time: string;
    clients: ClientData[];
    clientCount: number;
};

const Streams = () => {
    const [cookies, setCookies] = useState(new Cookies());

    const [password, setPassword] = useState(cookies.get('pass') || '');
    const [streamsData, setStreamsData] = useState<StreamData[]>([]);
    const [loading, setLoading] = useState(false);
    const [modal, contextHolder] = Modal.useModal();

    const fetchData = useCallback(() => {
        setLoading(true);

        fetch('/api/streams', { credentials: 'include' })
            .then(function (response) {
                return response.json();
            })
            .then((data) => {
                // Read total count from server
                let streamsData = [];
                let index = 0;
                for (let app in data) {
                    for (let name in data[app]) {
                        let stream = data[app][name].publisher;
                        let clients = data[app][name].subscribers;
                        if (stream) {
                            let now = new Date().getTime() / 1000;
                            let str = new Date(stream.connectCreated).getTime() / 1000;
                            let streamData: StreamData = {
                                key: index++,
                                app,
                                name,
                                id: stream.clientId,
                                ip: stream.ip,
                                ac: stream.audio ? stream.audio.codec + ' ' + stream.audio.profile : '',
                                freq: stream.audio ? stream.audio.samplerate : '',
                                chan: stream.audio ? stream.audio.channels : '',
                                vc: stream.video ? stream.video.codec + ' ' + stream.video.profile : '',
                                size: stream.video ? stream.video.width + 'x' + stream.video.height : '',
                                fps: stream.video ? Math.floor(stream.video.fps).toString() : '',
                                time: secondsToDhmsSimple(now - str),
                                clients: clients,
                                clientCount: clients.length,
                            };
                            streamsData.push(streamData);
                        }
                    }
                }

                setLoading(false);
                setStreamsData(streamsData);
            })
            .catch((e) => {
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const updatePass = useCallback<ChangeEventHandler<HTMLInputElement>>(({ target }) => {
        let password = target.value;
        setPassword(password);
        setCookies((cookies) => {
            cookies.set('pass', password, { path: '/', maxAge: 31536000 });
            return cookies;
        });
    }, []);

    const openVideo = useCallback((record: StreamData) => {
        let sign = '';
        if (password) {
            let hash = md5.create();
            let ext = Date.now() + 30000;
            hash.update(`/${record.app}/${record.name}-${ext}-${password}`);
            let key = hash.hex();
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
            title: 'Clients',
            width: 640,
            height: 480,
            content: (
                <Table
                    dataSource={record.clients}
                    columns={[
                        {
                            title: "ID",
                            key: "clientId",
                            dataIndex: "clientId",
                        },
                        {
                            title: "Connection",
                            key: "ip",
                            dataIndex: "ip",
                            render: (ip: string, record: ClientData) =>  `${record.protocol} @ ${ip}`,
                        },
                        {
                            title: "Data",
                            key: "bytes",
                            dataIndex: "bytes",
                            render: (bytes: number) => bytesToSize(bytes),
                        },
                        {
                            title: "Connected",
                            key: "connectCreated",
                            dataIndex: "connectCreated",
                            render: (connectCreated: string) => new Date(connectCreated).toLocaleString(),
                        },

                        /**
                         *     app: string;
                         *     stream: string;
                         *     bytes: number;
                         *     clientId: string;
                         *     connectCreated: string;
                         *     ip: string;
                         *     protocol: string;
                         */
                    ]}
                    bordered
                    scroll={{ x: 'max-content' }}
                    pagination={false}
                />
            ),
        });
    }, [password, modal]);

    const deleteStream = useCallback((record: StreamData) => {
        let sign = '';
        if (password) {
            let hash = md5.create();
            let ext = Date.now() + 30000;
            hash.update(`/${record.app}/${record.name}-${ext}-${password}`);
            let key = hash.hex();
            sign = `?sign=${ext}-${key}`;
        }

        fetch(`/api/streams/${record.app}/${record.name}${sign}`, { credentials: 'include', method: 'DELETE' })
            .then((response) => response.json())
            .then((data) => {
                setLoading(false);
                fetchData();
            })
            .catch((e) => {
                setLoading(false);
            });
    }, [password, modal]);

    const columns = useMemo(() => {
        return [
            {
                title: 'App',
                dataIndex: 'app',
                key: 'app',
            },
            {
                title: 'Name',
                dataIndex: 'name',
                key: 'name',
                render: (name: string, record: StreamData) => {
                    return <a href="##" onClick={() => openVideo(record)}>{name}</a>;
                },
            },
            {
                title: 'ID',
                dataIndex: 'id',
                key: 'id',
            },
            {
                title: 'IP',
                dataIndex: 'ip',
                key: 'ip',
            },
            {
                title: 'Audio',
                children: [
                    {
                        title: 'codec',
                        dataIndex: 'ac',
                        key: 'ac',
                    }, {
                        title: 'freq',
                        dataIndex: 'freq',
                        key: 'freq',
                    }, {
                        title: 'chan',
                        dataIndex: 'chan',
                        key: 'chan',
                    },
                ],
            },
            {
                title: 'Video',
                children: [
                    {
                        title: 'codec',
                        dataIndex: 'vc',
                        key: 'vc',
                    }, {
                        title: 'size',
                        dataIndex: 'size',
                        key: 'size',
                    }, {
                        title: 'fps',
                        dataIndex: 'fps',
                        key: 'fps',
                    },
                ],
            },
            {
                title: 'Time',
                dataIndex: 'time',
                key: 'time',
            },
            {
                title: 'Clients',
                dataIndex: 'clients',
                key: 'clients',
                render: (name: string, record: StreamData) => {
                    return <a href="##" onClick={() => showClients(record)}>{record.clientCount}</a>;
                },
            },
            {
                title: 'Actions',
                dataIndex: 'actions',
                key: 'actions',
                render: (name: string, record: StreamData) => {
                    return (
                        <Fragment>
                            <a href="##" onClick={() => deleteStream(record)}>
                                <DeleteOutlined />
                            </a>
                        </Fragment>
                    );
                },
            },
        ];
    }, [password, openVideo]);

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
                <Table
                    dataSource={streamsData}
                    columns={columns}
                    loading={loading}
                    bordered
                    scroll={{ x: 'max-content' }}
                    pagination={false}
                />
            </Card>
            {contextHolder}
        </Fragment>
    );
};

export default Streams;
