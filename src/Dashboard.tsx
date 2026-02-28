import { SyncOutlined } from '@ant-design/icons';
import { Row, Col, Button, App, Card, Flex } from 'antd';
import React, { useCallback, useState } from 'react';
import DashboardChart from './components/dashboard/DashboardChart';
import { useStats } from './context/StatsContext';

const Dashboard = () => {
    const { message } = App.useApp();
    const { state } = useStats();
    const { conOption, netOption, cpuOption, memOption } = state;
    const [restarting, setRestarting] = useState(false);

    const restartServiceWorker = useCallback(async () => {
        if ('serviceWorker' in navigator) {
            setRestarting(true);
            try {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (const registration of registrations) {
                    await registration.unregister();
                }
                
                // Re-register the service worker
                // Using the same URL logic as in index.tsx
                await navigator.serviceWorker.register(new URL('./sw.ts', import.meta.url), {
                    type: 'module',
                });
                
                message.success('Service Worker restarted successfully');
            } catch (error: any) {
                message.error(`Failed to restart Service Worker: ${error.message}`);
            } finally {
                setRestarting(false);
            }
        } else {
            message.warning('Service Workers are not supported in this browser');
        }
    }, [message]);

    return (
        <Row style={{ margin: '0 -12px' }} wrap>
            <Col span={24} style={{ padding: '0 12px', marginBottom: '16px' }}>
                <Card size="small">
                    <Flex justify="space-between" align="center">
                        <span style={{ fontWeight: 'bold' }}>Dashboard Overview</span>
                        <Button 
                            icon={<SyncOutlined spin={restarting} />} 
                            onClick={restartServiceWorker}
                            loading={restarting}
                        >
                            Restart Service Worker
                        </Button>
                    </Flex>
                </Card>
            </Col>
            <DashboardChart option={conOption} height="348px" />
            <DashboardChart option={netOption} height="348px" />
            <DashboardChart option={cpuOption} height="300px" />
            <DashboardChart option={memOption} height="300px" />
        </Row>
    );
};

export default Dashboard;
