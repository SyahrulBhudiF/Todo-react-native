import { Text, View } from 'react-native';

type StatCardProps = {
  label: string;
  value: number;
  color: string;
};

export function StatCard({ label, value, color }: StatCardProps) {
  return (
    <View className="flex-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <Text className="text-xs font-extrabold tracking-[1.8px] text-slate-500">{label}</Text>
      <Text className="mt-3 text-4xl font-black" style={{ color }}>
        {value}
      </Text>
    </View>
  );
}
