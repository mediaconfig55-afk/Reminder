import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import { initDatabase } from '../src/database/database';
import * as ReminderDB from '../src/database/reminders';
import { scheduleReminderNotification } from '../src/utils/notifications';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();

      // Check if user has seen onboarding
      AsyncStorage.getItem('hasSeenOnboarding').then((value) => {
        if (!value) {
          router.replace('/onboarding');
        }
      });

      // Initialize Database
      initDatabase().catch((e) => {
        console.error('Database initialization failed:', e);
        if (Platform.OS === 'web') {
          alert('Veritabanı başlatılamadı. Lütfen diğer açık sekmeleri kapatıp sayfayı yenileyin.');
        }
      });

      // Setup notification response listener
      // This prevents the app from auto-deleting reminders when notification is tapped
      const subscription = Notifications.addNotificationResponseReceivedListener(async response => {
        const actionId = response.actionIdentifier;
        const reminderId = response.notification.request.content.data.reminderId as number;

        if (actionId === 'complete') {
          await ReminderDB.toggleReminderCompletion(reminderId, true);
        } else if (actionId === 'snooze') {
          // Snooze for 15 minutes
          const reminder = await ReminderDB.getReminderById(reminderId);
          if (reminder && reminder.dueDate) {
            const newDate = new Date().getTime() + 5 * 60 * 1000;
            await ReminderDB.updateReminder(reminderId, { dueDate: newDate });
            await scheduleReminderNotification({ ...reminder, dueDate: newDate });
          }
        }
      });

      return () => subscription.remove();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <ErrorBoundary>
        <RootLayoutNav />
      </ErrorBoundary>
    </ThemeProvider>
  );
}

function RootLayoutNav() {
  const { theme, colors } = useTheme();

  return (
    <NavigationThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      </Stack>
    </NavigationThemeProvider>
  );
}
