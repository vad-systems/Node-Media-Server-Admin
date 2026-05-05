import { SettingOutlined, SyncOutlined } from '@ant-design/icons';
import { Row, Col, Button, App, Card, Flex, Checkbox, Popover } from 'antd';
import React, { useCallback, useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import DashboardChart from './components/dashboard/DashboardChart';
import { useStats } from './context/StatsContext';
import { useTranslation } from './context/LanguageContext';

const Dashboard = () => {
    const { message } = App.useApp();
    const { state, refresh } = useStats();
    const { t } = useTranslation();
    const { conOption, netOption, cpuOption, memOption } = state;
    const [refreshing, setRefreshing] = useState(false);
    const [visibleCharts, setVisibleCharts] = useLocalStorage<string[]>('nms.admin.dashboard.visible', ['con', 'net', 'cpu', 'mem']);

    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await refresh();
            message.success(t('stats_refreshed'));
        } catch (error: any) {
            message.error(`${t('failed_refresh')}: ${error.message}`);
        } finally {
            setRefreshing(false);
        }
    }, [message, refresh, t]);

    const chartOptions = [
        { label: t('connections'), value: 'con' },
        { label: t('network'), value: 'net' },
        { label: t('cpu'), value: 'cpu' },
        { label: t('mem'), value: 'mem' },
    ];

    const settingsContent = (
        <Checkbox.Group 
            options={chartOptions} 
            value={visibleCharts} 
            onChange={(checkedValues) => setVisibleCharts(checkedValues as string[])}
            style={{ display: 'flex', flexDirection: 'column' }}
        />
    );

    return (
        <Row style={{ margin: '0 -12px' }} wrap>
            <Col span={24} style={{ padding: '0 12px', marginBottom: '16px' }}>
                <Card size="small">
                    <Flex justify="space-between" align="center">
                        <span style={{ fontWeight: 'bold' }}>{t('overview')}</span>
                        <Flex gap="small">
                            <Popover content={settingsContent} title={t('visible_widgets')} trigger="click" placement="bottomRight">
                                <Button icon={<SettingOutlined />} />
                            </Popover>
                            <Button 
                                icon={<SyncOutlined spin={refreshing} />} 
                                onClick={handleRefresh}
                                loading={refreshing}
                            >
                                {t('refresh_stats')}
                            </Button>
                        </Flex>
                    </Flex>
                </Card>
            </Col>
            {visibleCharts.includes('con') && <DashboardChart option={conOption} height="348px" />}
            {visibleCharts.includes('net') && <DashboardChart option={netOption} height="348px" />}
            {visibleCharts.includes('cpu') && <DashboardChart option={cpuOption} height="300px" />}
            {visibleCharts.includes('mem') && <DashboardChart option={memOption} height="300px" />}
        </Row>
    );
};

export default Dashboard;
