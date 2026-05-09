import { useSQLiteContext } from 'expo-sqlite';

import { TaskFormScreen } from '@/components/task-form-screen';
import { createTask } from '@/modules/tasks/repository';
import type { TaskFormValues } from '@/types';

export default function AddNormalScreen() {
  const db = useSQLiteContext();

  return (
    <TaskFormScreen
      category="normal"
      title="Tambah Tugas Biasa"
      color="#4DA85A"
      pillLabel="BIASA"
      titlePlaceholder="Contoh: Beli buah"
      onSubmit={(values: TaskFormValues) =>
        createTask(db, {
          title: values.title.trim(),
          description: values.description.trim(),
          dueDate: values.dueDate,
          category: 'normal',
        }).then(() => undefined)
      }
    />
  );
}
