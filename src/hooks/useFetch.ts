import { useCallback, useEffect, useState } from 'react';
import { useInterval } from 'usehooks-ts';

export interface UseFetchOptions<T> {
    refreshInterval?: number | null;
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    immediate?: boolean;
    enabled?: boolean;
}

export function useFetch<T>(
    fetchFn: () => Promise<T>,
    options: UseFetchOptions<T> = {}
) {
    const { refreshInterval = null, onSuccess, onError, immediate = false, enabled = true } = options;
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(immediate && enabled);
    const [error, setError] = useState<Error | null>(null);

    const execute = useCallback(() => {
        if (!enabled) return Promise.resolve(null as unknown as T);
        return fetchFn()
            .then((res) => {
                setData(res);
                if (onSuccess) {
                    onSuccess(res);
                }
                setError(null);
                return res;
            })
            .catch((err) => {
                const error = err instanceof Error ? err : new Error(String(err));
                setError(error);
                if (onError) {
                    onError(error);
                }
                throw error;
            })
            .finally(() => {
                setLoading(false);
            });
    }, [fetchFn, onSuccess, onError, enabled]);

    useEffect(() => {
        if (immediate && enabled) {
            setLoading(true);
            execute().catch(() => {});
        }
    }, [execute, immediate, enabled]);

    useInterval(() => {
        if (enabled) {
            execute().catch(() => {});
        }
    }, refreshInterval);

    return { data, setData, loading, error, refetch: execute };
}
