import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>(() => {
        const savedTheme = localStorage.getItem('mentozy_theme') as Theme;
        return savedTheme || 'light';
    });
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        localStorage.setItem('mentozy_theme', theme);
        
        const root = window.document.documentElement;
        
        const applyTheme = () => {
            if (theme === 'dark') {
                root.classList.add('dark');
                setIsDarkMode(true);
            } else if (theme === 'light') {
                root.classList.remove('dark');
                setIsDarkMode(false);
            } else {
                // System preference
                if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    root.classList.add('dark');
                    setIsDarkMode(true);
                } else {
                    root.classList.remove('dark');
                    setIsDarkMode(false);
                }
            }
        };

        applyTheme();

        // Listen for system changes if 'system' is selected
        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = () => applyTheme();
            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme, isDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
