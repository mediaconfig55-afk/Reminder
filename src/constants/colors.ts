export const Colors = {
    light: {
        background: '#FFFFFF',
        surface: '#F2F2F7',
        primary: '#000000', // Black for high contrast
        secondary: '#CCFF00', // Neon Lime
        text: '#000000',
        subtext: '#666666',
        border: '#E5E5EA',
        error: '#FF3B30',
        success: '#34C759',
        warning: '#FF9500',
        card: '#FFFFFF',
        modalBackground: 'rgba(0,0,0,0.5)',
    },
    dark: {
        background: '#050505', // Deep Black
        surface: '#141414', // Very Dark Grey for cards
        primary: '#CCFF00', // Neon Lime
        secondary: '#FF9900', // Bright Orange
        text: '#FFFFFF',
        subtext: '#A0A0A0',
        border: '#2A2A2A',
        error: '#FF453A',
        success: '#32D74B',
        warning: '#FF9F0A',
        card: '#141414',
        modalBackground: 'rgba(0,0,0,0.8)',
    }
};

export type ThemeColors = typeof Colors.light;
