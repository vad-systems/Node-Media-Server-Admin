import { CloudUploadOutlined } from '@ant-design/icons';
import { Card, Col, Divider, Flex, Form, Input, InputNumber, Row, Switch } from 'antd';
import React from 'react';
import { useTranslation } from '../../context/LanguageContext';

const RtmpConfigCard: React.FC = () => {
    const { t } = useTranslation();
    return (
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
    );
};

export default RtmpConfigCard;
