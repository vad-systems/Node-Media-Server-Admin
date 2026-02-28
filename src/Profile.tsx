import { HddOutlined } from '@ant-design/icons';
import { Card, Table } from 'antd';
import React, { Fragment, useCallback, useEffect, useState } from 'react';
import bytesToSize from './util/bytesToSize.js';
import secondsToDhms from './util/secondsToDhms.js';
import Package from '../package.json';

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
    const [data, setData] = useState<ProfileData[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchData = useCallback(() => {
        setLoading(true);

        fetch('/api/server', { credentials: 'include' })
            .then((response) => response.json())
            .then((data) => {
                // Read total count from server
                let osInfo = {
                    key: 0,
                    name: 'OS',
                    value: data.os.arch + '_' + data.os.platform + '_' + data.os.release,
                };
                let cpuInfo = { key: 1, name: 'CPU', value: data.cpu.num + ' x ' + data.cpu.model };
                let memInfo = { key: 2, name: 'Memory', value: bytesToSize(data.mem.totle) };
                let nodeInfo = { key: 3, name: 'Node.js', value: data.nodejs.version };
                let uptimeInfo = { key: 4, name: 'Uptime', value: secondsToDhms(data.nodejs.uptime) };
                let versionInfo = { key: 5, name: 'Node Media Server Version', value: data.version };
                let frontendVersionInfo = { key: 6, name: 'Node Media Server Admin Version', value: Package.version };

                setLoading(false);
                setData([osInfo, cpuInfo, memInfo, nodeInfo, uptimeInfo, versionInfo, frontendVersionInfo]);
            })
            .catch(e => {
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const title = (
        <Fragment>
            <HddOutlined />
            <span style={{ paddingLeft: '12px', fontSize: '16px' }}>Server Info</span>
        </Fragment>
    );

    return (
        <Card title={title}>
            <Table
                dataSource={data}
                columns={columns}
                loading={loading}
                pagination={false}
                showHeader={false}
            />
        </Card>
    );
};

export default Profile;
