import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Empty, Form, Popconfirm, Space } from 'antd';
import React from 'react';
import { useTranslation } from '../../context/LanguageContext';

interface TaskListProps {
    name: (string | number)[];
    title: string;
    renderTask: (fieldName: number, t: (key: string) => string) => React.ReactNode;
}

const TaskList: React.FC<TaskListProps> = ({ name, title, renderTask }) => {
    const { t } = useTranslation();
    return (
        <Form.List name={name}>
            {(fields, { add, remove }) => (
                <div>
                    {fields.length === 0 && (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={t('no_tasks_configured')}
                            style={{ margin: '8px 0' }}
                        />
                    )}
                    {fields.map((field, idx) => (
                        <Card
                            key={field.key}
                            size="small"
                            type="inner"
                            title={`${title} #${idx + 1}`}
                            extra={
                                <Popconfirm
                                    title={t('confirm_remove_task')}
                                    onConfirm={() => remove(field.name)}
                                    okText={t('yes')}
                                    cancelText={t('no')}
                                    disabled
                                >
                                    <Button
                                        type="text"
                                        size="small"
                                        danger
                                        icon={<DeleteOutlined />}
                                        disabled
                                    >
                                        {t('remove')}
                                    </Button>
                                </Popconfirm>
                            }
                            style={{ marginBottom: 12 }}
                        >
                            {renderTask(field.name, t)}
                        </Card>
                    ))}
                    <Space style={{ marginTop: 8 }}>
                        <Button
                            type="dashed"
                            icon={<PlusOutlined />}
                            onClick={() => add({})}
                            disabled
                        >
                            {t('add_task')}
                        </Button>
                    </Space>
                </div>
            )}
        </Form.List>
    );
};

export default TaskList;
