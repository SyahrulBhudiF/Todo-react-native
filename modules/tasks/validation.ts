import { z } from 'zod';

export const taskFormSchema = z.object({
  dueDate: z.string().min(1, 'Tanggal jatuh tempo wajib diisi'),
  title: z.string().trim().min(1, 'Judul tugas wajib diisi'),
  description: z.string().trim().min(1, 'Deskripsi wajib diisi'),
});
