import { Row } from 'antd';
import React from 'react';
import DashboardChart from './components/dashboard/DashboardChart';
import { useStats } from './context/StatsContext';

const Dashboard = () => {
    const { state } = useStats();
    const { conOption, netOption, cpuOption, memOption } = state;

    return (
        <Row style={{ margin: '0 -12px' }} wrap>
            <DashboardChart option={conOption} height="348px" />
            <DashboardChart option={netOption} height="348px" />
            <DashboardChart option={cpuOption} height="300px" />
            <DashboardChart option={memOption} height="300px" />
        </Row>
    );
};

export default Dashboard;
