import { FileTextOutlined } from '@ant-design/icons';
import { Card, Col, Flex, Form, InputNumber, Row } from 'antd';
import React from 'react';
import { useTranslation } from '../../context/LanguageContext';

const LoggingConfigCard: React.FC = () => {
    const { t } = useTranslation();
    return (
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
    );
};

export default LoggingConfigCard;
