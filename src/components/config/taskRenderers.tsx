import { Card, Col, Divider, Empty, Form, Input, InputNumber, Row, Select, Switch } from 'antd';
import React from 'react';

export const renderTransTask = (n: number, t: (k: string) => string) => (
    <Row gutter={12}>
        <Col xs={24} sm={12} md={6}>
            <Form.Item name={[n, 'app']} label={t('task_app')}><Input /></Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
            <Form.Item name={[n, 'pattern']} label={t('task_pattern')}><Input /></Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
            <Form.Item name={[n, 'rtmp']} label={t('task_rtmp')} valuePropName="checked"><Switch /></Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
            <Form.Item name={[n, 'rtmpApp']} label={t('task_rtmp_app')}><Input /></Form.Item>
        </Col>
        <Col xs={24} sm={12} md={4}>
            <Form.Item name={[n, 'mp4']} label={t('task_mp4')} valuePropName="checked"><Switch /></Form.Item>
        </Col>
        <Col xs={24} sm={12} md={20}>
            <Form.Item name={[n, 'mp4Flags']} label={t('task_mp4_flags')}><Input /></Form.Item>
        </Col>
        <Col xs={24} sm={12} md={4}>
            <Form.Item name={[n, 'hls']} label={t('task_hls')} valuePropName="checked"><Switch /></Form.Item>
        </Col>
        <Col xs={24} sm={12} md={16}>
            <Form.Item name={[n, 'hlsFlags']} label={t('task_hls_flags')}><Input /></Form.Item>
        </Col>
        <Col xs={24} sm={12} md={4}>
            <Form.Item name={[n, 'hlsKeep']} label={t('task_hls_keep')} valuePropName="checked"><Switch /></Form.Item>
        </Col>
        <Col xs={24} sm={12} md={4}>
            <Form.Item name={[n, 'dash']} label={t('task_dash')} valuePropName="checked"><Switch /></Form.Item>
        </Col>
        <Col xs={24} sm={12} md={16}>
            <Form.Item name={[n, 'dashFlags']} label={t('task_dash_flags')}><Input /></Form.Item>
        </Col>
        <Col xs={24} sm={12} md={4}>
            <Form.Item name={[n, 'dashKeep']} label={t('task_dash_keep')} valuePropName="checked"><Switch /></Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
            <Form.Item name={[n, 'vc']} label={t('task_vc')}><Input /></Form.Item>
        </Col>
        <Col xs={24} sm={12} md={18}>
            <Form.Item name={[n, 'vcParam']} label={t('task_vc_param')}>
                <Select mode="tags" tokenSeparators={[' ']} />
            </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
            <Form.Item name={[n, 'ac']} label={t('task_ac')}><Input /></Form.Item>
        </Col>
        <Col xs={24} sm={12} md={18}>
            <Form.Item name={[n, 'acParam']} label={t('task_ac_param')}>
                <Select mode="tags" tokenSeparators={[' ']} />
            </Form.Item>
        </Col>
    </Row>
);

export const renderRelayTask = (n: number, t: (k: string) => string) => (
    <Row gutter={12}>
        <Col xs={24} sm={12} md={6}>
            <Form.Item name={[n, 'mode']} label={t('task_mode')}>
                <Select options={[
                    { value: 'push', label: 'push' },
                    { value: 'pull', label: 'pull' },
                ]} />
            </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
            <Form.Item name={[n, 'app']} label={t('task_app')}><Input /></Form.Item>
        </Col>
        <Col xs={24} sm={12} md={12}>
            <Form.Item name={[n, 'pattern']} label={t('task_pattern')}><Input /></Form.Item>
        </Col>
        <Col xs={24}>
            <Form.Item name={[n, 'edge']} label={t('task_edge')}><Input /></Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
            <Form.Item name={[n, 'rescale']} label={t('task_rescale')}><Input /></Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
            <Form.Item name={[n, 'rtsp_transport']} label={t('task_rtsp_transport')}>
                <Select allowClear options={[
                    { value: 'udp', label: 'udp' },
                    { value: 'tcp', label: 'tcp' },
                    { value: 'udp_multicast', label: 'udp_multicast' },
                    { value: 'http', label: 'http' },
                ]} />
            </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
            <Form.Item name={[n, 'appendName']} label={t('task_append_name')} valuePropName="checked"><Switch /></Form.Item>
        </Col>
    </Row>
);

