import { ActivityIndicator, Pressable, Text } from 'react-native';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  color?: string;
  disabled?: boolean;
  loading?: boolean;
};

export function PrimaryButton({
  label,
  onPress,
  color = '#45998D',
  disabled = false,
  loading = false,
}: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      className="h-14 items-center justify-center rounded-2xl active:opacity-75 disabled:opacity-60"
      style={{ backgroundColor: color }}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text className="text-base font-extrabold tracking-wide text-white">{label}</Text>
      )}
    </Pressable>
  );
}
