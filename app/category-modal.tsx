import { Text, View } from '@/src/components/Themed';
import { Layout } from '@/src/components/ui/Layout';
import { useTheme } from '@/src/context/ThemeContext';
import * as CategoryDB from '@/src/database/categories';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

const COLORS = [
    '#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5',
    '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50',
    '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800',
    '#FF5722', '#795548', '#9E9E9E', '#607D8B'
];

const ICONS = ['list', 'briefcase', 'user', 'shopping-cart', 'book', 'star', 'heart', 'home'];

export default function CategoryModalScreen() {
    const { colors, theme } = useTheme();
    const { id } = useLocalSearchParams();
    const isEditing = !!id;

    const [name, setName] = useState('');
    const [selectedColor, setSelectedColor] = useState(COLORS[5]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEditing) {
            // Load category logic here if we implement edit category (pass name/color via params or fetch)
            // For simplicity, we might just pass params or fetch
        }
    }, [id]);

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Hata', 'Lütfen kategori adı girin.');
            return;
        }

        try {
            await CategoryDB.addCategory(name, selectedColor, 'list'); // Default icon for now
            router.back();
        } catch (error) {
            console.error(error);
            Alert.alert('Hata', 'Kategori kaydedilemedi.');
        }
    };

    return (
        <Layout style={styles.container}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={{ color: colors.primary, fontSize: 17 }}>İptal</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Yeni Kategori</Text>
                <TouchableOpacity onPress={handleSave}>
                    <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: 17 }}>Ekle</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                    placeholder="Kategori Adı"
                    placeholderTextColor={colors.subtext}
                    value={name}
                    onChangeText={setName}
                    autoFocus
                />

                <Text style={[styles.sectionTitle, { color: colors.subtext }]}>Renk</Text>
                <View style={styles.colorGrid}>
                    {COLORS.map((color) => (
                        <TouchableOpacity
                            key={color}
                            style={[
                                styles.colorCircle,
                                { backgroundColor: color },
                                selectedColor === color && { borderWidth: 3, borderColor: colors.text }
                            ]}
                            onPress={() => setSelectedColor(color)}
                        />
                    ))}
                </View>
            </ScrollView>
            <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        </Layout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 0.5,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '600',
    },
    content: {
        padding: 16,
    },
    input: {
        padding: 12,
        borderRadius: 10,
        fontSize: 16,
        marginBottom: 24,
        borderWidth: 1,
    },
    sectionTitle: {
        fontSize: 12,
        textTransform: 'uppercase',
        marginBottom: 12,
        marginLeft: 4,
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'flex-start',
    },
    colorCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
});
