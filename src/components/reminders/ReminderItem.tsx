import { useTheme } from '@/src/context/ThemeContext';
import { Category, Reminder } from '@/src/database/types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import * as Haptics from 'expo-haptics';
import { Check, Clock, Repeat, Trash2 } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, { Layout, SharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface ReminderItemProps {
    reminder: Reminder;
    category?: Category;
    onToggleCompletion: (id: number, isCompleted: boolean) => void;
    onPress: (id: number) => void;
    onDelete: (id: number) => void;
}

export const ReminderItem = React.memo<ReminderItemProps>(
    ({ reminder, category, onToggleCompletion, onPress, onDelete }) => {
        const { colors } = useTheme();

        const handleToggle = () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onToggleCompletion(reminder.id, !reminder.isCompleted);
        };

        const checkboxStyle = useAnimatedStyle(() => {
            return {
                backgroundColor: withSpring(reminder.isCompleted ? colors.primary : 'transparent'),
                borderColor: withSpring(reminder.isCompleted ? colors.primary : colors.subtext),
                transform: [{ scale: withSpring(reminder.isCompleted ? 1.1 : 1) }],
            };
        });

        const renderRightActions = (progress: SharedValue<number>, drag: SharedValue<number>) => {
            return (
                <View style={styles.rightAction}>
                    <Pressable
                        style={[styles.deleteButton]}
                        onPress={() => onDelete(reminder.id)}
                    >
                        <Trash2 size={24} color="#FFF" />
                    </Pressable>
                </View>
            );
        };

        return (
            <Animated.View layout={Layout.springify().damping(15)} style={styles.mainContainer}>
                <ReanimatedSwipeable
                    renderRightActions={renderRightActions}
                    overshootRight={false}
                >
                    <Pressable
                        style={({ pressed }) => [
                            styles.container,
                            { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.9 : 1 }
                        ]}
                        onPress={() => onPress(reminder.id)}
                    >
                        <Pressable onPress={handleToggle} style={styles.checkboxContainer} hitSlop={20}>
                            <Animated.View style={[styles.checkbox, { borderColor: colors.subtext }, checkboxStyle]}>
                                {reminder.isCompleted && <Check size={14} color="#FFF" />}
                            </Animated.View>
                        </Pressable>

                        <View style={styles.content}>
                            <Text
                                style={[
                                    styles.title,
                                    { color: reminder.isCompleted ? colors.subtext : colors.text, textDecorationLine: reminder.isCompleted ? 'line-through' : 'none' },
                                ]}
                                numberOfLines={1}
                            >
                                {reminder.title}
                            </Text>
                            {reminder.description ? (
                                <Text style={[styles.description, { color: colors.subtext }]} numberOfLines={2}>
                                    {reminder.description}
                                </Text>
                            ) : null}

                            <View style={styles.footer}>
                                {reminder.dueDate ? (
                                    <View style={styles.metaItem}>
                                        <Clock size={12} color={colors.subtext} />
                                        <Text style={[styles.metaText, { color: colors.subtext }]}>
                                            {format(new Date(reminder.dueDate), 'd MMM HH:mm', { locale: tr })}
                                        </Text>
                                    </View>
                                ) : null}

                                {reminder.repeatType !== 'none' && (
                                    <View style={styles.metaItem}>
                                        <Repeat size={12} color={colors.subtext} />
                                    </View>
                                )}

                                {category && (
                                    <View style={[styles.categoryBadge, { backgroundColor: category.color + '20' }]}>
                                        <Text style={[styles.categoryText, { color: category.color }]}>{category.name}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </Pressable>
                </ReanimatedSwipeable>
            </Animated.View>
        );
    },
    (prevProps, nextProps) => {
        return (
            prevProps.reminder.id === nextProps.reminder.id &&
            prevProps.reminder.isCompleted === nextProps.reminder.isCompleted &&
            prevProps.reminder.title === nextProps.reminder.title &&
            prevProps.reminder.dueDate === nextProps.reminder.dueDate
        );
    }
);

const styles = StyleSheet.create({
    mainContainer: {
        marginBottom: 8,
    },
    container: {
        flexDirection: 'row',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
    },
    checkboxContainer: {
        padding: 8,
        marginRight: 4,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    description: {
        fontSize: 14,
        marginBottom: 6,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 12,
    },
    categoryBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    categoryText: {
        fontSize: 10,
        fontWeight: '600',
    },
    rightAction: {
        width: 80,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteButton: {
        backgroundColor: '#EF4444',
        justifyContent: 'center',
        alignItems: 'center',
        width: 60,
        height: '100%',
        borderRadius: 12, // Match container radius
        marginRight: 8, // Spacing from container
    }
});
