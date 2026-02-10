import { Layout } from '@/src/components/ui/Layout';
import { useTheme } from '@/src/context/ThemeContext';
import * as CategoryDB from '@/src/database/categories';
import { Category } from '@/src/database/types';
import { useReminders } from '@/src/hooks/useReminders';
import { CheckCircle2, Clock, TrendingUp } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function StatsScreen() {
    const { colors } = useTheme();
    const { reminders } = useReminders();
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        const data = await CategoryDB.getCategories();
        setCategories(data);
    };

    const totalReminders = reminders.length;
    const completedReminders = reminders.filter((r) => r.isCompleted).length;
    const pendingReminders = totalReminders - completedReminders;
    const completionRate = totalReminders > 0 ? Math.round((completedReminders / totalReminders) * 100) : 0;

    // Category distribution
    const categoryData = categories.map((cat) => ({
        name: cat.name,
        count: reminders.filter((r) => r.categoryId === cat.id).length,
        color: cat.color,
    })).filter((item) => item.count > 0);

    return (
        <Layout style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[styles.title, { color: colors.text }]}>İstatistikler</Text>

                {/* Summary Cards */}
                <View style={styles.cardsContainer}>
                    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Clock size={32} color={colors.primary} />
                        <Text style={[styles.cardValue, { color: colors.text }]}>{pendingReminders}</Text>
                        <Text style={[styles.cardLabel, { color: colors.subtext }]}>Bekleyen</Text>
                    </View>

                    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <CheckCircle2 size={32} color="#4CAF50" />
                        <Text style={[styles.cardValue, { color: colors.text }]}>{completedReminders}</Text>
                        <Text style={[styles.cardLabel, { color: colors.subtext }]}>Tamamlanan</Text>
                    </View>

                    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <TrendingUp size={32} color={colors.primary} />
                        <Text style={[styles.cardValue, { color: colors.text }]}>{completionRate}%</Text>
                        <Text style={[styles.cardLabel, { color: colors.subtext }]}>Başarı Oranı</Text>
                    </View>
                </View>

                {/* Category Distribution */}
                {categoryData.length > 0 && (
                    <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Kategori Dağılımı</Text>
                        <View style={styles.categoryList}>
                            {categoryData.map((item) => (
                                <View key={item.name} style={styles.categoryItem}>
                                    <View style={styles.categoryInfo}>
                                        <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                                        <Text style={[styles.categoryName, { color: colors.text }]}>{item.name}</Text>
                                    </View>
                                    <Text style={[styles.categoryCount, { color: colors.subtext }]}>{item.count}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {totalReminders === 0 && (
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, { color: colors.subtext }]}>
                            Henüz istatistik gösterilecek veri yok.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </Layout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    cardsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    card: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
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
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    categoryList: {
        gap: 12,
    },
    categoryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    categoryInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    colorDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    categoryName: {
        fontSize: 16,
    },
    categoryCount: {
        fontSize: 16,
        fontWeight: '600',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
    },
});
