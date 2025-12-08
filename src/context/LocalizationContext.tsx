import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'es' | 'fr' | 'de' | 'ja';
type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AUD';

interface LocalizationContextType {
    language: Language;
    currency: Currency;
    setLanguage: (lang: Language) => void;
    setCurrency: (curr: Currency) => void;
    t: (key: string) => string;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
    en: {
        'welcome': 'Welcome',
        'discover': 'Discover',
        'plan': 'Plan',
        'flights': 'Flights',
        'ask_ai': 'Ask AI',
        'local_guide': 'Local Guide',
        'saved_trips': 'Saved Trips',
        'profile': 'Profile',
        'sign_out': 'Sign Out',
        'sign_in': 'Sign In',
        'get_started': 'Get Started',
        'dark_mode': 'Dark Mode',
        'light_mode': 'Light Mode',
    },
    es: {
        'welcome': 'Bienvenido',
        'discover': 'Descurbrir',
        'plan': 'Planear',
        'flights': 'Vuelos',
        'ask_ai': 'Preguntar IA',
        'local_guide': 'Guía Local',
        'saved_trips': 'Viajes Guardados',
        'profile': 'Perfil',
        'sign_out': 'Cerrar Sesión',
        'sign_in': 'Iniciar Sesión',
        'get_started': 'Empezar',
        'dark_mode': 'Modo Oscuro',
        'light_mode': 'Modo Claro',
    },
    fr: {
        'welcome': 'Bienvenue',
        'discover': 'Découvrir',
        'plan': 'Planifier',
        'flights': 'Vols',
        'ask_ai': 'Demander à IA',
        'local_guide': 'Guide Local',
        'saved_trips': 'Voyages Enregistrés',
        'profile': 'Profil',
        'sign_out': 'Se Déconnecter',
        'sign_in': 'Se Connecter',
        'get_started': 'Commençer',
        'dark_mode': 'Mode Sombre',
        'light_mode': 'Mode Clair',
    },
    de: {
        'welcome': 'Willkommen',
        'discover': 'Entdecken',
        'plan': 'Planen',
        'flights': 'Flüge',
        'ask_ai': 'Frag KI',
        'local_guide': 'Lokaler Führer',
        'saved_trips': 'Gespeicherte Reisen',
        'profile': 'Profil',
        'sign_out': 'Abmelden',
        'sign_in': 'Anmelden',
        'get_started': 'Loslegen',
        'dark_mode': 'Dunkelmodus',
        'light_mode': 'Heller Modus',
    },
    ja: {
        'welcome': 'ようこそ',
        'discover': '発見',
        'plan': '計画',
        'flights': 'フライト',
        'ask_ai': 'AIに聞く',
        'local_guide': 'ローカルガイド',
        'saved_trips': '保存された旅行',
        'profile': 'プロフィール',
        'sign_out': 'サインアウト',
        'sign_in': 'サインイン',
        'get_started': '始める',
        'dark_mode': 'ダークモード',
        'light_mode': 'ライトモード',
    }
};

export const LocalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>('en');
    const [currency, setCurrencyState] = useState<Currency>('USD');

    // Load from localStorage on mount
    useEffect(() => {
        const savedLang = localStorage.getItem('language') as Language;
        const savedCurr = localStorage.getItem('currency') as Currency;
        if (savedLang) setLanguageState(savedLang);
        if (savedCurr) setCurrencyState(savedCurr);
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('language', lang);
    };

    const setCurrency = (curr: Currency) => {
        setCurrencyState(curr);
        localStorage.setItem('currency', curr);
    };

    const t = (key: string) => {
        return translations[language][key] || key;
    };

    return (
        <LocalizationContext.Provider value={{ language, currency, setLanguage, setCurrency, t }}>
            {children}
        </LocalizationContext.Provider>
    );
};

export const useLocalization = () => {
    const context = useContext(LocalizationContext);
    if (!context) {
        throw new Error('useLocalization must be used within a LocalizationProvider');
    }
    return context;
};
