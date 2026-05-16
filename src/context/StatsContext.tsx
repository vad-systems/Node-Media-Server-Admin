import React, { createContext, useContext, useEffect, useReducer, ReactNode, useRef, useCallback } from 'react';
import { DashboardState, dashboardReducer, initialState } from '../components/dashboard/reducer';
import { ServerInfo } from '../api/types';
import { api } from '../api/service';

interface StatsContextType {
    state: DashboardState;
    dispatch: React.Dispatch<any>;
    refresh: () => Promise<void>;
}

const StatsContext = createContext<StatsContextType | undefined>(undefined);

const POLL_FALLBACK_INTERVAL_MS = 2000;

export const StatsProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(dashboardReducer, initialState);
    const eventSourceRef = useRef<EventSource | null>(null);
    const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const fetchStats = useCallback(async () => {
        try {
            const stats = await api.getServerInfo();
            dispatch({ type: 'UPDATE_DATA', payload: stats as ServerInfo });
        } catch {
            // Silently fail as the server might be down temporarily.
        }
    }, []);

    const stopPolling = useCallback(() => {
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
        }
    }, []);

    const startPolling = useCallback(() => {
        if (pollIntervalRef.current) return;
        pollIntervalRef.current = setInterval(fetchStats, POLL_FALLBACK_INTERVAL_MS);
    }, [fetchStats]);

    useEffect(() => {
        let cancelled = false;
        let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

        const connectSSE = () => {
            if (cancelled) return;
            let es: EventSource;
            try {
                es = new EventSource(api.getServerInfoUrl(), { withCredentials: true });
            } catch {
                startPolling();
                return;
            }
            eventSourceRef.current = es;

            es.onopen = () => {
                // SSE is live; the polling fallback is no longer needed.
                stopPolling();
            };

            es.onmessage = (event) => {
                try {
                    const stats = JSON.parse(event.data);
                    dispatch({ type: 'UPDATE_DATA', payload: stats as ServerInfo });
                } catch (e) {
                    console.error('Failed to parse SSE stats:', e);
                }
            };

            es.onerror = () => {
                // Connection issue: fall back to polling so the UI keeps updating.
                startPolling();
                if (es.readyState === EventSource.CLOSED) {
                    eventSourceRef.current = null;
                    if (!cancelled) {
                        reconnectTimer = setTimeout(connectSSE, POLL_FALLBACK_INTERVAL_MS);
                    }
                }
            };
        };

        // Kick off with an immediate one-off fetch so the UI shows data ASAP,
        // then attach the SSE stream for live updates.
        fetchStats();
        connectSSE();

        return () => {
            cancelled = true;
            if (reconnectTimer) clearTimeout(reconnectTimer);
            stopPolling();
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
        };
    }, [fetchStats, startPolling, stopPolling]);

    return (
        <StatsContext.Provider value={{ state, dispatch, refresh: fetchStats }}>
            {children}
        </StatsContext.Provider>
    );
};

export const useStats = () => {
    const context = useContext(StatsContext);
    if (context === undefined) {
        throw new Error('useStats must be used within a StatsProvider');
    }
    return context;
};
