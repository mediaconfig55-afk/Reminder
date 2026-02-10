import { FAB } from '@/src/components/ui/FAB';
import { Layout } from '@/src/components/ui/Layout';
import { useTheme } from '@/src/context/ThemeContext';
import * as CategoryDB from '@/src/database/categories';
import { Category } from '@/src/database/types';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

export default function CategoriesScreen() {
  const { colors } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [])
  );

  const loadCategories = async () => {
    const data = await CategoryDB.getCategories();
    setCategories(data);
  };

  const handleAddPress = () => {
    router.push('/category-modal');
  };

  return (
    <Layout style={styles.container}>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.item, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <View style={[styles.colorDot, { backgroundColor: item.color }]} />
            <Text style={[styles.itemText, { color: colors.text }]}>{item.name}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <FAB onPress={handleAddPress} />
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 16,
  },
  itemText: {
    fontSize: 17,
  },
});
