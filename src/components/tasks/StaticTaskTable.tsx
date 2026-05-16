import { Skeleton, Table } from 'antd';
import React, { useMemo } from 'react';
import { SessionState, StaticTaskStatus } from '../../api/types';
import { useTranslation } from '../../context/LanguageContext';
import StateTag from '../StateTag';

interface StaticTaskTableProps {
    data: StaticTaskStatus[] | null | undefined;
    loading: boolean;
}

const StaticTaskTable: React.FC<StaticTaskTableProps> = ({ data, loading }) => {
    const { t } = useTranslation();

    const columns = useMemo(() => [
        { title: t('app'), dataIndex: 'app', key: 'app' },
        { title: t('stream_name'), dataIndex: 'name', key: 'name' },
        { title: t('stream_path'), dataIndex: 'streamPath', key: 'streamPath', ellipsis: true },
        {
            title: t('state'),
            dataIndex: 'state',
            key: 'state',
            render: (s: SessionState | undefined) => <StateTag kind="session" state={s} />,
        },
        { title: t('task_input'), dataIndex: 'input', key: 'input', ellipsis: true },
        {
            title: t('task_text_path'),
            dataIndex: 'textPath',
            key: 'textPath',
            ellipsis: true,
            render: (v: string | undefined) => v || '-',
        },
    ], [t]);

    if (loading && !data) {
        return <Skeleton active paragraph={{ rows: 5 }} />;
    }

    return (
        <Table
            dataSource={data || []}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={false}
            scroll={{ x: 'max-content' }}
        />
    );
};

export default StaticTaskTable;
