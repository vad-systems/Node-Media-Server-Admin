import { SyncOutlined } from '@ant-design/icons';
import { Row, Col, Button, App, Card, Flex } from 'antd';
import React, { useCallback, useState } from 'react';
import DashboardChart from './components/dashboard/DashboardChart';
import { useStats } from './context/StatsContext';

const Dashboard = () => {
    const { message } = App.useApp();
    const { state, refresh } = useStats();
    const { conOption, netOption, cpuOption, memOption } = state;
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await refresh();
            message.success('Stats refreshed successfully');
        } catch (error: any) {
            message.error(`Failed to refresh stats: ${error.message}`);
        } finally {
            setRefreshing(false);
        }
    }, [message, refresh]);

    return (
        <Row style={{ margin: '0 -12px' }} wrap>
            <Col span={24} style={{ padding: '0 12px', marginBottom: '16px' }}>
                <Card size="small">
                    <Flex justify="space-between" align="center">
                        <span style={{ fontWeight: 'bold' }}>Dashboard Overview</span>
                        <Button 
                            icon={<SyncOutlined spin={refreshing} />} 
                            onClick={handleRefresh}
                            loading={refreshing}
                        >
                            Refresh Stats
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
