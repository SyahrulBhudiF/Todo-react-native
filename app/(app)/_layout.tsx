import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'default',
        freezeOnBlur: false,
        contentStyle: { backgroundColor: '#f8fafc' },
      }}
    />
  );
}
