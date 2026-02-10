import React from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

interface LayoutProps {
    children: React.ReactNode;
    style?: any;
}

export const Layout: React.FC<LayoutProps> = ({ children, style }) => {
    const { colors, theme } = useTheme();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }, style]}>
            <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
            {children}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
