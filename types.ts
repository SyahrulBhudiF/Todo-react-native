export type TaskCategory = 'important' | 'normal';

export type UserRow = {
  id: number;
  username: string;
  password: string;
  created_at: string;
};

export type TaskRow = {
  id: number;
  title: string;
  description: string;
  due_date: string;
  category: TaskCategory;
  completed: number;
  completed_at: string | null;
  created_at: string;
};

export type Task = {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  category: TaskCategory;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
};

export type TaskStats = {
  completed: number;
  incomplete: number;
};

export type CompletedByDay = {
  date: string;
  label: string;
  count: number;
};

export type CreateTaskInput = {
  title: string;
  description: string;
  dueDate: string;
  category: TaskCategory;
};

export type LoginFormValues = {
  username: string;
  password: string;
};

export type TaskFormValues = {
  dueDate: string;
  title: string;
  description: string;
};

export type PasswordFormValues = {
  currentPassword: string;
  newPassword: string;
};

export type LoginResult = {
  success: boolean;
  user?: {
    username: string;
  };
  message?: string;
};

export type PasswordChangeResult = {
  success: boolean;
  message: string;
};
