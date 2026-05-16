import { App } from 'antd';
import { useCallback } from 'react';
import { api } from '../../api/service';
import { useTranslation } from '../../context/LanguageContext';

export type BasicTaskType = 'relay' | 'trans' | 'fission';

interface UseTaskActionsArgs {
    refetchRelay: () => void;
    refetchTrans: () => void;
    refetchFission: () => void;
}

export const useTaskActions = ({ refetchRelay, refetchTrans, refetchFission }: UseTaskActionsArgs) => {
    const { message } = App.useApp();
    const { t } = useTranslation();

    const refetchFor = useCallback((type: BasicTaskType) => {
        if (type === 'relay') refetchRelay();
        else if (type === 'trans') refetchTrans();
        else if (type === 'fission') refetchFission();
    }, [refetchRelay, refetchTrans, refetchFission]);

    const handleRestart = useCallback(async (type: BasicTaskType, id: string) => {
        try {
            if (type === 'relay') await api.restartRelayTask(id);
            else if (type === 'trans') await api.restartTransTask(id);
            else if (type === 'fission') await api.restartFissionTask(id);
            refetchFor(type);
            message.success(t('task_restarted'));
        } catch (e: any) {
            message.error(`${t('task_restart_failed')}: ${e.message}`);
        }
    }, [refetchFor, message, t]);

    const handleStart = useCallback(async (type: BasicTaskType, id: string) => {
        try {
            if (type === 'relay') await api.startRelayTask(id);
            else if (type === 'trans') await api.startTransTask(id);
            else if (type === 'fission') await api.startFissionTask(id);
            refetchFor(type);
            message.success(t('task_started'));
        } catch (e: any) {
            message.error(`${t('task_start_failed')}: ${e.message}`);
        }
    }, [refetchFor, message, t]);

    const handleDelete = useCallback(async (type: BasicTaskType, id: string) => {
        try {
            if (type === 'relay') await api.deleteRelayTask(id);
            else if (type === 'trans') await api.deleteTransTask(id);
            else if (type === 'fission') await api.deleteFissionTask(id);
            refetchFor(type);
            message.success(t('task_deleted'));
        } catch (e: any) {
            message.error(`${t('task_delete_failed')}: ${e.message}`);
        }
    }, [refetchFor, message, t]);

    return { handleStart, handleRestart, handleDelete };
};
