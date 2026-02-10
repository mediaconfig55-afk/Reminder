import { Layout } from '@/src/components/ui/Layout';
import { useTheme } from '@/src/context/ThemeContext';
import * as CategoryDB from '@/src/database/categories';
import * as ReminderDB from '@/src/database/reminders';
import { Category } from '@/src/database/types';
import { useFocusEffect, useRouter } from 'expo-router';
import { AlertTriangle, ArrowLeft, CheckCircle, Circle, List } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function StatsScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const [stats, setStats] = useState<any>(null);
    const [categories, setCategories] = useState<Category[]>([]);

    const loadStats = async () => {
        const data = await ReminderDB.getStatistics();
        const cats = await CategoryDB.getCategories();
        setStats(data);
        setCategories(cats);
    };

    useFocusEffect(
        useCallback(() => {
            loadStats();
        }, [])
    );

    if (!stats) return <Layout style={styles.container}><View /></Layout>;

    return (
        <Layout style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
                    <ArrowLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.text }]}>İstatistikler</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Summary Cards */}
                <Animated.View entering={FadeInDown.delay(100)} style={styles.grid}>
                    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <List size={24} color={colors.primary} />
                        <Text style={[styles.cardValue, { color: colors.text }]}>{stats.total}</Text>
                        <Text style={[styles.cardLabel, { color: colors.subtext }]}>Toplam</Text>
                    </View>
                    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <CheckCircle size={24} color="#10B981" />
                        <Text style={[styles.cardValue, { color: colors.text }]}>{stats.completed}</Text>
                        <Text style={[styles.cardLabel, { color: colors.subtext }]}>Tamamlanan</Text>
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(200)} style={styles.grid}>
                    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Circle size={24} color={colors.subtext} />
                        <Text style={[styles.cardValue, { color: colors.text }]}>{stats.active}</Text>
                        <Text style={[styles.cardLabel, { color: colors.subtext }]}>Aktif</Text>
                    </View>
                    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <AlertTriangle size={24} color="#EF4444" />
                        <Text style={[styles.cardValue, { color: colors.text }]}>{stats.highPriority}</Text>
                        <Text style={[styles.cardLabel, { color: colors.subtext }]}>Yüksek Öncelik</Text>
                    </View>
                </Animated.View>

                {/* Completion Rate */}
                <Animated.View entering={FadeInDown.delay(300)} style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Tamamlanma Oranı</Text>
                    <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                            <View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: `${stats.completionRate}%`,
                                        backgroundColor: stats.completionRate > 80 ? '#10B981' : stats.completionRate > 50 ? colors.primary : '#EF4444'
                                    }
                                ]}
                            />
                        </View>
                        <Text style={[styles.progressText, { color: colors.text }]}>%{stats.completionRate}</Text>
                    </View>
                </Animated.View>

                {/* Category Breakdown */}
                <Animated.View entering={FadeInDown.delay(400)} style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 12 }]}>Kategori Dağılımı (Aktif)</Text>
                    {categories.map((cat, index) => {
                        const catStat = stats.categoryStats.find((s: any) => s.categoryId === cat.id);
                        const count = catStat ? catStat.count : 0;
                        const percentage = stats.active > 0 ? (count / stats.active) * 100 : 0;

                        return (
                            <View key={cat.id} style={styles.categoryRow}>
                                <View style={styles.categoryInfo}>
                                    <View style={[styles.categoryDot, { backgroundColor: cat.color }]} />
                                    <Text style={[styles.categoryName, { color: colors.text }]}>{cat.name}</Text>
                                </View>
                                <View style={styles.categoryBarContainer}>
                                    <View style={[styles.categoryBar, { backgroundColor: colors.border }]}>
                                        <View style={[styles.categoryFill, { width: `${percentage}%`, backgroundColor: cat.color }]} />
                                    </View>
                                    <Text style={[styles.categoryCount, { color: colors.subtext }]}>{count}</Text>
                                </View>
                            </View>
                        );
                    })}
                </Animated.View>

            </ScrollView>
        </Layout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: 16,
    },
    grid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    card: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    cardValue: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    cardLabel: {
        fontSize: 12,
    },
    section: {
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    progressBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    progressBar: {
        flex: 1,
        height: 12,
        borderRadius: 6,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 6,
    },
    progressText: {
        fontSize: 16,
        fontWeight: 'bold',
        width: 40,
        textAlign: 'right',
    },
    categoryRow: {
        marginBottom: 12,
    },
    categoryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        gap: 8,
    },
    categoryDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    categoryName: {
        fontSize: 14,
        fontWeight: '500',
    },
    categoryBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    categoryBar: {
        flex: 1,
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    categoryFill: {
        height: '100%',
        borderRadius: 3,
    },
    categoryCount: {
        fontSize: 12,
        width: 20,
        textAlign: 'right',
    },
});
