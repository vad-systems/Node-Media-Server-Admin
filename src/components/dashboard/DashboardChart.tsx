import { Card, Col } from 'antd';
import ReactECharts, { EChartsOption } from 'echarts-for-react';
import React, { useMemo, useRef, ComponentProps } from 'react';

type DashboardChartProps = {
    option: EChartsOption;
    height: string;
    span?: number;
} & Omit<ComponentProps<typeof Col>, 'children'>;

const getSeriesDataLength = (option: EChartsOption): number => {
    const series = (option as any).series;
    if (!Array.isArray(series) || series.length === 0) return 0;
    return series.reduce((acc: number, s: any) => acc + (Array.isArray(s?.data) ? s.data.length : 0), 0);
};

const DashboardChart = ({ option, height, ...colProps }: DashboardChartProps) => {
    // Only enable animation once the chart already has data; the initial draw (going from
    // empty to a full series) should not animate. After that, new entries are animated.
    const hasDrawnDataRef = useRef(false);
    const animationEnabled = hasDrawnDataRef.current;
    if (!hasDrawnDataRef.current && getSeriesDataLength(option) > 0) {
        hasDrawnDataRef.current = true;
    }

    const chartOption = useMemo(() => {
        return {
            ...option,
            animation: animationEnabled,
        };
    }, [animationEnabled, option]);

    return (
        <Col
            xs={24}
            md={12}
            {...colProps}
            style={{
                padding: '12px',
                marginTop: '16px',
                ...(colProps.style || {}),
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
