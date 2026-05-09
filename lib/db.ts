import type { SQLiteDatabase } from 'expo-sqlite';

import { env } from '@/lib/env';
import { hashPassword } from '@/modules/auth/password';

export const DATABASE_NAME = env.databaseName;

async function getDefaultPasswordHash() {
  return hashPassword(env.defaultPassword);
}

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  await db.execAsync('PRAGMA journal_mode = WAL');

  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = result?.user_version ?? 0;

  if (currentVersion >= env.databaseVersion) {
    return;
  }

  if (currentVersion < 1) {
    const defaultPasswordHash = await getDefaultPasswordHash();

    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        due_date TEXT NOT NULL,
        category TEXT NOT NULL CHECK (category IN ('important', 'normal')),
        completed INTEGER NOT NULL DEFAULT 0,
        completed_at TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
      CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
      CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
    `);

    await db.runAsync(
      'INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)',
      env.defaultUsername,
      defaultPasswordHash,
    );
    await db.execAsync('PRAGMA user_version = 1');
  }

  if (currentVersion < 2) {
    const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(users)');
    const hasPassword = columns.some((column) => column.name === 'password');
    const hasPasswordHash = columns.some((column) => column.name === 'password_hash');

    if (hasPasswordHash && !hasPassword) {
      await db.execAsync(`
        CREATE TABLE users_password (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await db.execAsync(`
        INSERT INTO users_password (id, username, password, created_at)
        SELECT id, username, password_hash, created_at FROM users;
        DROP TABLE users;
        ALTER TABLE users_password RENAME TO users;
      `);
    }

    await db.execAsync('PRAGMA user_version = 2');
  }

  if (currentVersion < 3) {
    await db.runAsync('DELETE FROM users WHERE username = ?', env.defaultUsername);
    await db.runAsync(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      env.defaultUsername,
      await getDefaultPasswordHash(),
    );
    await db.execAsync(`PRAGMA user_version = ${env.databaseVersion}`);
  }
}
