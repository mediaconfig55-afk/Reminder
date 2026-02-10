import { useTheme } from '@/src/context/ThemeContext';
import { Plus } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

interface FABProps {
    onPress: () => void;
    style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const FAB: React.FC<FABProps> = ({ onPress, style }) => {
    const { colors } = useTheme();

    return (
        <AnimatedPressable
            onPress={onPress}
            style={[
                styles.container,
                { backgroundColor: colors.primary, shadowColor: colors.text },
                style,
            ]}
        // Add press animation later if needed
        >
            <Plus color="#FFF" size={32} />
        </AnimatedPressable>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});
