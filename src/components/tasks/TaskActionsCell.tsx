import { DeleteOutlined, PlayCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { Button, Space } from 'antd';
import React from 'react';
import { SessionState } from '../../api/types';
import { useTranslation } from '../../context/LanguageContext';

interface TaskActionsCellProps {
    state: SessionState | undefined;
    onStart: () => void;
    onRestart: () => void;
    onDelete: () => void;
}

const TaskActionsCell: React.FC<TaskActionsCellProps> = ({ state, onStart, onRestart, onDelete }) => {
    const { t } = useTranslation();
    if (state === 'STOPPED') {
        return (
            <Space>
                <Button
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    onClick={onStart}
                    size="small"
                    title={t('start')}
                />
            </Space>
        );
    }
    return (
        <Space>
            <Button icon={<SyncOutlined />} onClick={onRestart} size="small" title={t('restart')} />
            <Button danger icon={<DeleteOutlined />} onClick={onDelete} size="small" />
        </Space>
    );
};

export default TaskActionsCell;
