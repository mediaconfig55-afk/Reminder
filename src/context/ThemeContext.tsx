import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { Colors, ThemeColors } from '../constants/colors';

type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: 'light' | 'dark';
    themeType: ThemeType; // setting value
    colors: ThemeColors;
    setThemeType: (type: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'user_theme_preference';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const deviceColorScheme = useDeviceColorScheme();
    const [themeType, setThemeType] = useState<ThemeType>('system');
    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        // Load saved theme preference
        const loadTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
                if (savedTheme) {
                    setThemeType(savedTheme as ThemeType);
                }
            } catch (error) {
                console.error('Failed to load theme preference', error);
            }
        };
        loadTheme();
    }, []);

    useEffect(() => {
        // Save theme preference
        const saveTheme = async () => {
            try {
                await AsyncStorage.setItem(THEME_STORAGE_KEY, themeType);
            } catch (error) {
                console.error('Failed to save theme preference', error);
            }
        };
        saveTheme();

        // Resolve effective theme
        if (themeType === 'system') {
            setResolvedTheme(deviceColorScheme === 'dark' ? 'dark' : 'light');
        } else {
            setResolvedTheme(themeType);
        }
    }, [themeType, deviceColorScheme]);


    const value = {
        theme: resolvedTheme,
        themeType,
        colors: Colors[resolvedTheme],
        setThemeType,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