export const renderFissionTask = (n: number, t: (k: string) => string) => (
    <>
        <Row gutter={12}>
            <Col xs={24} sm={12} md={8}>
                <Form.Item name={[n, 'app']} label={t('task_app')}><Input /></Form.Item>
            </Col>
            <Col xs={24} sm={12} md={16}>
                <Form.Item name={[n, 'pattern']} label={t('task_pattern')}><Input /></Form.Item>
            </Col>
        </Row>
        <Divider orientation="left" plain>{t('task_model')}</Divider>
        <Form.List name={[n, 'model']}>
            {(modelFields) => (
                <div>
                    {modelFields.length === 0 && (
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('no_tasks_configured')} style={{ margin: '4px 0' }} />
                    )}
                    {modelFields.map((mf, mi) => (
                        <Card key={mf.key} size="small" title={`${t('model_n')} #${mi + 1}`} style={{ marginBottom: 8 }}>
                            <Row gutter={12}>
                                <Col xs={12} md={6}>
                                    <Form.Item name={[mf.name, 'vb']} label={t('model_vb')}><Input /></Form.Item>
                                </Col>
                                <Col xs={12} md={6}>
                                    <Form.Item name={[mf.name, 'vs']} label={t('model_vs')}><Input /></Form.Item>
                                </Col>
                                <Col xs={12} md={6}>
                                    <Form.Item name={[mf.name, 'vf']} label={t('model_vf')}><Input /></Form.Item>
                                </Col>
                                <Col xs={12} md={6}>
                                    <Form.Item name={[mf.name, 'ab']} label={t('model_ab')}><Input /></Form.Item>
                                </Col>
                            </Row>
                        </Card>
                    ))}
                </div>
            )}
        </Form.List>
    </>
);

export const renderStaticTask = (n: number, t: (k: string) => string) => (
    <Row gutter={12}>
        <Col xs={24} sm={12} md={8}>
            <Form.Item name={[n, 'app']} label={t('task_app')}><Input /></Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
            <Form.Item name={[n, 'name']} label={t('task_name')}><Input /></Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
            <Form.Item name={[n, 'textPath']} label={t('task_text_path')}><Input /></Form.Item>
        </Col>
        <Col xs={24}>
            <Form.Item name={[n, 'input']} label={t('task_input')}><Input /></Form.Item>
        </Col>
    </Row>
);

export const renderSwitchTask = (n: number, t: (k: string) => string) => (
    <Row gutter={12}>
        <Col xs={24} sm={12} md={8}>
            <Form.Item name={[n, 'app']} label={t('task_app')}><Input /></Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
            <Form.Item name={[n, 'name']} label={t('task_name')}><Input /></Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
            <Form.Item name={[n, 'switchTimeout']} label={t('task_switch_timeout')}>
                <InputNumber style={{ width: '100%' }} />
            </Form.Item>
        </Col>
        <Col xs={24}>
            <Form.Item name={[n, 'sources']} label={t('task_sources')}>
                <Select mode="tags" tokenSeparators={[',', ' ']} />
            </Form.Item>
        </Col>
        <Col xs={24} sm={12}>
            <Form.Item name={[n, 'defaultSource']} label={t('task_default_source')}><Input /></Form.Item>
        </Col>
        <Col xs={24} sm={12}>
            <Form.Item name={[n, 'slatePath']} label={t('task_slate_path')}><Input /></Form.Item>
        </Col>
    </Row>
);
