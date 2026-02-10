import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';

export const SkeletonLoader = () => {
    const opacity = useSharedValue(0.3);

    useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 800 }),
                withTiming(0.3, { duration: 800 })
            ),
            -1,
            false
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return (
        <View style={styles.container}>
            {[1, 2, 3].map((item) => (
                <Animated.View key={item} style={[styles.card, animatedStyle]}>
                    <View style={styles.row}>
                        <View style={styles.checkbox} />
                        <View style={styles.content}>
                            <View style={styles.titleLine} />
                            <View style={styles.descLine} />
                            <View style={styles.metaLine} />
                        </View>
                    </View>
                </Animated.View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    card: {
        backgroundColor: '#1E1E1E',
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#2A2A2A',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#2A2A2A',
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    titleLine: {
        height: 16,
        backgroundColor: '#2A2A2A',
        borderRadius: 4,
        marginBottom: 8,
        width: '70%',
    },
    descLine: {
        height: 12,
        backgroundColor: '#2A2A2A',
        borderRadius: 4,
        marginBottom: 8,
        width: '90%',
    },
    metaLine: {
        height: 10,
        backgroundColor: '#2A2A2A',
        borderRadius: 4,
        width: '40%',
    },
});
