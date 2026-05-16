import { PlayCircleOutlined, StopOutlined } from '@ant-design/icons';
import { Button, Card, Col, Flex, Skeleton, Space, Tag } from 'antd';
import React from 'react';
import { ServerStatus } from '../../api/types';
import { useTranslation } from '../../context/LanguageContext';

export type ServerComponentKey = 'rtmp' | 'av' | 'trans' | 'relay' | 'fission' | 'switch' | 'static';

interface ServiceControlProps {
    componentKey: keyof ServerStatus;
    serverStatus: ServerStatus | null;
    loading: boolean;
    onAction: (server: ServerComponentKey, action: 'start' | 'stop') => void;
}

const ServiceControl: React.FC<ServiceControlProps> = ({ componentKey, serverStatus, loading, onAction }) => {
    const { t } = useTranslation();
    const isRunning = serverStatus?.[componentKey]?.running;
    const initialLoading = loading && !serverStatus;

    return (
        <Col xs={24} sm={12} md={8} lg={4} key={componentKey}>
            <Card size="small" title={t(`component_${componentKey}`)} style={{ marginBottom: 16 }}>
                {initialLoading ? (
                    <Skeleton active paragraph={{ rows: 1 }} />
                ) : (
                    <Flex justify="space-between" align="center" wrap>
                        <Tag color={isRunning ? 'success' : 'error'}>
                            {isRunning ? t('running') : t('stopped')}
                        </Tag>
                        <Space style={{ gap: 8 }}>
                            <Button
                                type="primary"
                                icon={<PlayCircleOutlined />}
                                disabled={isRunning || loading}
                                onClick={() => onAction(componentKey as ServerComponentKey, 'start')}
                                size="small"
                            />
                            <Button
                                danger
                                icon={<StopOutlined />}
                                disabled={!isRunning || loading}
                                onClick={() => onAction(componentKey as ServerComponentKey, 'stop')}
                                size="small"
                            />
                        </Space>
                    </Flex>
                )}
            </Card>
        </Col>
    );
};

export default ServiceControl;
