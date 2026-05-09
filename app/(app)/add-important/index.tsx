import { useSQLiteContext } from 'expo-sqlite';

import { TaskFormScreen } from '@/components/TaskFormScreen';
import { createTask } from '@/modules/tasks/repository';
import type { TaskFormValues } from '@/types';

export default function AddImportantScreen() {
  const db = useSQLiteContext();

  return (
    <TaskFormScreen
      category="important"
      title="Tambah Tugas Penting"
      color="#D83A34"
      pillLabel="PENTING"
      titlePlaceholder="Contoh: Submit laporan"
      onSubmit={(values: TaskFormValues) =>
        createTask(db, {
          title: values.title.trim(),
          description: values.description.trim(),
          dueDate: values.dueDate,
          category: 'important',
        }).then(() => undefined)
      }
    />
  );
}
