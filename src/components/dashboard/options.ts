import type { EChartsOption } from 'echarts-for-react';

export interface DashboardEChartsOption extends EChartsOption {
    uptime?: Date | null;
}

export function getBaseOption(name: string): DashboardEChartsOption {
    return {
        title: {
            text: name,
        },
        tooltip: {
            trigger: 'axis',
        },
        grid: {
            left: '2%', right: '4%', bottom: '2%', containLabel: true,
        },
        xAxis: [
            {
                type: 'category', boundaryGap: false, data: [],
            },
        ],
        yAxis: [
            {
                type: 'value', max: 100,
            },
        ],
        series: [
            {
                name: name, type: 'line', areaStyle: { normal: {} }, data: [], xAxisIndex: 0, yAxisIndex: 0,
            },
        ],
        uptime: null,
    };
}

export function getConnOption(): DashboardEChartsOption {
    return {
        title: {
            text: 'Connections',
        },
        tooltip: {
            trigger: 'axis',
        },
        legend: {
            data: ['Rtmp', 'Http', 'WebSocket'],
        },
        grid: {
            left: '2%', right: '4%', bottom: '2%', containLabel: true,
        },
        xAxis: [
            {
                type: 'category', boundaryGap: false, data: [],
            },
        ],
        yAxis: [
            {
                type: 'value',
            },
        ], series: [
            {
                name: 'Rtmp', type: 'line', data: [], xAxisIndex: 0, yAxisIndex: 0,
            },
            {
                name: 'Http', type: 'line', data: [], xAxisIndex: 0, yAxisIndex: 0,
            },
            {
                name: 'WebSocket', type: 'line', data: [], xAxisIndex: 0, yAxisIndex: 0,
            },
        ],
        uptime: null,
    };
}

export function getNetOption(): DashboardEChartsOption {
    return {
        title: {
            text: 'Network Bandwidth',
        },
        tooltip: {
            trigger: 'axis', axisPointer: {
                animation: false,
            },
        },
        axisPointer: {
            link: { xAxisIndex: 'all' },
        },
        legend: {
            data: ['Input', 'Output'],
        },
        grid: [
            {
                left: 50, right: 50, height: '35%',
            },
            {
                left: 50, right: 50, top: '55%', height: '35%',
            },
        ],
        xAxis: [
            {
                type: 'category', boundaryGap: false, axisLine: { onZero: true }, data: [], show: false,
            },
            {
                gridIndex: 1,
                type: 'category',
                boundaryGap: false,
                axisLine: { onZero: true },
                data: [],
                position: 'bottom',
            },
        ], yAxis: [
            {
                name: 'Mbps', type: 'value',
            },
            {
                gridIndex: 1, type: 'value', inverse: true,
            },
        ],
        series: [
            {
                name: 'Input', type: 'line', data: [], xAxisIndex: 0, yAxisIndex: 0,
            },
            {
                name: 'Output', type: 'line', xAxisIndex: 1, yAxisIndex: 1, data: [],
            },
        ],
        uptime: null,
    };
}
