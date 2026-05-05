import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { useLocalStorage } from 'usehooks-ts';

type Locale = 'en' | 'de';

interface Translations {
    [key: string]: string;
}

const translations: Record<Locale, Translations> = {
    en: {
        dashboard: 'Dashboard',
        streams: 'Streams',
        tasks: 'Tasks',
        profile: 'Profile',
        config: 'Configuration',
        refresh_stats: 'Refresh Stats',
        stats_refreshed: 'Stats refreshed successfully',
        failed_refresh: 'Failed to refresh stats',
        live: 'Live',
        viewers: 'Viewers',
        duration: 'Duration',
        bitrate: 'Bitrate',
        start_time: 'Start Time',
        arguments: 'Arguments',
        no_data: 'No data found',
        snapshot: 'Take Snapshot',
        reload: 'Reload Player',
        overview: 'Dashboard Overview',
        server_info: 'Server Information',
        active_streams: 'Active Streams',
        app: 'App',
        stream_name: 'Stream Name',
        actions: 'Actions',
        delete: 'Delete',
        confirm_delete: 'Are you sure you want to delete this?',
        yes: 'Yes',
        no: 'No',
        switch: 'Switch',
    },
    de: {
        dashboard: 'Dashboard',
        streams: 'Streams',
        tasks: 'Aufgaben',
        profile: 'Profil',
        config: 'Konfiguration',
        refresh_stats: 'Statistiken aktualisieren',
        stats_refreshed: 'Statistiken erfolgreich aktualisiert',
        failed_refresh: 'Aktualisierung der Statistiken fehlgeschlagen',
        live: 'Live',
        viewers: 'Zuschauer',
        duration: 'Dauer',
        bitrate: 'Bitrate',
        start_time: 'Startzeit',
        arguments: 'Argumente',
        no_data: 'Keine Daten gefunden',
        snapshot: 'Schnappschuss machen',
        reload: 'Player neu laden',
        overview: 'Dashboard-Übersicht',
        server_info: 'Serverinformationen',
        active_streams: 'Aktive Streams',
        app: 'App',
        stream_name: 'Stream-Name',
        actions: 'Aktionen',
        delete: 'Löschen',
        confirm_delete: 'Sind Sie sicher, dass Sie dies löschen möchten?',
        yes: 'Ja',
        no: 'Nein',
        switch: 'Umschalter',
    }
};

interface LanguageContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [locale, setLocale] = useLocalStorage<Locale>('nms.admin.locale', 'en');

    const t = useCallback((key: string) => {
        const translationSet = translations[locale] || translations['en'];
        return translationSet[key] || key;
    }, [locale]);

    return (
        <LanguageContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useTranslation = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useTranslation must be used within a LanguageProvider');
    }
    return context;
};
