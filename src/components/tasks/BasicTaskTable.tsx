import { Skeleton, Table, Tag } from 'antd';
import React, { useMemo } from 'react';
import { SessionState } from '../../api/types';
import { useTranslation } from '../../context/LanguageContext';
import secondsToDhms from '../../util/secondsToDhms';
import StateTag from '../StateTag';
import TaskActionsCell from './TaskActionsCell';
import { BasicTaskType } from './useTaskActions';

interface BasicTaskTableProps<T> {
    type: BasicTaskType;
    data: T[];
    loading: boolean;
    /** Extra "path-like" column key on the record, e.g. 'url' for relay, 'path' for trans/fission. */
    pathField: 'url' | 'path';
    /** Optional `mode` column (relay only). */
    showMode?: boolean;
    onStart: (type: BasicTaskType, id: string) => void;
    onRestart: (type: BasicTaskType, id: string) => void;
    onDelete: (type: BasicTaskType, id: string) => void;
}

function BasicTaskTable<T extends { id: string; state?: SessionState; ts: number }>(
    { type, data, loading, pathField, showMode, onStart, onRestart, onDelete }: BasicTaskTableProps<T>,
) {
    const { t } = useTranslation();

    const columns = useMemo(() => {
        const cols: any[] = [
            { title: t('app'), dataIndex: 'app', key: 'app' },
            { title: t('stream_name'), dataIndex: 'name', key: 'name' },
            {
                title: t('state'),
                dataIndex: 'state',
                key: 'state',
                render: (s: SessionState | undefined) => <StateTag kind="session" state={s} />,
            },
            { title: t(pathField), dataIndex: pathField, key: pathField, ellipsis: true },
        ];
        if (showMode) {
            cols.push({
                title: t('mode'),
                dataIndex: 'mode',
                key: 'mode',
                render: (m: string) => <Tag>{m}</Tag>,
            });
        }
        cols.push({
            title: t('uptime'),
            dataIndex: 'ts',
            key: 'ts',
            render: (ts: number) => secondsToDhms((Date.now() - ts) / 1000),
        });
        cols.push({
            title: t('actions'),
            key: 'action',
            render: (_: any, record: T) => (
                <TaskActionsCell
                    state={record.state}
                    onStart={() => onStart(type, record.id)}
                    onRestart={() => onRestart(type, record.id)}
                    onDelete={() => onDelete(type, record.id)}
                />
            ),
        });
        return cols;
    }, [t, pathField, showMode, type, onStart, onRestart, onDelete]);

    if (loading && data.length === 0) {
        return <Skeleton active paragraph={{ rows: 5 }} />;
    }

    return (
        <Table
            dataSource={data}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={false}
            scroll={{ x: 'max-content' }}
        />
    );
}

export default BasicTaskTable;
