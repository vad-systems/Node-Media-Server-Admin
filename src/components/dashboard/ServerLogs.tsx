import { ClearOutlined, FileTextOutlined, PauseCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { Badge, Button, Card, Col, Flex, theme, Tooltip } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { api } from '../../api/service';
import { useTranslation } from '../../context/LanguageContext';

const MAX_LINES = 500;

type ConnState = 'connecting' | 'open' | 'closed';

const ServerLogs: React.FC<{ height?: string }> = ({ height = '300px' }) => {
    const { t } = useTranslation();
    const { token } = theme.useToken();
    const [lines, setLines] = useState<string[]>([]);
    const [paused, setPaused] = useState(false);
    const [autoScroll, setAutoScroll] = useState(true);
    const [connState, setConnState] = useState<ConnState>('connecting');
    const pausedRef = useRef(paused);
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const autoScrollRef = useRef(autoScroll);

    useEffect(() => { pausedRef.current = paused; }, [paused]);
    useEffect(() => { autoScrollRef.current = autoScroll; }, [autoScroll]);

    useEffect(() => {
        const url = api.getServerLogsUrl();
        const es = new EventSource(url, { withCredentials: true });
        setConnState('connecting');

        es.onopen = () => setConnState('open');
        es.onerror = () => setConnState('closed');
        es.onmessage = (ev) => {
            if (pausedRef.current) return;
            setLines((prev) => {
                const next = prev.concat(String(ev.data));
                return next.length > MAX_LINES ? next.slice(next.length - MAX_LINES) : next;
            });
        };

        return () => es.close();
    }, []);

    useEffect(() => {
        if (autoScrollRef.current && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [lines]);

    const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const el = e.currentTarget;
        const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 8;
        if (atBottom !== autoScroll) setAutoScroll(atBottom);
    };

    const statusBadge = (() => {
        if (connState === 'open') return <Badge status="success" text={t('logs_connected')} />;
        if (connState === 'connecting') return <Badge status="processing" text={t('logs_connecting')} />;
        return <Badge status="error" text={t('logs_disconnected')} />;
    })();

    return (
        <Col span={24} style={{ padding: '0 12px', marginBottom: '16px' }}>
            <Card
                size="small"
                title={
                    <Flex align="center" gap="small">
                        <FileTextOutlined />
                        <span>{t('server_logs')}</span>
                        <span style={{ marginLeft: 8 }}>{statusBadge}</span>
                    </Flex>
                }
                extra={
                    <Flex gap="small">
                        <Tooltip title={paused ? t('resume') : t('pause')}>
                            <Button
                                size="small"
                                icon={paused ? <PlayCircleOutlined /> : <PauseCircleOutlined />}
                                onClick={() => setPaused((p) => !p)}
                            />
                        </Tooltip>
                        <Tooltip title={t('clear')}>
                            <Button
                                size="small"
                                icon={<ClearOutlined />}
                                onClick={() => setLines([])}
                            />
                        </Tooltip>
                    </Flex>
                }
                styles={{ body: { padding: 0 } }}
            >
                <div
                    ref={scrollRef}
                    onScroll={onScroll}
                    style={{
                        height,
                        overflow: 'auto',
                        padding: '8px 12px',
                        background: token.colorBgLayout,
                        fontFamily: 'Menlo, Consolas, "Courier New", monospace',
                        fontSize: 12,
                        lineHeight: 1.5,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-all',
                    }}
                >
                    {lines.length === 0
                        ? <span style={{ color: token.colorTextTertiary }}>{t('no_logs_yet')}</span>
                        : lines.map((l, i) => <div key={i}>{l}</div>)
                    }
                </div>
            </Card>
        </Col>
    );
};

export default ServerLogs;
