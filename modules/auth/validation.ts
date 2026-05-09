import { z } from 'zod';

const strongPasswordSchema = z
  .string()
  .min(4, 'Password minimal 4 karakter')
  .regex(/[A-Z]/, 'Password wajib memiliki minimal 1 huruf besar')
  .regex(/[a-z]/, 'Password wajib memiliki minimal 1 huruf kecil')
  .regex(/[0-9]/, 'Password wajib memiliki minimal 1 angka')
  .regex(/[^A-Za-z0-9]/, 'Password wajib memiliki minimal 1 karakter spesial');

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username wajib diisi'),
  password: z.string().min(1, 'Password wajib diisi'),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Password saat ini wajib diisi'),
  newPassword: strongPasswordSchema,
});
