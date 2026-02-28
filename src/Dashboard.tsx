import { Card, Col, Row } from 'antd';
import type { EChartsOption } from 'echarts-for-react';
import ReactECharts from 'echarts-for-react';
import React, { useCallback, useState } from 'react';
import { useInterval } from 'usehooks-ts';
import bytesToBand from './util/bytesToBand.js';

function getOption(name: string): EChartsOption {
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

function getConnOption(): EChartsOption {
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
    };
}

function getNetOption(): EChartsOption {
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
    };
}

const Dashboard = () => {
    const [chartData, setChartData] = useState({
        cpuOption: getOption('CPU Usage'),
        memOption: getOption('Memory Usage'),
        conOption: getConnOption(),
        netOption: getNetOption(),
        count: 0,
        lastInBytes: 0,
        lastOutBytes: 0,
    });

    const { cpuOption, memOption, conOption, netOption } = chartData;

    const fetchData = useCallback(() => {
        fetch('/api/server', {
            credentials: 'include',
        }).then(function (response) {
            return response.json();
        }).then((data) => {
            setChartData(
                ({ cpuOption, memOption, conOption, netOption, count, lastInBytes, lastOutBytes }) => {
                    const _cpuOption = { ...cpuOption };
                    const _memOption = { ...memOption };
                    const _conOption = { ...conOption };
                    const _netOption = { ...netOption };
                    const { inbytes, outbytes } = data.net;
                    const now = new Date();
                    const axisData = now.toLocaleTimeString().replace(/^\D*/, '');

                    if (count >= 30) {
                        _cpuOption.xAxis[0].data.shift();
                        _cpuOption.series[0].data.shift();

                        _memOption.xAxis[0].data.shift();
                        _memOption.series[0].data.shift();

                        _conOption.xAxis[0].data.shift();
                        _conOption.series[0].data.shift();
                        _conOption.series[1].data.shift();
                        _conOption.series[2].data.shift();

                        _netOption.xAxis[0].data.shift();
                        _netOption.xAxis[1].data.shift();
                        _netOption.series[0].data.shift();
                        _netOption.series[1].data.shift();
                    }

                    _cpuOption.uptime = now;
                    _cpuOption.xAxis[0].data.push(axisData);
                    _cpuOption.series[0].data.push(data.cpu.load);

                    _memOption.uptime = now;
                    _memOption.xAxis[0].data.push(axisData);
                    _memOption.series[0].data.push((
                        100 - 100 * data.mem.free / data.mem.totle
                    ).toFixed(2));

                    _conOption.uptime = now;
                    _conOption.title.text = 'Connections ' + (
                        data.clients.rtmp + data.clients.http + data.clients.ws
                    );
                    _conOption.xAxis[0].data.push(axisData);
                    _conOption.series[0].data.push(data.clients.rtmp);
                    _conOption.series[1].data.push(data.clients.http);
                    _conOption.series[2].data.push(data.clients.ws);

                    _netOption.uptime = now;
                    _netOption.xAxis[0].data.push(axisData);
                    _netOption.xAxis[1].data.push(axisData);
                    _netOption.series[0].data.push(
                        bytesToBand(
                            (
                                inbytes - lastInBytes
                            ) / 2,
                        ),
                    );
                    _netOption.series[1].data.push(
                        bytesToBand(
                            (
                                outbytes - lastOutBytes
                            ) / 2,
                        ),
                    );

                    return {
                        cpuOption: { ..._cpuOption },
                        memOption: { ..._memOption },
                        conOption: { ..._conOption },
                        netOption: { ..._netOption },
                        count: count + 1,
                        lastInBytes: data.net.inbytes,
                        lastOutBytes: data.net.outbytes,
                    };
                },
            );
        }).catch(e => console.warn(e));
    }, [setChartData]);

    useInterval(fetchData, 2000);

    return (
        <Row style={{ margin: '0 -12px' }} wrap>
            <Col
                span={12} style={{
                padding: '0 12px', marginTop: '16px', minWidth: '348px', maxWidth: '100%', flex: '1 1 50%',
            }}
            >
                <Card>
                    <ReactECharts
                        option={conOption}
                        style={{ height: '348px', width: '100%' }}
                    />
                </Card>

            </Col>
            <Col
                span={12} style={{
                padding: '0 12px', marginTop: '16px', minWidth: '348px', maxWidth: '100%', flex: '1 1 50%',
            }}
            >
                <Card>
                    <ReactECharts
                        option={netOption}
                        style={{ height: '348px', width: '100%' }}
                    />
                </Card>
            </Col>

            <Col
                span={12} style={{
                padding: '0 12px', marginTop: '16px', minWidth: '348px', maxWidth: '100%', flex: '1 1 50%',
            }}
            >
                <Card>
                    <ReactECharts
                        option={cpuOption}
                        style={{ height: '300px', width: '100%' }}
                    />
                </Card>
            </Col>
            <Col
                span={12} style={{
                padding: '0 12px', marginTop: '16px', minWidth: '348px', maxWidth: '100%', flex: '1 1 50%',
            }}
            >
                <Card>
                    <ReactECharts
                        option={memOption}
                        style={{ height: '300px', width: '100%' }}
                    />
                </Card>
            </Col>
        </Row>
    );
};

export default Dashboard;
