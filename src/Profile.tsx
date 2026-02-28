import { HddOutlined } from '@ant-design/icons';
import { App, Card, Table, Skeleton } from 'antd';
import React, { Fragment, useCallback, useMemo } from 'react';
import { api } from './api/service';
import bytesToSize from './util/bytesToSize';
import secondsToDhms from './util/secondsToDhms';
import Package from '../package.json';
import { useFetch } from './hooks/useFetch';

type ProfileData = {
    key: number;
    name: string;
    value: string;
};

const columns = [
    {
        dataIndex: 'name',
        key: 'name',
        width: 200,
    },
    {
        dataIndex: 'value',
        key: 'value',
    },
];

const Profile = () => {
    const { message } = App.useApp();

    const onError = useCallback(async (e: Error) => {
        await message.error(`Failed to fetch server info: ${e.message}`);
    }, [message]);
    
    const { data: serverInfo, loading } = useFetch(api.getServerInfo, {
        immediate: true,
        onError,
    });

    const data: ProfileData[] = useMemo(() => {
        if (!serverInfo) return [];
        return [
            {
                key: 0,
                name: 'OS',
                value: serverInfo.os.arch + '_' + serverInfo.os.platform + '_' + serverInfo.os.release,
            },
            { key: 1, name: 'CPU', value: serverInfo.cpu.num + ' x ' + serverInfo.cpu.model },
            { key: 2, name: 'Memory', value: bytesToSize(serverInfo.mem.total) },
            { key: 3, name: 'Node.js', value: serverInfo.nodejs.version },
            { key: 4, name: 'Uptime', value: secondsToDhms(serverInfo.nodejs.uptime) },
            { key: 5, name: 'Node Media Server Version', value: serverInfo.version },
            { key: 6, name: 'Node Media Server Admin Version', value: Package.version },
        ];
    }, [serverInfo]);

    const title = (
        <Fragment>
            <HddOutlined />
            <span style={{ paddingLeft: '12px', fontSize: '16px' }}>Server Info</span>
        </Fragment>
    );

    return (
        <Card title={title}>
            {loading && !serverInfo ? (
                <Skeleton active />
            ) : (
                <Table
                    dataSource={data}
                    columns={columns}
                    loading={loading}
                    pagination={false}
                    showHeader={false}
                />
            )}
        </Card>
    );
};

export default Profile;
