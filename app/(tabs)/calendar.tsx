import { ReminderItem } from '@/src/components/reminders/ReminderItem';
import { Layout } from '@/src/components/ui/Layout';
import { useTheme } from '@/src/context/ThemeContext';
import * as ReminderDB from '@/src/database/reminders';
import { Reminder } from '@/src/database/types';
import { format } from 'date-fns';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';

LocaleConfig.locales['tr'] = {
    monthNames: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
    monthNamesShort: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
    dayNames: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
    dayNamesShort: ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'],
    today: 'Bugün'
};
LocaleConfig.defaultLocale = 'tr';

export default function CalendarScreen() {
    const { colors, theme } = useTheme();
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [reminders, setReminders] = useState<Reminder[]>([]);

    useFocusEffect(
        useCallback(() => {
            loadRemindersForDate(selectedDate);
        }, [selectedDate])
    );

    const loadRemindersForDate = async (dateString: string) => {
        // Calculate start and end of the selected day
        const start = new Date(dateString).setHours(0, 0, 0, 0);
        const end = new Date(dateString).setHours(23, 59, 59, 999);

        const data = await ReminderDB.getRemindersByDate(start, end);
        setReminders(data);
    };

    const handleDayPress = (day: any) => {
        setSelectedDate(day.dateString);
    };

    const handleToggleCompletion = async (id: number, isCompleted: boolean) => {
        await ReminderDB.toggleReminderCompletion(id, isCompleted);
        loadRemindersForDate(selectedDate);
    };

    const handlePressReminder = (id: number) => {
        router.push({ pathname: '/modal', params: { id } });
    };

    return (
        <Layout style={styles.container}>
            <Calendar
                onDayPress={handleDayPress}
                markedDates={{
                    [selectedDate]: { selected: true, disableTouchEvent: true, dotColor: 'orange' }
                }}
                theme={{
                    backgroundColor: colors.background,
                    calendarBackground: colors.surface,
                    textSectionTitleColor: colors.subtext,
                    selectedDayBackgroundColor: colors.primary,
                    selectedDayTextColor: '#ffffff',
                    todayTextColor: colors.primary,
                    dayTextColor: colors.text,
                    textDisabledColor: colors.subtext,
                    dotColor: colors.primary,
                    selectedDotColor: '#ffffff',
                    arrowColor: colors.primary,
                    monthTextColor: colors.text,
                    indicatorColor: colors.primary,
                }}
            />

            <View style={styles.listContainer}>
                <Text style={[styles.sectionTitle, { color: colors.subtext }]}>
                    {selectedDate} Hatırlatıcıları
                </Text>
                <FlatList
                    data={reminders}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <ReminderItem
                            reminder={item}
                            onToggleCompletion={handleToggleCompletion}
                            onPress={handlePressReminder}
                        />
                    )}
                    ListEmptyComponent={
                        <Text style={{ color: colors.subtext, textAlign: 'center', marginTop: 20 }}>Bu tarihte hatırlatıcı yok.</Text>
                    }
                    contentContainerStyle={{ padding: 16 }}
                />
            </View>
        </Layout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContainer: {
        flex: 1,
        marginTop: 10,
    },
    sectionTitle: {
        marginLeft: 16,
        marginBottom: 8,
        fontSize: 14,
        fontWeight: '600',
    },
});
