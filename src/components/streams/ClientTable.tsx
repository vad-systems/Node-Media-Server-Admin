import { Table } from 'antd';
import React from 'react';
import bytesToSize from '../../util/bytesToSize';
import secondsToDhmsSimple from '../../util/secondsToDhmsSimple';
import { ClientData } from './types';

type ClientTableProps = {
    clients: ClientData[];
};

const ClientTable = ({ clients }: ClientTableProps) => (
    <Table
        dataSource={clients}
        columns={[
            {
                title: 'ID',
                key: 'clientId',
                dataIndex: 'clientId',
            },
            {
                title: 'Connection',
                key: 'ip',
                dataIndex: 'ip',
                render: (ip: string, record: ClientData) => `${record.protocol} @ ${ip}`,
            },
            {
                title: 'Data',
                key: 'bytes',
                dataIndex: 'bytes',
                render: (bytes: number) => bytesToSize(bytes),
            },
            {
                title: 'Time',
                key: 'connectCreated',
                dataIndex: 'connectCreated',
                render: (connectCreated: number) => {
                    const now = new Date().getTime();
                    const connected = new Date(connectCreated).getTime();

                    return secondsToDhmsSimple((
                        now - connected
                    ) / 1000);
                },
            },
        ]}
        bordered
        scroll={{ x: 'max-content' }}
        pagination={false}
    />
);

export default ClientTable;
