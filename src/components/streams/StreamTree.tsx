import { ApiOutlined, BranchesOutlined, CloudUploadOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons';
import { App, Empty, Skeleton, Tag, Tree } from 'antd';
import type { DataNode } from 'antd/es/tree';
import React, { useCallback, useMemo } from 'react';
import { api } from '../../api/service';
import { BroadcastTreeNode, SessionNode, StreamsTree } from '../../api/types';
import { useTranslation } from '../../context/LanguageContext';
import { useFetch } from '../../hooks/useFetch';
import StateTag from '../StateTag';

const sessionToNode = (
    session: SessionNode,
    keyPrefix: string,
    t: (k: string) => string,
): DataNode => ({
    key: `${keyPrefix}-${session.id}`,
    icon: <UserOutlined />,
    title: (
        <span>
            <span style={{ fontFamily: 'monospace' }}>{session.id}</span>
            <Tag style={{ marginLeft: 8 }}>{session.type}</Tag>
            <span style={{ marginLeft: 8 }}><StateTag kind="session" state={session.state} /></span>
        </span>
    ),
    children: session.children?.map((child, idx) =>
        sessionToNode(child, `${keyPrefix}-${session.id}-${idx}`, t),
    ),
});

const broadcastToNode = (
    broadcast: BroadcastTreeNode,
    t: (k: string) => string,
): DataNode => {
    const children: DataNode[] = [];
    if (broadcast.publisher) {
        children.push({
            key: `bcast-${broadcast.streamPath}-publisher`,
            icon: <CloudUploadOutlined />,
            title: <strong>{t('publisher')}</strong>,
            children: [sessionToNode(broadcast.publisher, `bcast-${broadcast.streamPath}-pub`, t)],
        });
    }
    const subs = broadcast.subscribers || [];
    children.push({
        key: `bcast-${broadcast.streamPath}-subscribers`,
        icon: <EyeOutlined />,
        title: <strong>{t('subscribers')} ({subs.length})</strong>,
        children: subs.map((s, idx) =>
            sessionToNode(s, `bcast-${broadcast.streamPath}-sub-${idx}`, t),
        ),
    });

    return {
        key: `bcast-${broadcast.streamPath}`,
        icon: <ApiOutlined />,
        title: (
            <span>
                <span style={{ fontFamily: 'monospace' }}>/{broadcast.streamPath}</span>
                <span style={{ marginLeft: 8 }}><StateTag kind="broadcast" state={broadcast.state} /></span>
            </span>
        ),
        children,
    };
};

const StreamTree = () => {
    const { message } = App.useApp();
    const { t } = useTranslation();

    const onError = useCallback(async (e: Error) => {
        await message.error(`${t('failed_fetch_tree')}: ${e.message}`);
    }, [message, t]);

    const { data, loading } = useFetch<StreamsTree>(api.getStreamsTree, {
        immediate: true,
        refreshInterval: 3000,
        onError,
    });

    const treeData = useMemo<DataNode[]>(() => {
        if (!data) return [];
        const broadcasts = data.broadcasts || [];
        const orphans = data.orphans || [];
        const nodes: DataNode[] = [];

        nodes.push({
            key: 'root-broadcasts',
            icon: <BranchesOutlined />,
            title: <strong>{t('broadcasts')} ({broadcasts.length})</strong>,
            children: broadcasts.map(b => broadcastToNode(b, t)),
        });

        nodes.push({
            key: 'root-orphans',
            icon: <UserOutlined />,
            title: <strong>{t('orphans')} ({orphans.length})</strong>,
            children: orphans.map((s, idx) => sessionToNode(s, `orphan-${idx}`, t)),
        });

        return nodes;
    }, [data, t]);

    if (loading && !data) {
        return <Skeleton active paragraph={{ rows: 6 }} />;
    }

    const isEmpty = !data || ((data.broadcasts || []).length === 0 && (data.orphans || []).length === 0);
    if (isEmpty) {
        return <Empty description={t('no_tree_data')} />;
    }

    return (
        <Tree
            showIcon
            showLine
            defaultExpandAll
            selectable={false}
            treeData={treeData}
        />
    );
};

export default StreamTree;
