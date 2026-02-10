import { Layout } from '@/src/components/ui/Layout';
import { useTheme } from '@/src/context/ThemeContext';
import { requestNotificationPermissions } from '@/src/utils/notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Bell, Calendar, Settings } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const slides = [
    {
        id: 1,
        icon: Bell,
        title: 'Hatırlatıcılarınızı Yönetin',
        description: 'Önemli görevlerinizi asla unutmayın. Hatırlatıcılarınızı kolayca ekleyin ve yönetin.',
    },
    {
        id: 2,
        icon: Calendar,
        title: 'Kategoriler ve Öncelikler',
        description: 'Hatırlatıcılarınızı kategorilere ayırın, öncelik verin ve özel bildirim sesleri seçin.',
    },
    {
        id: 3,
        icon: Settings,
        title: 'Bildirimler',
        description: 'Zamanında bildirim alabilmek için bildirim iznine ihtiyacımız var.',
    },
];

export default function OnboardingScreen() {
    const { colors } = useTheme();
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            const nextIndex = currentIndex + 1;
            flatListRef.current?.scrollToIndex({ index: nextIndex });
            setCurrentIndex(nextIndex);
        } else {
            handleFinish();
        }
    };

    const handleSkip = () => {
        handleFinish();
    };

    const handleFinish = async () => {
        if (currentIndex === slides.length - 1) {
            await requestNotificationPermissions();
        }
        await AsyncStorage.setItem('hasSeenOnboarding', 'true');
        router.replace('/(tabs)');
    };

    const renderSlide = ({ item }: { item: typeof slides[0] }) => {
        const Icon = item.icon;
        return (
            <View style={[styles.slide, { width }]}>
                <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
                    <Icon size={64} color={colors.primary} />
                </View>
                <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.description, { color: colors.subtext }]}>{item.description}</Text>
            </View>
        );
    };

    return (
        <Layout style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={slides}
                renderItem={renderSlide}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(event) => {
                    const index = Math.round(event.nativeEvent.contentOffset.x / width);
                    setCurrentIndex(index);
                }}
                keyExtractor={(item) => item.id.toString()}
            />

            <View style={styles.footer}>
                <View style={styles.pagination}>
                    {slides.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                {
                                    backgroundColor: index === currentIndex ? colors.primary : colors.subtext,
                                    width: index === currentIndex ? 24 : 8,
                                },
                            ]}
                        />
                    ))}
                </View>

                <View style={styles.buttons}>
                    {currentIndex < slides.length - 1 && (
                        <TouchableOpacity onPress={handleSkip}>
                            <Text style={[styles.skipText, { color: colors.subtext }]}>Atla</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={[styles.nextButton, { backgroundColor: colors.primary }]}
                        onPress={handleNext}
                    >
                        <Text style={styles.nextText}>
                            {currentIndex === slides.length - 1 ? 'Başla' : 'İleri'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Layout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    slide: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
    footer: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
        gap: 8,
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    skipText: {
        fontSize: 16,
    },
    nextButton: {
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 8,
    },
    nextText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '600',
    },
});
