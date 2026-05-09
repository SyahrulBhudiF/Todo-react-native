import type { SQLiteDatabase } from 'expo-sqlite';

import { getLastSevenDays, toISODate } from '@/lib/date';
import type { CompletedByDay, CreateTaskInput, Task, TaskRow, TaskStats } from '@/types';

function mapTaskRow(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    dueDate: row.due_date,
    category: row.category,
    completed: row.completed === 1,
    completedAt: row.completed_at,
    createdAt: row.created_at,
  };
}

export async function createTask(db: SQLiteDatabase, input: CreateTaskInput) {
  const result = await db.runAsync(
    `INSERT INTO tasks (title, description, due_date, category, completed)
     VALUES (?, ?, ?, ?, 0)`,
    input.title,
    input.description,
    input.dueDate,
    input.category,
  );

  return result.lastInsertRowId;
}

export async function listTasks(db: SQLiteDatabase): Promise<Task[]> {
  const rows = await db.getAllAsync<TaskRow>(
    `SELECT id, title, description, due_date, category, completed, completed_at, created_at
     FROM tasks
     ORDER BY completed ASC,
       CASE category WHEN 'important' THEN 0 ELSE 1 END ASC,
       datetime(created_at) DESC`,
  );

  return rows.map(mapTaskRow);
}

export async function toggleTaskCompleted(db: SQLiteDatabase, task: Task) {
  if (task.completed) {
    await db.runAsync('UPDATE tasks SET completed = 0, completed_at = NULL WHERE id = ?', task.id);
    return;
  }

  await db.runAsync(
    'UPDATE tasks SET completed = 1, completed_at = ? WHERE id = ?',
    toISODate(new Date()),
    task.id,
  );
}

export async function deleteTask(db: SQLiteDatabase, id: number) {
  await db.runAsync('DELETE FROM tasks WHERE id = ?', id);
}

export async function getTaskStats(db: SQLiteDatabase): Promise<TaskStats> {
  const row = await db.getFirstAsync<{ completed: number; incomplete: number }>(
    `SELECT
      COALESCE(SUM(CASE WHEN completed = 1 THEN 1 ELSE 0 END), 0) AS completed,
      COALESCE(SUM(CASE WHEN completed = 0 THEN 1 ELSE 0 END), 0) AS incomplete
     FROM tasks`,
  );

  return {
    completed: row?.completed ?? 0,
    incomplete: row?.incomplete ?? 0,
  };
}

export async function getCompletedByDay(db: SQLiteDatabase): Promise<CompletedByDay[]> {
  const days = getLastSevenDays();
  const firstDay = days[0]?.date;

  if (!firstDay) {
    return [];
  }

  const rows = await db.getAllAsync<{ date: string; count: number }>(
    `SELECT completed_at AS date, COUNT(*) AS count
     FROM tasks
     WHERE completed = 1 AND completed_at IS NOT NULL AND completed_at >= ?
     GROUP BY completed_at`,
    firstDay,
  );

  const countByDate = new Map(rows.map((row) => [row.date, row.count]));

  return days.map((day) => ({
    ...day,
    count: countByDate.get(day.date) ?? 0,
  }));
}
