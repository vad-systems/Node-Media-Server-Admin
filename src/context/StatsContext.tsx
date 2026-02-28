import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import { DashboardState, dashboardReducer, initialState } from '../components/dashboard/reducer';
import { ServerInfo } from '../api/types';

interface StatsContextType {
    state: DashboardState;
    dispatch: React.Dispatch<any>;
}

const StatsContext = createContext<StatsContextType | undefined>(undefined);

export const StatsProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(dashboardReducer, initialState);

    useEffect(() => {
        const channel = new BroadcastChannel('server-stats');
        
        const handleMessage = (event: MessageEvent) => {
            if (event.data && event.data.type === 'STATS_UPDATE') {
                dispatch({ type: 'UPDATE_DATA', payload: event.data.payload as ServerInfo });
            }
        };

        channel.addEventListener('message', handleMessage);

        return () => {
            channel.removeEventListener('message', handleMessage);
            channel.close();
        };
    }, []);

    return (
        <StatsContext.Provider value={{ state, dispatch }}>
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
