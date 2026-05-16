import {
    InteractionOutlined,
    NodeIndexOutlined,
    PartitionOutlined,
    SaveOutlined,
    SwapOutlined,
    PictureOutlined,
} from '@ant-design/icons';
import { Alert, App, Button, Card, Col, Form, Row, Skeleton, theme } from 'antd';
import React, { useCallback, useEffect } from 'react';
import { api } from './api/service';
import AuthConfigCard from './components/config/AuthConfigCard';
import HttpConfigCard from './components/config/HttpConfigCard';
import LoggingConfigCard from './components/config/LoggingConfigCard';
import RtmpConfigCard from './components/config/RtmpConfigCard';
import TaskSectionCard from './components/config/TaskSectionCard';
import {
    renderFissionTask,
    renderRelayTask,
    renderStaticTask,
    renderSwitchTask,
    renderTransTask,
} from './components/config/taskRenderers';
import { useTranslation } from './context/LanguageContext';
import { useFetch } from './hooks/useFetch';

const Config = () => {
    const { message } = App.useApp();
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const { token } = theme.useToken();

    const onError = useCallback(async (e: Error) => {
        await message.error(`${t('failed_fetch_config')}: ${e.message}`);
    }, [message, t]);

    const { data: config, loading, refetch } = useFetch(api.getConfig, {
        immediate: true,
        onError,
    });

    useEffect(() => {
        if (config) {
            form.setFieldsValue({
                http: config.http,
                https: config.https,
                rtmp: config.rtmp,
                auth: config.auth,
                trans: {
                    ffmpeg: config.trans?.ffmpeg,
                    tasks: config.trans?.tasks ?? [],
                },
                relay: {
                    ffmpeg: config.relay?.ffmpeg,
                    tasks: config.relay?.tasks ?? [],
                },
                fission: {
                    ffmpeg: config.fission?.ffmpeg,
                    tasks: config.fission?.tasks ?? [],
                },
                switch: {
                    tasks: config.switch?.tasks ?? [],
                },
                static: {
                    ffmpeg: config.static?.ffmpeg,
                    tasks: config.static?.tasks ?? [],
                },
                logType: config.logType,
                rollingLogLength: config.rollingLogLength,
            });
        }
    }, [config, form]);

    const onFinish = useCallback(async (values: any) => {
        try {
            const patch: any = {
                http: values.http,
                https: values.https,
                rtmp: values.rtmp,
                auth: values.auth,
                logType: values.logType,
                rollingLogLength: values.rollingLogLength,
            };

            if (values.trans) {
                patch.trans = {
                    ffmpeg: values.trans.ffmpeg,
                    tasks: values.trans.tasks ?? [],
                };
            }
            if (values.relay) {
                patch.relay = {
                    ffmpeg: values.relay.ffmpeg,
                    tasks: values.relay.tasks ?? [],
                };
            }
            if (values.fission) {
                patch.fission = {
                    ffmpeg: values.fission.ffmpeg,
                    tasks: values.fission.tasks ?? [],
                };
            }
            if (values.switch) {
                patch.switch = {
                    tasks: values.switch.tasks ?? [],
                };
            }
            if (values.static) {
                patch.static = {
                    ffmpeg: values.static.ffmpeg,
                    tasks: values.static.tasks ?? [],
                };
            }

            await api.updateConfig(patch);
            message.success(t('config_updated'));
            refetch();
        } catch (e: any) {
            message.error(`${t('config_failed')}: ${e.message}`);
        }
    }, [message, refetch, t]);

    if (loading && !config) {
        return (
            <Row gutter={[16, 16]}>
                {[1, 2, 3, 4, 5].map((i) => (
                    <Col span={24} key={i}>
                        <Card title={<Skeleton.Button active size="small" />} extra={i === 1 ? <Skeleton.Button active /> : null}>
                            <Skeleton active paragraph={{ rows: 3 }} />
                        </Card>
                    </Col>
                ))}
            </Row>
        );
    }

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{}}
            disabled
        >
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Alert
                        message={t('config_editing_disabled')}
                        description={t('config_editing_disabled_desc')}
                        type="warning"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                </Col>
                <Col span={24}><HttpConfigCard /></Col>
                <Col span={24}><RtmpConfigCard /></Col>
                <Col span={24}><AuthConfigCard /></Col>
                <Col span={24}>
                    <TaskSectionCard
                        icon={<PartitionOutlined />}
                        titleKey="component_trans"
                        sectionName="trans"
                        renderTask={renderTransTask}
                    />
                </Col>
                <Col span={24}>
                    <TaskSectionCard
                        icon={<NodeIndexOutlined />}
                        titleKey="component_relay"
                        sectionName="relay"
                        renderTask={renderRelayTask}
                    />
                </Col>
                <Col span={24}>
                    <TaskSectionCard
                        icon={<InteractionOutlined />}
                        titleKey="component_fission"
                        sectionName="fission"
                        renderTask={renderFissionTask}
                    />
                </Col>
                <Col span={24}>
                    <TaskSectionCard
                        icon={<SwapOutlined />}
                        titleKey="component_switch"
                        sectionName="switch"
                        renderTask={renderSwitchTask}
                        withFfmpeg={false}
                    />
                </Col>
                <Col span={24}>
                    <TaskSectionCard
                        icon={<PictureOutlined />}
                        titleKey="component_static"
                        sectionName="static"
                        renderTask={renderStaticTask}
                    />
                </Col>
                <Col span={24}><LoggingConfigCard /></Col>
            </Row>
            <div
                style={{
                    position: 'sticky',
                    bottom: 0,
                    marginTop: 16,
                    marginLeft: -16,
                    marginRight: -16,
                    marginBottom: -16,
                    padding: '12px 16px',
                    background: token.colorBgContainer,
                    borderTop: `1px solid ${token.colorBorderSecondary}`,
                    boxShadow: '0 -2px 8px rgba(0,0,0,0.06)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    zIndex: 10,
                }}
            >
                <Button type="primary" icon={<SaveOutlined />} htmlType="submit" disabled>
                    {t('save_changes')}
                </Button>
            </div>
        </Form>
    );
};

export default Config;
