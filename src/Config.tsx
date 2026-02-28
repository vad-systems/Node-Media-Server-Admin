import { CloudUploadOutlined, InteractionOutlined, NodeIndexOutlined, PartitionOutlined, SettingOutlined, SaveOutlined } from '@ant-design/icons';
import { App, Card, Col, Flex, Row, Switch, Form, InputNumber, Input, Button, Skeleton } from 'antd';
import React, { useCallback, useEffect } from 'react';
import { api } from './api/service';
import { Config as ConfigType } from './api/types';
import { useFetch } from './hooks/useFetch';

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
                http_port: config.http.port,
                mediaroot: config.http.mediaroot,
                allow_origin: config.http.allow_origin,
                https_port: config.https.port,
                rtmp_port: config.rtmp?.port,
                rtmp_chunk_size: config.rtmp?.chunk_size,
                rtmp_gop_cache: config.rtmp?.gop_cache,
                rtmp_ping: config.rtmp?.ping,
                rtmp_ping_timeout: config.rtmp?.ping_timeout,
            });
        }
    }, [config, form]);

    const onFinish = useCallback(async (values: any) => {
        try {
            const patch: any = {
                http: {
                    port: values.http_port,
                    mediaroot: values.mediaroot,
                    allow_origin: values.allow_origin,
                },
                https: {
                    port: values.https_port,
                },
            };

            if (config?.rtmp) {
                patch.rtmp = {
                    port: values.rtmp_port,
                    chunk_size: values.rtmp_chunk_size,
                    gop_cache: values.rtmp_gop_cache,
                    ping: values.rtmp_ping,
                    ping_timeout: values.rtmp_ping_timeout,
                };
            }

            await api.updateConfig(patch);
            message.success('Configuration updated successfully');
            refetch();
        } catch (e: any) {
            message.error(`Update failed: ${e.message}`);
        }
    }, [api, message, config, refetch]);

    if (loading && !config) {
        return (
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Card title={<Skeleton.Button active size="small" />} extra={<Skeleton.Button active />}>
                        <Skeleton active paragraph={{ rows: 4 }} />
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card title={<Skeleton.Button active size="small" />}>
                        <Skeleton active paragraph={{ rows: 2 }} />
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card title={<Skeleton.Button active size="small" />}>
                        <Skeleton active paragraph={{ rows: 2 }} />
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card title={<Skeleton.Button active size="small" />}>
                        <Skeleton active paragraph={{ rows: 2 }} />
                    </Card>
                </Col>
            </Row>
        );
    }

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{}}
        >
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Card 
                        title={<Flex align="center" gap="small"><SettingOutlined /><span>HTTP/S Configuration</span></Flex>}
                        extra={<Button type="primary" icon={<SaveOutlined />} htmlType="submit">Save Changes</Button>}
                    >
                        <Row gutter={16}>
                            <Col xs={24} sm={12} md={8}>
                                <Form.Item name="http_port" label="HTTP Port">
                                    <InputNumber style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <Form.Item name="https_port" label="HTTPS Port">
                                    <InputNumber style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <Form.Item name="allow_origin" label="Allow Origin">
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item name="mediaroot" label="Media Root">
                                    <Input />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Card>
                </Col>

                {config?.rtmp && (
                    <Col span={24}>
                        <Card title={<Flex align="center" gap="small"><CloudUploadOutlined /><span>RTMP Configuration</span></Flex>}>
                            <Row gutter={16}>
                                <Col xs={24} sm={12} md={6}>
                                    <Form.Item name="rtmp_port" label="RTMP Port">
                                        <InputNumber style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={6}>
                                    <Form.Item name="rtmp_chunk_size" label="Chunk Size">
                                        <InputNumber style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={6}>
                                    <Form.Item name="rtmp_ping" label="Ping Interval">
                                        <InputNumber style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={6}>
                                    <Form.Item name="rtmp_ping_timeout" label="Ping Timeout">
                                        <InputNumber style={{ width: '100%' }} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={6}>
                                    <Form.Item name="rtmp_gop_cache" label="GOP Cache" valuePropName="checked">
                                        <Switch />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                )}

                <Col xs={24} md={8}>
                    <Card title={<Flex align="center" gap="small"><PartitionOutlined /><span>Transcoding</span></Flex>}>
                        <pre style={{ fontSize: '10px' }}>{JSON.stringify(config?.trans, null, 2)}</pre>
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card title={<Flex align="center" gap="small"><NodeIndexOutlined /><span>Relay</span></Flex>}>
                        <pre style={{ fontSize: '10px' }}>{JSON.stringify(config?.relay, null, 2)}</pre>
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card title={<Flex align="center" gap="small"><InteractionOutlined /><span>Fission</span></Flex>}>
                        <pre style={{ fontSize: '10px' }}>{JSON.stringify(config?.fission, null, 2)}</pre>
                    </Card>
                </Col>
            </Row>
        </Form>
    );
};

export default Config;
