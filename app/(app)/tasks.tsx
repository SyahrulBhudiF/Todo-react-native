import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { formatIndonesianDate } from '@/lib/date';
import { listTasks, toggleTaskCompleted } from '@/modules/tasks/repository';
import type { Task } from '@/types';

function TaskCard({ task, onToggle }: { task: Task; onToggle: (task: Task) => void }) {
  const color = task.category === 'important' ? '#D83A34' : '#4DA85A';
  const categoryLabel = task.category === 'important' ? 'Penting' : 'Biasa';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onToggle(task)}
      className="mb-4 flex-row items-center gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm active:opacity-70"
    >
      <View
        className={`h-7 w-7 items-center justify-center rounded-lg border-2 ${
          task.completed ? 'border-[#45998D] bg-[#45998D]' : 'border-slate-300 bg-white'
        }`}
      >
        {task.completed ? <Ionicons name="checkmark" size={18} color="white" /> : null}
      </View>

      <View className="flex-1">
        <Text
          className={`text-base font-extrabold ${
            task.completed ? 'text-slate-400 line-through' : 'text-slate-900'
          }`}
        >
          {task.title}
        </Text>
        <Text className="mt-1 text-sm font-medium text-slate-500">
          {formatIndonesianDate(task.dueDate)} · {categoryLabel}
        </Text>
        {task.description ? (
          <Text className="mt-2 text-sm text-slate-500" numberOfLines={2}>
            {task.description}
          </Text>
        ) : null}
      </View>

      <Ionicons name="play" size={24} color={color} />
    </Pressable>
  );
}

export default function TasksScreen() {
  const db = useSQLiteContext();
  const isFocused = useIsFocused();
  const [tasks, setTasks] = useState<Task[]>([]);

  const loadTasks = useCallback(async () => {
    const nextTasks = await listTasks(db);
    if (isFocused) setTasks(nextTasks);
  }, [db, isFocused]);

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [loadTasks]),
  );

  const handleToggle = async (task: Task) => {
    await toggleTaskCompleted(db, task);
    if (isFocused) await loadTasks();
  };

  return (
    <SafeAreaView edges={['bottom']} className="flex-1 bg-slate-50">
      <AppHeader title="Daftar Tugas" showBack />
      <FlatList
        data={tasks}
        keyExtractor={(item) => String(item.id)}
        contentContainerClassName="p-5"
        renderItem={({ item }) => <TaskCard task={item} onToggle={handleToggle} />}
        ListEmptyComponent={
          <View className="mt-24 items-center rounded-3xl border border-dashed border-slate-300 bg-white p-8">
            <Ionicons name="clipboard-outline" size={58} color="#94A3B8" />
            <Text className="mt-4 text-xl font-black text-slate-900">Belum ada tugas</Text>
            <Text className="mt-2 text-center text-base text-slate-500">
              Tambahkan tugas penting atau biasa dari halaman Beranda.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
