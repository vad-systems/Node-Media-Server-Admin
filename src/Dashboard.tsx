import { SettingOutlined } from '@ant-design/icons';
import { Row, Col, Button, Card, Flex, Checkbox, Popover } from 'antd';
import React, { useCallback, useMemo, useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import DashboardChart from './components/dashboard/DashboardChart';
import ServerLogs from './components/dashboard/ServerLogs';
import { useStats } from './context/StatsContext';
import { useTranslation } from './context/LanguageContext';

const DEFAULT_ORDER = ['con', 'net', 'cpu', 'mem', 'logs'];

const Dashboard = () => {
    const { state } = useStats();
    const { t } = useTranslation();
    const { conOption, netOption, cpuOption, memOption } = state;
    const [visibleCharts, setVisibleCharts] = useLocalStorage<string[]>('nms.admin.dashboard.visible', DEFAULT_ORDER);
    const [panelOrder, setPanelOrder] = useLocalStorage<string[]>('nms.admin.dashboard.order', DEFAULT_ORDER);
    const [dragKey, setDragKey] = useState<string | null>(null);
    const [overKey, setOverKey] = useState<string | null>(null);

    // Ensure persisted order stays in sync with the known panel set (filter unknowns, append new ones).
    const orderedKeys = useMemo(() => {
        const seen = new Set<string>();
        const merged: string[] = [];
        for (const k of panelOrder) {
            if (DEFAULT_ORDER.includes(k) && !seen.has(k)) {
                merged.push(k);
                seen.add(k);
            }
        }
        for (const k of DEFAULT_ORDER) if (!seen.has(k)) merged.push(k);
        return merged;
    }, [panelOrder]);

    const chartOptions = [
        { label: t('connections'), value: 'con' },
        { label: t('network'), value: 'net' },
        { label: t('cpu'), value: 'cpu' },
        { label: t('mem'), value: 'mem' },
        { label: t('server_logs'), value: 'logs' },
    ];

    const settingsContent = (
        <Checkbox.Group
            options={chartOptions}
            value={visibleCharts}
            onChange={(checkedValues) => setVisibleCharts(checkedValues as string[])}
            style={{ display: 'flex', flexDirection: 'column' }}
        />
    );

    const handleDragStart = useCallback((key: string) => (e: React.DragEvent) => {
        setDragKey(key);
        e.dataTransfer.effectAllowed = 'move';
        try { e.dataTransfer.setData('text/plain', key); } catch { /* ignored */ }
    }, []);

    const handleDragOver = useCallback((key: string) => (e: React.DragEvent) => {
        if (!dragKey) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (overKey !== key) setOverKey(key);
    }, [dragKey, overKey]);

    const handleDrop = useCallback((key: string) => (e: React.DragEvent) => {
        e.preventDefault();
        const src = dragKey;
        setDragKey(null);
        setOverKey(null);
        if (!src || src === key) return;
        const next = [...orderedKeys];
        const from = next.indexOf(src);
        const to = next.indexOf(key);
        if (from < 0 || to < 0) return;
        next.splice(from, 1);
        next.splice(to, 0, src);
        setPanelOrder(next);
    }, [dragKey, orderedKeys, setPanelOrder]);

    const handleDragEnd = useCallback(() => {
        setDragKey(null);
        setOverKey(null);
    }, []);

    const renderPanel = (key: string) => {
        if (!visibleCharts.includes(key)) return null;
        let node: React.ReactElement | null = null;
        switch (key) {
            case 'con': node = <DashboardChart option={conOption} height="348px" />; break;
            case 'net': node = <DashboardChart option={netOption} height="348px" />; break;
            case 'cpu': node = <DashboardChart option={cpuOption} height="300px" />; break;
            case 'mem': node = <DashboardChart option={memOption} height="300px" />; break;
            case 'logs': node = <ServerLogs height="300px" />; break;
            default: return null;
        }
        if (!node) return null;
        const isDragging = dragKey === key;
        const isOver = !!overKey && overKey === key && !!dragKey && dragKey !== key;
        // The panel components each return a <Col>; we clone it to attach drag handlers and a
        // visual highlight without changing their internal layout.
        const existingProps = (node.props as any) || {};
        return React.cloneElement(node as React.ReactElement<any>, {
            key,
            draggable: true,
            onDragStart: handleDragStart(key),
            onDragOver: handleDragOver(key),
            onDrop: handleDrop(key),
            onDragEnd: handleDragEnd,
            style: {
                ...(existingProps.style || {}),
                opacity: isDragging ? 0.4 : 1,
                outline: isOver ? '2px dashed #1890ff' : undefined,
                outlineOffset: isOver ? -4 : undefined,
                cursor: 'grab',
                transition: 'opacity 0.15s',
            },
        });
    };

    return (
        <Row style={{ margin: '0 -12px' }} wrap>
            <Col span={24} style={{ padding: '0 12px', marginBottom: '16px' }}>
                <Card size="small">
                    <Flex justify="space-between" align="center">
                        <span style={{ fontWeight: 'bold' }}>{t('overview')}</span>
                        <Popover content={settingsContent} title={t('visible_widgets')} trigger="click" placement="bottomRight">
                            <Button icon={<SettingOutlined />} />
                        </Popover>
                    </Flex>
                </Card>
            </Col>
            {orderedKeys.map(renderPanel)}
        </Row>
    );
};

export default Dashboard;
