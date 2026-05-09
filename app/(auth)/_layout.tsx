import { Redirect, Stack } from 'expo-router';

import { useAuthSessionStore } from '@/modules/auth/session-store';

export default function AuthLayout() {
  const status = useAuthSessionStore((state) => state.status);

  if (status === 'authenticated') {
    return <Redirect href="/" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'default',
        contentStyle: { backgroundColor: '#f8fafc' },
      }}
    />
  );
}
