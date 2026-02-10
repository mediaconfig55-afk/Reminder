import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Reminder } from '../database/types';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
    }),
});

export const requestNotificationPermissions = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus === 'granted') {
        // Android için bildirim kanalları oluştur
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'Varsayılan',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
                sound: 'default',
                enableVibrate: true,
            });
            await Notifications.setNotificationChannelAsync('urgent', {
                name: 'Acil',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 500, 200, 500],
                lightColor: '#FF0000',
                sound: 'default',
                enableVibrate: true,
            });
            await Notifications.setNotificationChannelAsync('soft', {
                name: 'Hafif',
                importance: Notifications.AndroidImportance.DEFAULT,
                vibrationPattern: [0, 100, 50, 100],
                lightColor: '#00FF00',
                sound: 'default',
                enableVibrate: true,
            });

            // Bildirim aksiyonları (Tamamla/Ertele)
            await Notifications.setNotificationCategoryAsync('reminder', [
                {
                    identifier: 'complete',
                    buttonTitle: 'Tamamla',
                    options: {
                        opensAppToForeground: false,
                    },
                },
                {
                    identifier: 'snooze',
                    buttonTitle: 'Ertele',
                    options: {
                        opensAppToForeground: false,
                    },
                },
            ]);
        }
    }

    return finalStatus === 'granted';
};

export const scheduleReminderNotification = async (reminder: Reminder) => {
    if (!reminder.dueDate || reminder.dueDate < Date.now()) return;

    const identifier = `reminder-${reminder.id}`;

    // Cancel existing if any
    await cancelReminderNotification(reminder.id);

    if (reminder.isCompleted) return;

    await Notifications.scheduleNotificationAsync({
        identifier,
        content: {
            title: reminder.title,
            body: reminder.description,
            sound: true,
            data: { reminderId: reminder.id },
            categoryIdentifier: 'reminder',
            // @ts-ignore
            channelId: reminder.notificationSound || 'default',
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: new Date(new Date(reminder.dueDate).setSeconds(0, 0)),
            channelId: reminder.notificationSound || 'default',
        },
    });
};

export const cancelReminderNotification = async (reminderId: number) => {
    const identifier = `reminder-${reminderId}`;
    await Notifications.cancelScheduledNotificationAsync(identifier);
};
