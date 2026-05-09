import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { StatCard } from '@/components/stat-card';
import { formatTodayLong } from '@/lib/date';
import { useAuthSessionStore } from '@/modules/auth/session-store';
import { getCompletedByDay, getTaskStats } from '@/modules/tasks/repository';
import type { CompletedByDay, TaskStats } from '@/types';

const MENU = [
  {
    title: 'Tambah Tugas Penting',
    route: '/add-important' as const,
    icon: 'add-circle-outline' as const,
    color: '#D83A34',
  },
  {
    title: 'Tambah Tugas Biasa',
    route: '/add-normal' as const,
    icon: 'add-outline' as const,
    color: '#4DA85A',
  },
  {
    title: 'Daftar Tugas',
    route: '/tasks' as const,
    icon: 'list-outline' as const,
    color: '#356AE6',
  },
  {
    title: 'Pengaturan',
    route: '/settings' as const,
    icon: 'settings-outline' as const,
    color: '#68758A',
  },
];

export default function HomeScreen() {
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();
  const requireValidSession = useAuthSessionStore((state) => state.requireValidSession);
  const [stats, setStats] = useState<TaskStats>({ completed: 0, incomplete: 0 });
  const [chart, setChart] = useState<CompletedByDay[]>([]);

  const loadData = useCallback(async () => {
    const validSession = await requireValidSession();
    if (!validSession) return;

    const nextStats = await getTaskStats(db);
    const nextChart = await getCompletedByDay(db);

    setStats(nextStats);
    setChart(nextChart);
  }, [db, requireValidSession]);

  useFocusEffect(
    useCallback(() => {
      const timeout = setTimeout(() => {
        loadData();
      }, 240);

      return () => clearTimeout(timeout);
    }, [loadData]),
  );

  const maxCount = Math.max(1, ...chart.map((item) => item.count));

  return (
    <View className="flex-1 bg-slate-50" style={{ paddingBottom: insets.bottom }}>
      <AppHeader title="Beranda" />
      <ScrollView contentContainerClassName="gap-5 p-5">
        <View>
          <Text className="text-2xl font-black text-slate-900">Halo, User! 👋</Text>
          <Text className="mt-1 text-base font-medium text-slate-500">{formatTodayLong()}</Text>
        </View>

        <View className="flex-row gap-4">
          <StatCard label="TUGAS SELESAI" value={stats.completed} color="#4DA85A" />
          <StatCard label="BELUM SELESAI" value={stats.incomplete} color="#D83A34" />
        </View>

        <View className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <Text className="text-base font-extrabold text-slate-900">Selesai 7 Hari Terakhir</Text>
          <View className="mt-5 h-36 flex-row items-end justify-between gap-2">
            {chart.map((item) => {
              const height = 18 + (item.count / maxCount) * 96;

              return (
                <View key={item.date} className="flex-1 items-center gap-2">
                  <Text className="text-xs font-bold text-slate-500">{item.count}</Text>
                  <View className="w-full rounded-t-xl bg-[#45998D]" style={{ height }} />
                  <Text className="text-xs font-bold text-slate-500">{item.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View className="flex-row flex-wrap gap-4">
          {MENU.map((item) => (
            <Pressable
              key={item.route}
              accessibilityRole="button"
              onPress={() => router.push(item.route)}
              className="min-h-36 flex-1 basis-[45%] justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm active:opacity-70"
            >
              <View
                className="h-12 w-12 items-center justify-center rounded-2xl"
                style={{ backgroundColor: item.color }}
              >
                <Ionicons name={item.icon} size={28} color="white" />
              </View>
              <Text className="mt-5 text-base font-extrabold leading-5 text-slate-900">
                {item.title}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
