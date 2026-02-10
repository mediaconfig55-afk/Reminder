import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import * as ReminderDB from '../database/reminders';
import { FilterType, Reminder } from '../database/types';

export const useReminders = (searchQuery: string = '', categoryId: number | null = null, filterType: FilterType = 'all') => {
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [loading, setLoading] = useState(true);

    const loadReminders = useCallback(async () => {
        try {
            setLoading(true);
            const data = await ReminderDB.getReminders(searchQuery, categoryId, filterType);
            setReminders(data);
        } catch (error) {
            console.error('Failed to load reminders', error);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, categoryId, filterType]); // Re-run when filters change

    useFocusEffect(
        useCallback(() => {
            loadReminders();
        }, [loadReminders])
    );

    // Also trigger reload when filters change directly (outside of focus)
    useEffect(() => {
        loadReminders();
    }, [loadReminders]);

    return { reminders, loading, refresh: loadReminders };
};
