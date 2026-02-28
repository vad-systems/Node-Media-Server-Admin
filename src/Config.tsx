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
    ClusterOutlined
} from '@ant-design/icons';
import { App, Card, Col, Flex, Row, Switch, Form, InputNumber, Input, Button, Skeleton, Divider, Typography, Alert } from 'antd';
import React, { useCallback, useEffect } from 'react';
import { api } from './api/service';
import { Config as ConfigType } from './api/types';
import { useFetch } from './hooks/useFetch';

const { Text } = Typography;

const Config = () => {
    const { message } = App.useApp();
    const [form] = Form.useForm();

    const onError = useCallback(async (e: Error) => {
        await message.error(`Failed to fetch config: ${e.message}`);
    }, [message]);

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

            await api.updateConfig(patch);
            message.success('Configuration updated successfully');
            refetch();
        } catch (e: any) {
            message.error(`Update failed: ${e.message}`);
        }
    }, [api, message, refetch]);

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
                        message="Config Editing Disabled"
                        description="Direct configuration editing via the UI is currently disabled for security reasons and to address known bugs. Please use the server's configuration file for any changes."
                        type="warning"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                </Col>
                <Col span={24}>
                    <Card 
                        title={<Flex align="center" gap="small"><SettingOutlined /><span>HTTP/S Configuration</span></Flex>}
                        extra={<Button type="primary" icon={<SaveOutlined />} htmlType="submit" disabled>Save Changes</Button>}
                    >
                        <Row gutter={16}>
                            <Col xs={24} sm={12} md={6}>
                                <Form.Item name={['http', 'port']} label="HTTP Port">
                                    <InputNumber style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Form.Item name={['https', 'port']} label="HTTPS Port">
                                    <InputNumber style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Form.Item name={['http', 'allow_origin']} label="Allow Origin">
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Form.Item name={['http', 'api']} label="Enable API" valuePropName="checked">
                                    <Switch />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item name={['http', 'mediaroot']} label="Media Root">
                                    <Input />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>
                </Col>

                <Col span={24}>
                    <Card title={<Flex align="center" gap="small"><CloudUploadOutlined /><span>RTMP Configuration</span></Flex>}>
                        <Row gutter={16}>
                            <Col xs={24} sm={12} md={6}>
                                <Form.Item name={['rtmp', 'port']} label="RTMP Port">
                                    <InputNumber style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Form.Item name={['rtmp', 'chunk_size']} label="Chunk Size">
                                    <InputNumber style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Form.Item name={['rtmp', 'ping']} label="Ping Interval">
                                    <InputNumber style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Form.Item name={['rtmp', 'ping_timeout']} label="Ping Timeout">
                                    <InputNumber style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Form.Item name={['rtmp', 'gop_cache']} label="GOP Cache" valuePropName="checked">
                                    <Switch />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>
                </Col>

                <Col span={24}>
                    <Card title={<Flex align="center" gap="small"><LockOutlined /><span>Authentication</span></Flex>}>
                        <Row gutter={16}>
                            <Col xs={24} sm={12} md={4}>
                                <Form.Item name={['auth', 'api']} label="API Auth" valuePropName="checked">
                                    <Switch />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Form.Item name={['auth', 'api_user']} label="API User">
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Form.Item name={['auth', 'api_pass']} label="API Password">
                                    <Input.Password />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={4}>
                                <Form.Item name={['auth', 'play']} label="Play Auth" valuePropName="checked">
                                    <Switch />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={4}>
                                <Form.Item name={['auth', 'publish']} label="Publish Auth" valuePropName="checked">
                                    <Switch />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item name={['auth', 'secret']} label="Secret Key">
                                    <Input />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>
                </Col>

                <Col xs={24} md={8}>
                    <Card title={<Flex align="center" gap="small"><PartitionOutlined /><span>Transcoding</span></Flex>}>
                        <Form.Item name={['trans', 'ffmpeg']} label="FFmpeg Path">
                            <Input />
                        </Form.Item>
                        <Form.Item name={['trans', 'tasks']} label="Tasks (JSON)">
                            <Input.TextArea rows={10} style={{ fontFamily: 'monospace', fontSize: '11px' }} />
                        </Form.Item>
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card title={<Flex align="center" gap="small"><NodeIndexOutlined /><span>Relay</span></Flex>}>
                        <Form.Item name={['relay', 'ffmpeg']} label="FFmpeg Path">
                            <Input />
                        </Form.Item>
                        <Form.Item name={['relay', 'tasks']} label="Tasks (JSON)">
                            <Input.TextArea rows={10} style={{ fontFamily: 'monospace', fontSize: '11px' }} />
                        </Form.Item>
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card title={<Flex align="center" gap="small"><InteractionOutlined /><span>Fission</span></Flex>}>
                        <Form.Item name={['fission', 'ffmpeg']} label="FFmpeg Path">
                            <Input />
                        </Form.Item>
                        <Form.Item name={['fission', 'tasks']} label="Tasks (JSON)">
                            <Input.TextArea rows={10} style={{ fontFamily: 'monospace', fontSize: '11px' }} />
                        </Form.Item>
                    </Card>
                </Col>

                <Col span={24}>
                    <Card title={<Flex align="center" gap="small"><FileTextOutlined /><span>Logging</span></Flex>}>
                        <Row gutter={16}>
                            <Col xs={24} sm={12} md={6}>
                                <Form.Item name="logType" label="Log Type">
                                    <InputNumber style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Form.Item name="rollingLogLength" label="Rolling Log Length">
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
