import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type AppHeaderProps = {
  title: string;
  color?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
};

export function AppHeader({
  title,
  color = '#45998D',
  showBack = false,
  rightAction,
}: AppHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <>
      <StatusBar style="light" backgroundColor={color} />
      <View style={{ backgroundColor: color, paddingTop: insets.top }}>
        <View
        className="h-14 flex-row items-center justify-center px-4"
        style={{ backgroundColor: color }}
      >
        {showBack ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            className="absolute left-4 h-10 w-10 items-center justify-center rounded-full active:opacity-70"
          >
            <Ionicons name="chevron-back" size={26} color="white" />
          </Pressable>
        ) : null}
        <Text className="text-lg font-extrabold text-white">{title}</Text>
        {rightAction ? <View className="absolute right-4">{rightAction}</View> : null}
        </View>
      </View>
    </>
  );
}
