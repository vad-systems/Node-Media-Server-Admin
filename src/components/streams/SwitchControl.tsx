import { SyncOutlined } from '@ant-design/icons';
import { App, Select, Space, Tag, Typography } from 'antd';
import React, { useCallback, useMemo } from 'react';
import { api } from '../../api/service';
import { SwitchTaskStatus } from '../../api/types';
import { useTranslation } from '../../context/LanguageContext';
import { useFetch } from '../../hooks/useFetch';

const { Text } = Typography;

type SwitchControlProps = {
    switchInfo: SwitchTaskStatus;
    onSwitched?: () => void;
};

const SwitchControl = ({ switchInfo: initialSwitchInfo, onSwitched }: SwitchControlProps) => {
    const { message } = App.useApp();
    const { t } = useTranslation();

    // Self-poll switch tasks so the displayed active source stays in sync after a switch.
    const { data: switchTasks, refetch: refetchSwitch } = useFetch(api.getSwitchTasks, {
        immediate: true,
        refreshInterval: 2000,
    });

    const switchInfo: SwitchTaskStatus = useMemo(() => {
        const fresh = switchTasks?.find(s => s.outputPath === initialSwitchInfo.outputPath);
        return fresh ?? initialSwitchInfo;
    }, [switchTasks, initialSwitchInfo]);

    const { data: streamsData } = useFetch(api.getStreams, {
        immediate: true,
        refreshInterval: 5000,
    });

    const allStreamPaths = useMemo(() => {
        if (!streamsData) return [];
        const paths: string[] = [];
        Object.entries(streamsData).forEach(([app, streams]) => {
            Object.keys(streams).forEach(name => {
                paths.push(`/${app}/${name}`);
            });
        });
        return Array.from(new Set(paths));
    }, [streamsData]);

    const handleTriggerSwitch = useCallback(async (source: string) => {
        const path = switchInfo.outputPath;
        try {
            await api.triggerSwitch({ path, source });
            message.success(t('switch_accepted').replace('{path}', path).replace('{source}', source));
            refetchSwitch();
            onSwitched?.();
        } catch (e: any) {
            message.error(`${t('switch_failed')}: ${e.message}`);
        }
    }, [switchInfo.outputPath, message, t, refetchSwitch, onSwitched]);

    const isExcluded = (p: string) => p === switchInfo.outputPath || p.startsWith(`${switchInfo.outputPath}/`);
    const filteredSources = switchInfo.sources.filter(p => !isExcluded(p));
    const filteredActive = allStreamPaths.filter(p => !switchInfo.sources.includes(p) && !isExcluded(p));

    return (
        <Space wrap style={{ marginTop: 8 }} size="small">
            <Text type="secondary">{t('active_source')}:</Text>
            <Tag color="blue">{switchInfo.activeSource || t('no_data')}</Tag>
            {switchInfo.isSwitching && <SyncOutlined spin />}
            {switchInfo.pendingSource && (
                <Tag color="orange">{t('pending')}: {switchInfo.pendingSource}</Tag>
            )}
            <Select
                placeholder={t('switch_to')}
                style={{ width: 240 }}
                size="small"
                showSearch
                value={switchInfo.activeSource || undefined}
                onChange={handleTriggerSwitch}
                disabled={switchInfo.isSwitching}
                listHeight={200}
                popupMatchSelectWidth={false}
                placement="topLeft"
            >
                <Select.OptGroup label={t('configured_sources')}>
                    {filteredSources.map(src => (
                        <Select.Option key={src} value={src}>{src}</Select.Option>
                    ))}
                </Select.OptGroup>
                <Select.OptGroup label={t('active_streams_select')}>
                    {filteredActive.map(src => (
                        <Select.Option key={src} value={src}>{src}</Select.Option>
                    ))}
                </Select.OptGroup>
            </Select>
        </Space>
    );
};

export default SwitchControl;
