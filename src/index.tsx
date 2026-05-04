import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { StatsProvider } from './context/StatsContext';
import { LanguageProvider } from './context/LanguageContext';

// Register Service Worker for lifecycle management (stats polling moved to StatsContext)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register(new URL('./sw.ts', import.meta.url), {
            type: 'module',
        }).then(registration => {
            console.log('SW registered: ', registration);
        }).catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
        });
    });
}

const root = createRoot(document.getElementById('root')!);
root.render(
    <React.StrictMode>
        <LanguageProvider>
            <StatsProvider>
                <App />
            </StatsProvider>
        </LanguageProvider>
    </React.StrictMode>,
);
