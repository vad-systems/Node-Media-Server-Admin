import { ServerInfo } from '../../api/types';
import bytesToBand from '../../util/bytesToBand';
import { DashboardEChartsOption, getBaseOption, getConnOption, getNetOption } from './options';

export type DashboardState = {
    cpuOption: DashboardEChartsOption;
    memOption: DashboardEChartsOption;
    conOption: DashboardEChartsOption;
    netOption: DashboardEChartsOption;
    count: number;
    lastInBytes: number;
    lastOutBytes: number;
    lastSampleAt: number;
};

export const initialState: DashboardState = {
    cpuOption: getBaseOption('CPU Usage'),
    memOption: getBaseOption('Memory Usage'),
    conOption: getConnOption(),
    netOption: getNetOption(),
    count: 0,
    lastInBytes: 0,
    lastOutBytes: 0,
    lastSampleAt: 0,
};

export type DashboardAction = 
    | { type: 'UPDATE_DATA'; payload: ServerInfo }
    | { type: 'RESET' };

export function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
    switch (action.type) {
        case 'UPDATE_DATA': {
            const data = action.payload;
            const { count, lastInBytes, lastOutBytes, lastSampleAt } = state;

            // Deep clone options to avoid mutation issues with ECharts
            const _cpuOption = JSON.parse(JSON.stringify(state.cpuOption));
            const _memOption = JSON.parse(JSON.stringify(state.memOption));
            const _conOption = JSON.parse(JSON.stringify(state.conOption));
            const _netOption = JSON.parse(JSON.stringify(state.netOption));

            const { inbytes, outbytes } = data.net;
            const now = new Date();
            const nowMs = now.getTime();
            const axisData = now.toLocaleTimeString().replace(/^\D*/, '');

            // Compute elapsed seconds between samples; fall back to a sane default on the
            // first sample or when the tab was inactive long enough that the byte counters
            // may have wrapped/reset on the server, which would otherwise produce huge spikes.
            const elapsedMs = lastSampleAt > 0 ? nowMs - lastSampleAt : 0;
            const elapsedSec = elapsedMs > 0 ? elapsedMs / 1000 : 0;
            const hasValidDelta = lastSampleAt > 0
                && elapsedSec > 0
                && elapsedSec <= 60
                && inbytes >= lastInBytes
                && outbytes >= lastOutBytes;
            const inRate = hasValidDelta ? (inbytes - lastInBytes) / elapsedSec : 0;
            const outRate = hasValidDelta ? (outbytes - lastOutBytes) / elapsedSec : 0;

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
                100 - 100 * data.mem.free / data.mem.total
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
            _netOption.series[0].data.push(bytesToBand(inRate));
            _netOption.series[1].data.push(bytesToBand(outRate));

            return {
                cpuOption: _cpuOption,
                memOption: _memOption,
                conOption: _conOption,
                netOption: _netOption,
                count: count + 1,
                lastInBytes: data.net.inbytes,
                lastOutBytes: data.net.outbytes,
                lastSampleAt: nowMs,
            };
        }
        case 'RESET':
            return initialState;
        default:
            return state;
    }
}
