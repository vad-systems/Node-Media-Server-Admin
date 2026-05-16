import { LockOutlined } from '@ant-design/icons';
import { Card, Col, Flex, Form, Input, Row, Switch } from 'antd';
import React from 'react';
import { useTranslation } from '../../context/LanguageContext';

const AuthConfigCard: React.FC = () => {
    const { t } = useTranslation();
    return (
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
    );
};

export default AuthConfigCard;
