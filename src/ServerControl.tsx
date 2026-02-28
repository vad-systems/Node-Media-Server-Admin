import { App, Button, Card, Col, Flex, Row, Space, Tag, Typography, Skeleton } from 'antd';
import { PlayCircleOutlined, StopOutlined, SyncOutlined } from '@ant-design/icons';
import React, { useCallback } from 'react';
import { api } from './api/service';
import { useFetch } from './hooks/useFetch';
import { ServerStatus } from './api/types';

const { Text, Title } = Typography;

const ServerControl = () => {
    const { message } = App.useApp();

    const onError = useCallback(async (e: Error) => {
        await message.error(`Failed to fetch server status: ${e.message}`);
    }, [message]);

    const { data: status, loading, refetch } = useFetch(api.getServerStatus, {
        immediate: true,
        refreshInterval: 5000,
        onError,
    });

    const handleAction = useCallback(async (server: 'rtmp' | 'av' | 'trans' | 'relay' | 'fission', action: 'start' | 'stop') => {
        try {
            if (action === 'start') {
                await api.startServer(server);
                message.success(`${server.toUpperCase()} started`);
            } else {
                await api.stopServer(server);
                message.success(`${server.toUpperCase()} stopped`);
            }
            refetch();
        } catch (e: any) {
            message.error(`Action failed: ${e.message}`);
        }
    }, [message, refetch]);

    const renderComponent = (name: string, key: keyof ServerStatus) => {
        if (loading && !status) {
            return (
                <Col xs={24} sm={12} md={8} lg={6} key={key}>
                    <Card title={name} size="small" style={{ marginBottom: 16 }}>
                        <Skeleton active paragraph={{ rows: 2 }} />
                    </Card>
                </Col>
            );
        }

        const isRunning = status?.[key]?.running;
        const canControl = key !== 'http';

        return (
            <Col xs={24} sm={12} md={8} lg={6} key={key}>
                <Card title={name} size="small" style={{ marginBottom: 16 }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Flex justify="space-between" align="center">
                            <Text>Status:</Text>
                            <Tag color={isRunning ? 'success' : 'error'}>
                                {isRunning ? 'RUNNING' : 'STOPPED'}
                            </Tag>
                        </Flex>
                        {canControl && (
                            <Flex justify="flex-end" gap="small" style={{ marginTop: 8 }}>
                                <Button
                                    type="primary"
                                    icon={<PlayCircleOutlined />}
                                    disabled={isRunning || loading}
                                    onClick={() => handleAction(key as any, 'start')}
                                    size="small"
                                >
                                    Start
                                </Button>
                                <Button
                                    danger
                                    icon={<StopOutlined />}
                                    disabled={!isRunning || loading}
                                    onClick={() => handleAction(key as any, 'stop')}
                                    size="small"
                                >
                                    Stop
                                </Button>
                            </Flex>
                        )}
                    </Space>
                </Card>
            </Col>
        );
    };

    return (
        <div style={{ padding: '24px' }}>
            <Title level={4} style={{ marginBottom: 24 }}>
                <SyncOutlined spin={loading} style={{ marginRight: 8 }} />
                Server Components Control
            </Title>
            <Row gutter={16}>
                {renderComponent('RTMP Server', 'rtmp')}
                {renderComponent('HTTP Server', 'http')}
                {renderComponent('A/V Engine', 'av')}
                {renderComponent('Transcoding', 'trans')}
                {renderComponent('Relay Service', 'relay')}
                {renderComponent('Fission Service', 'fission')}
            </Row>
        </div>
    );
};

export default ServerControl;
