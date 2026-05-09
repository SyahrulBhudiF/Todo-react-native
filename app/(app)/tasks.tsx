import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { useNotificationStore } from '@/components/app-notifications';
import { formatIndonesianDate } from '@/lib/date';
import { deleteTask, listTasks, toggleTaskCompleted } from '@/modules/tasks/repository';
import type { Task } from '@/types';

function TaskCard({
  task,
  onDelete,
  onToggle,
}: {
  task: Task;
  onDelete: (task: Task) => void;
  onToggle: (task: Task) => void;
}) {
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

      <Pressable
        accessibilityRole="button"
        onPress={(event) => {
          event.stopPropagation();
          onDelete(task);
        }}
        className="h-10 w-10 items-center justify-center rounded-full bg-red-50 active:opacity-70"
      >
        <Ionicons name="trash-outline" size={20} color="#D83A34" />
      </Pressable>
    </Pressable>
  );
}

export default function TasksScreen() {
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const showAlert = useNotificationStore((state) => state.showAlert);
  const showToast = useNotificationStore((state) => state.showToast);
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
    showToast({
      title: task.completed ? 'Tugas dibuka lagi' : 'Tugas selesai',
      message: task.title,
      tone: 'success',
    });
    if (isFocused) await loadTasks();
  };

  const handleDelete = (task: Task) => {
    showAlert({
      title: 'Hapus tugas?',
      message: `Tugas "${task.title}" akan dihapus permanen.`,
      actions: [
        { text: 'Batal' },
        {
          text: 'Hapus',
          onPress: async () => {
            await deleteTask(db, task.id);
            showToast({ title: 'Tugas dihapus', message: task.title, tone: 'info' });
            if (isFocused) await loadTasks();
          },
        },
      ],
    });
  };

  return (
    <View className="flex-1 bg-slate-50" style={{ paddingBottom: insets.bottom }}>
      <AppHeader title="Daftar Tugas" showBack />
      <FlatList
        data={tasks}
        keyExtractor={(item) => String(item.id)}
        contentContainerClassName="p-5"
        renderItem={({ item }) => (
          <TaskCard task={item} onDelete={handleDelete} onToggle={handleToggle} />
        )}
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
    </View>
  );
}
