import { SettingOutlined } from '@ant-design/icons';
import { Card, Col, Divider, Flex, Form, Input, InputNumber, Row, Switch } from 'antd';
import React from 'react';
import { useTranslation } from '../../context/LanguageContext';

const HttpConfigCard: React.FC = () => {
    const { t } = useTranslation();
    return (
        <Card
            title={<Flex align="center" gap="small"><SettingOutlined /><span>{t('http_s_config')}</span></Flex>}
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
    );
};

export default HttpConfigCard;
