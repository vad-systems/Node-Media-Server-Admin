import { DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Table, Space } from 'antd';
import React, { Fragment, useMemo } from 'react';
import { StreamData } from './types';

type StreamTableProps = {
    dataSource: StreamData[];
    loading: boolean;
    openVideo: (record: StreamData) => void;
    showClients: (record: StreamData) => void;
    showDetails: (record: StreamData) => void;
    deleteStream: (record: StreamData) => void;
};

const StreamTable = ({ dataSource, loading, openVideo, showClients, showDetails, deleteStream }: StreamTableProps) => {
    const columns = useMemo(() => [
        {
            title: 'App',
            dataIndex: 'app',
            key: 'app',
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (name: string, record: any) => {
                if (record.isGroup) return <strong>{name}</strong>;
                return (
                    <a href="##" onClick={(e) => {
                        e.preventDefault();
                        openVideo(record);
                    }}>{name}</a>
                );
            },
        },
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            render: (id: string, record: any) => record.isGroup ? null : id,
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
            render: (time: string, record: any) => record.isGroup ? null : time,
        },
        {
            title: 'Clients',
            dataIndex: 'clients',
            key: 'clients',
            render: (_: any, record: any) => {
                if (record.isGroup) return null;
                return (
                    <a href="##" onClick={(e) => {
                        e.preventDefault();
                        showClients(record);
                    }}>{record.clientCount}</a>
                );
            },
        },
        {
            title: 'Actions',
            dataIndex: 'actions',
            key: 'actions',
            render: (_: any, record: any) => {
                if (record.isGroup) return null;
                return (
                    <Space size="middle">
                        <a href="##" onClick={(e) => {
                            e.preventDefault();
                            showDetails(record);
                        }} title="Details">
                            <InfoCircleOutlined />
                        </a>
                        <a href="##" onClick={(e) => {
                            e.preventDefault();
                            deleteStream(record);
                        }} style={{ color: 'red' }} title="Delete">
                            <DeleteOutlined />
                        </a>
                    </Space>
                );
            },
        },
    ], [openVideo, showClients, showDetails, deleteStream]);

    return (
        <Table
            dataSource={dataSource}
            columns={columns}
            loading={loading}
            bordered
            scroll={{ x: 'max-content' }}
            pagination={false}
        />
    );
};

export default StreamTable;
