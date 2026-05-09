import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import '../global.css';

import { DATABASE_NAME, migrateDbIfNeeded } from '@/lib/db';
import { useAuthSessionStore } from '@/modules/auth/session-store';

SplashScreen.preventAutoHideAsync();

const AppTheme = {
  dark: false,
  colors: {
    primary: '#45998D',
    background: '#f8fafc',
    card: '#ffffff',
    text: '#0f172a',
    border: '#e2e8f0',
    notification: '#D83A34',
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' as const },
    medium: { fontFamily: 'System', fontWeight: '500' as const },
    bold: { fontFamily: 'System', fontWeight: '700' as const },
    heavy: { fontFamily: 'System', fontWeight: '900' as const },
  },
};

export default function RootLayout() {
  const status = useAuthSessionStore((state) => state.status);
  const bootstrapSession = useAuthSessionStore((state) => state.bootstrapSession);

  useEffect(() => {
    void bootstrapSession();
  }, [bootstrapSession]);

  useEffect(() => {
    if (status !== 'checking') {
      SplashScreen.hideAsync();
    }
  }, [status]);

  if (status === 'checking') {
    return null;
  }

  const isAuthenticated = status === 'authenticated';

  return (
    <ThemeProvider value={AppTheme}>
      <SQLiteProvider databaseName={DATABASE_NAME} onInit={migrateDbIfNeeded}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'default',
            contentStyle: { backgroundColor: AppTheme.colors.background },
          }}
        >
          <Stack.Protected guard={!isAuthenticated}>
            <Stack.Screen name="(auth)/sign-in" />
          </Stack.Protected>
          <Stack.Protected guard={isAuthenticated}>
            <Stack.Screen name="(app)" />
          </Stack.Protected>
        </Stack>
      </SQLiteProvider>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}
