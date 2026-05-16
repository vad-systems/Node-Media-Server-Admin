import { Card, Flex, Form, Input } from 'antd';
import React from 'react';
import { useTranslation } from '../../context/LanguageContext';
import TaskList from './TaskList';

interface TaskSectionCardProps {
    icon: React.ReactNode;
    titleKey: string;
    sectionName: string;
    renderTask: (fieldName: number, t: (key: string) => string) => React.ReactNode;
    /** When true, renders an `ffmpeg` field above the task list. */
    withFfmpeg?: boolean;
}

const TaskSectionCard: React.FC<TaskSectionCardProps> = ({ icon, titleKey, sectionName, renderTask, withFfmpeg = true }) => {
    const { t } = useTranslation();
    return (
        <Card title={<Flex align="center" gap="small">{icon}<span>{t(titleKey)}</span></Flex>}>
            {withFfmpeg && (
                <Form.Item name={[sectionName, 'ffmpeg']} label={t('ffmpeg_path')}>
                    <Input />
                </Form.Item>
            )}
            <TaskList name={[sectionName, 'tasks']} title={t('task_n')} renderTask={renderTask} />
        </Card>
    );
};

export default TaskSectionCard;
