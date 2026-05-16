import { ClearOutlined, DownCircleOutlined, FileTextOutlined, PauseCircleOutlined, PlayCircleOutlined, SearchOutlined, VerticalAlignBottomOutlined } from '@ant-design/icons';
import { Badge, Button, Card, Col, Flex, Input, theme, Tooltip } from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../../api/service';
import { useTranslation } from '../../context/LanguageContext';

const MAX_LINES = 500;

type ConnState = 'connecting' | 'open' | 'closed';

type ServerLogsProps = { height?: string } & Omit<React.ComponentProps<typeof Col>, 'children'>;

const ServerLogs: React.FC<ServerLogsProps> = ({ height = '300px', ...colProps }) => {
    const { t } = useTranslation();
    const { token } = theme.useToken();
    const [lines, setLines] = useState<string[]>([]);
    const [paused, setPaused] = useState(false);
    const [autoScroll, setAutoScroll] = useState(true);
    const [connState, setConnState] = useState<ConnState>('connecting');
    const [filter, setFilter] = useState('');
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

    const filteredLines = useMemo(() => {
        const q = filter.trim().toLowerCase();
        if (!q) return lines;
        return lines.filter(l => l.toLowerCase().includes(q));
    }, [lines, filter]);

    useEffect(() => {
        if (autoScrollRef.current && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [filteredLines]);

    // Parse format: "<date> <pid> [<level>] [<logger>] <rest>"
    // <date> may contain spaces (e.g. "2024-01-02 10:11:12.345"), so we anchor on the
    // first "[LEVEL]" occurrence to split the prefix into date + pid.
    const LEVEL_COLORS: Record<string, string> = {
        ERROR: '#ff4d4f',
        WARN: '#faad14',
        INFO: '#52c41a',
        DEBUG: '#1890ff',
        FFDEBUG: '#722ed1',
    };
    const LOG_RE = /^(.*?)\s+(\S+)\s+\[(ERROR|WARN|INFO|DEBUG|FFDEBUG)\]\s+\[([^\]]+)\]\s?(.*)$/;
    const renderLogLine = (line: string, idx: number) => {
        const m = LOG_RE.exec(line);
        if (!m) {
            return <div key={idx} className="nms-log-line">{line}</div>;
        }
        const [, date, pid, level, logger, rest] = m;
        const levelColor = LEVEL_COLORS[level] || token.colorText;
        return (
            <div key={idx} className="nms-log-line">
                <span style={{ color: token.colorTextTertiary }}>{date}</span>
                {' '}
                <span style={{ color: token.colorTextQuaternary }}>{pid}</span>
                {' '}
                <span style={{ color: levelColor, fontWeight: 600 }}>[{level}]</span>
                {' '}
                <span style={{ color: token.colorPrimary }}>[{logger}]</span>
                {rest ? ' ' : ''}
                <span>{rest}</span>
            </div>
        );
    };

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    };

    const statusBadge = (() => {
        if (connState === 'open') return <Badge status="success" text={t('logs_connected')} />;
        if (connState === 'connecting') return <Badge status="processing" text={t('logs_connecting')} />;
        return <Badge status="error" text={t('logs_disconnected')} />;
    })();

    return (
        <Col span={24} {...colProps} style={{ padding: '0 12px', marginBottom: '16px', ...(colProps.style || {}) }}>
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
                    <Flex gap="small" align="center">
                        <Input
                            size="small"
                            allowClear
                            prefix={<SearchOutlined style={{ color: 'rgba(0,0,0,.35)' }} />}
                            placeholder={t('filter_logs')}
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                            style={{ width: 200 }}
                        />
                        <Tooltip title={autoScroll ? t('autoscroll_on') : t('autoscroll_off')}>
                            <Button
                                size="small"
                                type={autoScroll ? 'primary' : 'default'}
                                icon={<DownCircleOutlined />}
                                onClick={() => setAutoScroll((v) => !v)}
                            />
                        </Tooltip>
                        <Tooltip title={t('scroll_to_bottom')}>
                            <Button
                                size="small"
                                icon={<VerticalAlignBottomOutlined />}
                                onClick={scrollToBottom}
                            />
                        </Tooltip>
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
                        : filteredLines.length === 0
                            ? <span style={{ color: token.colorTextTertiary }}>{t('no_logs_match')}</span>
                            : filteredLines.map((l, i) => renderLogLine(l, i))
                    }
                </div>
            </Card>
        </Col>
    );
};

export default ServerLogs;
