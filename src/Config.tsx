import { 
    CloudUploadOutlined, 
    InteractionOutlined, 
    NodeIndexOutlined, 
    PartitionOutlined, 
    SettingOutlined, 
    SaveOutlined,
    LockOutlined,
    SafetyCertificateOutlined,
    FileTextOutlined,
    ClusterOutlined,
    SwapOutlined
} from '@ant-design/icons';
import { App, Card, Col, Flex, Row, Switch, Form, InputNumber, Input, Button, Skeleton, Divider, Typography, Alert } from 'antd';
import React, { useCallback, useEffect } from 'react';
import { api } from './api/service';
import { Config as ConfigType } from './api/types';
import { useTranslation } from './context/LanguageContext';
import { useFetch } from './hooks/useFetch';

const { Text } = Typography;

const Config = () => {
    const { message } = App.useApp();
    const { t } = useTranslation();
    const [form] = Form.useForm();

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
                    // keep tasks as JSON for now to keep the UI clean
                    tasks: JSON.stringify(config.trans?.tasks, null, 2),
                },
                relay: {
                    ffmpeg: config.relay?.ffmpeg,
                    tasks: JSON.stringify(config.relay?.tasks, null, 2),
                },
                fission: {
                    ffmpeg: config.fission?.ffmpeg,
                    tasks: JSON.stringify(config.fission?.tasks, null, 2),
                },
                switch: {
                    tasks: JSON.stringify(config.switch?.tasks, null, 2),
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
                    tasks: values.trans.tasks ? JSON.parse(values.trans.tasks) : [],
                };
            }
            if (values.relay) {
                patch.relay = {
                    ffmpeg: values.relay.ffmpeg,
                    tasks: values.relay.tasks ? JSON.parse(values.relay.tasks) : [],
                };
            }
            if (values.fission) {
                patch.fission = {
                    ffmpeg: values.fission.ffmpeg,
                    tasks: values.fission.tasks ? JSON.parse(values.fission.tasks) : [],
                };
            }
            if (values.switch) {
                patch.switch = {
                    tasks: values.switch.tasks ? JSON.parse(values.switch.tasks) : [],
                };
            }

            await api.updateConfig(patch);
            message.success(t('config_updated'));
            refetch();
        } catch (e: any) {
            message.error(`${t('config_failed')}: ${e.message}`);
        }
    }, [api, message, refetch, t]);

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
                <Col span={24}>
                    <Card 
                        title={<Flex align="center" gap="small"><SettingOutlined /><span>{t('http_s_config')}</span></Flex>}
                        extra={<Button type="primary" icon={<SaveOutlined />} htmlType="submit" disabled>{t('save_changes')}</Button>}
                    >
                        <Row gutter={16}>
                            <Col xs={24} sm={12} md={6}>
                                <Form.Item name={['http', 'port']} label={t('port') + ' (HTTP)'}>
                                    <InputNumber style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Form.Item name={['https', 'port']} label={t('port') + ' (HTTPS)'}>
                                    <InputNumber style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Form.Item name={['http', 'allow_origin']} label={t('allow_origin')}>
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Form.Item name={['http', 'api']} label={t('enable_api')} valuePropName="checked">
                                    <Switch />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Form.Item name={['http', 'webroot']} label={t('web_root')}>
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item name={['http', 'mediaroot']} label={t('media_root')}>
                                    <Input />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Divider orientation="left">{t('https_config')}</Divider>
                        <Row gutter={16}>
                            <Col xs={24} sm={12} md={8}>
                                <Form.Item name={['https', 'key']} label={t('ssl_key_path')}>
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <Form.Item name={['https', 'cert']} label={t('ssl_cert_path')}>
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <Form.Item name={['https', 'passphrase']} label={t('ssl_passphrase')}>
                                    <Input.Password />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>
                </Col>

                <Col span={24}>
                    <Card title={<Flex align="center" gap="small"><CloudUploadOutlined /><span>{t('rtmp_config')}</span></Flex>}>
                        <Row gutter={16}>
                            <Col xs={24} sm={12} md={6}>
                                <Form.Item name={['rtmp', 'port']} label={t('port')}>
                                    <InputNumber style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Form.Item name={['rtmp', 'chunk_size']} label={t('chunk_size')}>
                                    <InputNumber style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Form.Item name={['rtmp', 'ping']} label={t('ping_interval')}>
                                    <InputNumber style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Form.Item name={['rtmp', 'ping_timeout']} label={t('ping_timeout')}>
                                    <InputNumber style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Form.Item name={['rtmp', 'gop_cache']} label={t('gop_cache')} valuePropName="checked">
                                    <Switch />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Divider orientation="left">{t('rtmp_config')} SSL</Divider>
                        <Row gutter={16}>
                            <Col xs={24} sm={12} md={6}>
                                <Form.Item name={['rtmp', 'ssl', 'port']} label={t('ssl_port')}>
                                    <InputNumber style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={9}>
                                <Form.Item name={['rtmp', 'ssl', 'key']} label={t('ssl_key_path')}>
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={9}>
                                <Form.Item name={['rtmp', 'ssl', 'cert']} label={t('ssl_cert_path')}>
                                    <Input />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>
                </Col>

                <Col span={24}>
                    <Card title={<Flex align="center" gap="small"><LockOutlined /><span>{t('auth_config')}</span></Flex>}>
                        <Row gutter={16}>
                            <Col xs={24} sm={12} md={4}>
                                <Form.Item name={['auth', 'api']} label={t('api_auth')} valuePropName="checked">
                                    <Switch />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Form.Item name={['auth', 'api_user']} label={t('api_user')}>
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Form.Item name={['auth', 'api_pass']} label={t('api_pass')}>
                                    <Input.Password />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={4}>
                                <Form.Item name={['auth', 'play']} label={t('play_auth')} valuePropName="checked">
                                    <Switch />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={4}>
                                <Form.Item name={['auth', 'publish']} label={t('publish_auth')} valuePropName="checked">
                                    <Switch />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item name={['auth', 'secret']} label={t('secret_key')}>
                                    <Input />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>
                </Col>

                <Col xs={24} md={8}>
                    <Card title={<Flex align="center" gap="small"><PartitionOutlined /><span>{t('component_trans')}</span></Flex>}>
                        <Form.Item name={['trans', 'ffmpeg']} label={t('ffmpeg_path')}>
                            <Input />
                        </Form.Item>
                        <Form.Item name={['trans', 'tasks']} label={t('tasks_json')}>
                            <Input.TextArea rows={10} style={{ fontFamily: 'monospace', fontSize: '11px' }} />
                        </Form.Item>
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card title={<Flex align="center" gap="small"><NodeIndexOutlined /><span>{t('component_relay')}</span></Flex>}>
                        <Form.Item name={['relay', 'ffmpeg']} label={t('ffmpeg_path')}>
                            <Input />
                        </Form.Item>
                        <Form.Item name={['relay', 'tasks']} label={t('tasks_json')}>
                            <Input.TextArea rows={10} style={{ fontFamily: 'monospace', fontSize: '11px' }} />
                        </Form.Item>
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card title={<Flex align="center" gap="small"><InteractionOutlined /><span>{t('component_fission')}</span></Flex>}>
                        <Form.Item name={['fission', 'ffmpeg']} label={t('ffmpeg_path')}>
                            <Input />
                        </Form.Item>
                        <Form.Item name={['fission', 'tasks']} label={t('tasks_json')}>
                            <Input.TextArea rows={10} style={{ fontFamily: 'monospace', fontSize: '11px' }} />
                        </Form.Item>
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card title={<Flex align="center" gap="small"><SwapOutlined /><span>{t('component_switch')}</span></Flex>}>
                        <Form.Item name={['switch', 'tasks']} label={t('tasks_json')}>
                            <Input.TextArea rows={12} style={{ fontFamily: 'monospace', fontSize: '11px' }} />
                        </Form.Item>
                    </Card>
                </Col>

                <Col span={24}>
                    <Card title={<Flex align="center" gap="small"><FileTextOutlined /><span>{t('logging_config')}</span></Flex>}>
                        <Row gutter={16}>
                            <Col xs={24} sm={12} md={6}>
                                <Form.Item name="logType" label={t('log_type')}>
                                    <InputNumber style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Form.Item name="rollingLogLength" label={t('log_length')}>
                                    <InputNumber style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>
        </Form>
    );
};

export default Config;
