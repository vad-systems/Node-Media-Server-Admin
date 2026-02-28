import { Card, Col } from 'antd';
import ReactECharts, { EChartsOption } from 'echarts-for-react';
import React from 'react';

type DashboardChartProps = {
    option: EChartsOption;
    height: string;
    span?: number;
};

const DashboardChart = ({ option, height }: DashboardChartProps) => (
    <Col
        xs={24}
        md={12}
        style={{
            padding: '12px',
            marginTop: '16px',
        }}
    >
        <Card>
            <ReactECharts
                option={option}
                style={{ height, width: '100%' }}
            />
        </Card>
    </Col>
);

export default DashboardChart;
