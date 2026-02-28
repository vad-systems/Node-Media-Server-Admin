import { StreamStats } from '../../api/types';
import secondsToDhmsSimple from '../../util/secondsToDhmsSimple';
import { StreamData } from './types';

export function transformStreamsData(data: StreamStats): StreamData[] {
    const streamsData: StreamData[] = [];
    let index = 0;
    for (const app in data) {
        for (const name in data[app]) {
            const stream = data[app][name].publisher;
            const clients = data[app][name].subscribers || [];
            if (stream) {
                const now = new Date().getTime();
                const connected = new Date(stream.connectCreated).getTime();
                streamsData.push({
                    key: index++,
                    app,
                    name,
                    id: stream.clientId,
                    ip: stream.ip,
                    ac: stream.audio ? stream.audio.codec + ' ' + stream.audio.profile : '',
                    freq: stream.audio ? stream.audio.samplerate.toString() : '',
                    chan: stream.audio ? stream.audio.channels.toString() : '',
                    vc: stream.video ? stream.video.codec + ' ' + stream.video.profile : '',
                    size: stream.video ? stream.video.width + 'x' + stream.video.height : '',
                    fps: stream.video ? Math.floor(stream.video.fps).toString() : '',
                    time: secondsToDhmsSimple((
                        now - connected
                    ) / 1000),
                    clients: clients as any[],
                    clientCount: clients.length,
                });
            }
        }
    }
    return streamsData;
}
