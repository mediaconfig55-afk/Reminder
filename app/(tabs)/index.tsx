import { ReminderItem } from '@/src/components/reminders/ReminderItem';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { FAB } from '@/src/components/ui/FAB';
import { Layout } from '@/src/components/ui/Layout';
import { SkeletonLoader } from '@/src/components/ui/SkeletonLoader';
import { useTheme } from '@/src/context/ThemeContext';
import * as CategoryDB from '@/src/database/categories';
import * as ReminderDB from '@/src/database/reminders';
import { Category, FilterType } from '@/src/database/types';
import { useReminders } from '@/src/hooks/useReminders';
import { router } from 'expo-router';
import { PieChart, Search, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function TabOneScreen() {
  const { colors } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [categories, setCategories] = useState<Category[]>([]);

  const { reminders, loading, refresh } = useReminders(searchQuery, selectedCategoryId, filterType);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const data = await CategoryDB.getCategories();
    setCategories(data);
  };

  const handleToggleCompletion = useCallback(async (id: number, isCompleted: boolean) => {
    await ReminderDB.toggleReminderCompletion(id, isCompleted);
    refresh();
  }, [refresh]);

  const handleDeleteReminder = useCallback((id: number) => {
    Alert.alert(
      'Sil',
      'Bu hatırlatıcıyı silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            await ReminderDB.deleteReminder(id);
            refresh();
          }
        }
      ]
    );
  }, [refresh]);

  const handlePressReminder = (id: number) => {
    router.push({ pathname: '/modal', params: { id } });
  };

  const handleAddPress = () => {
    router.push('/modal');
  };

  return (
    <Layout style={styles.container}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          {filterType === 'all' ? 'Tümü' :
            filterType === 'today' ? 'Bugün' :
              filterType === 'upcoming' ? 'Yaklaşan' :
                filterType === 'flagged' ? 'Önemli' : 'Tamamlanan'}
        </Text>
        <TouchableOpacity onPress={() => router.push('/stats')} style={{ padding: 8 }}>
          <PieChart size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        {/* Search Bar */}
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Search size={20} color={colors.subtext} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Ara..."
            placeholderTextColor={colors.subtext}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={18} color={colors.subtext} />
            </TouchableOpacity>
          )}
        </View>

        {/* View Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {(['all', 'today', 'upcoming', 'flagged', 'completed'] as FilterType[]).map((ft) => (
            <TouchableOpacity
              key={ft}
              style={[
                styles.categoryChip,
                filterType === ft ? { backgroundColor: colors.primary } : { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }
              ]}
              onPress={() => setFilterType(ft)}
            >
              <Text style={{ color: filterType === ft ? '#000' : colors.text, fontSize: 12 }}>
                {ft === 'all' ? 'Tümü' : ft === 'today' ? 'Bugün' : ft === 'upcoming' ? 'Yaklaşan' : ft === 'flagged' ? 'Önemli' : 'Tamamlanan'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Category Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          <TouchableOpacity
            style={[
              styles.categoryChip,
              !selectedCategoryId ? { backgroundColor: colors.primary } : { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }
            ]}
            onPress={() => setSelectedCategoryId(null)}
          >
            <Text style={{ color: !selectedCategoryId ? '#000' : colors.text, fontSize: 12 }}>Tümü</Text>
          </TouchableOpacity>

          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                selectedCategoryId === cat.id ? { backgroundColor: cat.color } : { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }
              ]}
              onPress={() => setSelectedCategoryId(selectedCategoryId === cat.id ? null : cat.id)}
            >
              <Text style={{ color: selectedCategoryId === cat.id ? '#000' : colors.text, fontSize: 12 }}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <SkeletonLoader />
      ) : reminders.length === 0 ? (
        <EmptyState
          title="Henüz Hatırlatıcı Yok"
          message="İlk hatırlatıcınızı ekleyerek başlayın!"
          actionText="Hatırlatıcı Ekle"
          onAction={handleAddPress}
        />
      ) : (
        <FlatList
          data={reminders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ReminderItem
              reminder={item}
              category={categories.find(c => c.id === item.categoryId)}
              onToggleCompletion={handleToggleCompletion}
              onPress={handlePressReminder}
              onDelete={handleDeleteReminder}
            />
          )}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        />
      )}

      <FAB onPress={handleAddPress} />
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
    paddingBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
});
