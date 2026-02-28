import { Card, Col } from 'antd';
import ReactECharts, { EChartsOption } from 'echarts-for-react';
import React, { useMemo, useState, useEffect } from 'react';

type DashboardChartProps = {
    option: EChartsOption;
    height: string;
    span?: number;
};

const DashboardChart = ({ option, height }: DashboardChartProps) => {
    const [isFirstRender, setIsFirstRender] = useState(true);

    useEffect(() => {
        setIsFirstRender(false);
    }, []);

    const chartOption = useMemo(() => {
        return {
            ...option,
            animation: !isFirstRender
        };
    }, [isFirstRender, option]);

    return (
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
                    option={chartOption}
                    style={{ height, width: '100%' }}
                    notMerge={false}
                    lazyUpdate={true}
                />
            </Card>
        </Col>
    );
};

export default DashboardChart;
