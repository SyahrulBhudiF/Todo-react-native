import type { SQLiteDatabase } from 'expo-sqlite';

import { env } from '@/lib/env';
import { hashPassword, isPasswordHash, verifyPassword } from '@/modules/auth/password';
import type { LoginResult, PasswordChangeResult, UserRow } from '@/types';

export async function getUserByUsername(db: SQLiteDatabase, username: string) {
  return db.getFirstAsync<UserRow>(
    'SELECT id, username, password, created_at FROM users WHERE username = ?',
    username,
  );
}

export async function validateLogin(
  db: SQLiteDatabase,
  username: string,
  password: string,
): Promise<LoginResult> {
  const user = await getUserByUsername(db, username);
  const success = user?.password
    ? isPasswordHash(user.password) && (await verifyPassword(password, user.password))
    : false;

  return {
    success,
    user: success && user ? { username: user.username } : undefined,
    message: success ? undefined : 'Username atau password salah',
  };
}

export async function changePassword(
  db: SQLiteDatabase,
  currentPassword: string,
  newPassword: string,
): Promise<PasswordChangeResult> {
  const user = await getUserByUsername(db, env.defaultUsername);

  const validCurrentPassword = user?.password
    ? isPasswordHash(user.password) && (await verifyPassword(currentPassword, user.password))
    : false;

  if (!user || !validCurrentPassword) {
    return {
      success: false,
      message: 'Password saat ini tidak sesuai',
    };
  }

  const passwordHash = await hashPassword(newPassword);
  await db.runAsync('UPDATE users SET password = ? WHERE id = ?', passwordHash, user.id);

  return {
    success: true,
    message: 'Password berhasil diubah',
  };
}
