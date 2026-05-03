import React, { createContext, useContext, useEffect, useReducer, ReactNode, useRef } from 'react';
import { DashboardState, dashboardReducer, initialState } from '../components/dashboard/reducer';
import { ServerInfo } from '../api/types';
import { api } from '../api/service';

interface StatsContextType {
    state: DashboardState;
    dispatch: React.Dispatch<any>;
    refresh: () => Promise<void>;
}

const StatsContext = createContext<StatsContextType | undefined>(undefined);

const API_BASE_URL = process.env.API_BASE_URL || '';

export const StatsProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(dashboardReducer, initialState);
    const eventSourceRef = useRef<EventSource | null>(null);

    const fetchStats = async () => {
        try {
            const stats = await api.getServerInfo();
            dispatch({ type: 'UPDATE_DATA', payload: stats as ServerInfo });
        } catch (error) {
            // Silently fail as the server might be down temporarily
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchStats();

        // Option 1: Periodic Polling
        const interval = setInterval(fetchStats, 2000);

        // Option 2: Server-Sent Events (SSE) Client
        // Note: This is an optional implementation if the server supports it at /api/server/stats/sse
        const setupSSE = () => {
            if (process.env.USE_SSE === 'true') {
                const sseUrl = `${API_BASE_URL}/api/server/stats/sse`;
                const eventSource = new EventSource(sseUrl);
                eventSourceRef.current = eventSource;

                eventSource.onmessage = (event) => {
                    try {
                        const stats = JSON.parse(event.data);
                        dispatch({ type: 'UPDATE_DATA', payload: stats as ServerInfo });
                    } catch (e) {
                        console.error('Failed to parse SSE stats:', e);
                    }
                };

                eventSource.onerror = () => {
                    eventSource.close();
                };
            }
        };

        setupSSE();

        return () => {
            clearInterval(interval);
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, []);

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
