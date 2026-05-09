import { Ionicons } from '@expo/vector-icons';
import { useForm } from '@tanstack/react-form';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useNotificationStore } from '@/components/app-notifications';
import { FormField } from '@/components/form-field';
import { PrimaryButton } from '@/components/primary-button';
import { validateLogin } from '@/modules/auth/repository';
import { useAuthSessionStore } from '@/modules/auth/session-store';
import { loginSchema } from '@/modules/auth/validation';
import type { LoginFormValues } from '@/types';

function getFirstError(field: { state: { meta: { errors: unknown[] } } }) {
  const first = field.state.meta.errors[0];

  if (!first) return undefined;
  if (typeof first === 'string') return first;
  if (typeof first === 'object' && 'message' in first && typeof first.message === 'string') {
    return first.message;
  }

  return 'Input tidak valid';
}

export default function LoginScreen() {
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();
  const login = useAuthSessionStore((state) => state.login);
  const showAlert = useNotificationStore((state) => state.showAlert);
  const showToast = useNotificationStore((state) => state.showToast);
  const [loading, setLoading] = useState(false);

  const form = useForm({
    defaultValues: {
      username: '',
      password: '',
    } as LoginFormValues,
    validators: {
      onBlur: loginSchema,
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value }) => {
      setLoading(true);
      try {
        const result = await validateLogin(db, value.username.trim(), value.password);

        if (!result.success) {
          showAlert({
            title: 'Login gagal',
            message: result.message ?? 'Username atau password salah',
          });
          return;
        }

        await login(result.user!);
        showToast({ title: 'Login berhasil', message: 'Selamat datang kembali', tone: 'success' });
        router.replace('/');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <View className="flex-1 bg-slate-50" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="flex-grow justify-center px-6 py-10"
        >
          <View className="items-center">
            <View className="h-20 w-20 items-center justify-center rounded-3xl bg-[#45998D] shadow-lg">
              <Ionicons name="clipboard-outline" size={42} color="white" />
            </View>
            <Text className="mt-6 text-center text-4xl font-black text-slate-900">
              Agenda Nusantara
            </Text>
            <Text className="mt-2 text-center text-base font-medium text-slate-500">
              Kelola tugasmu, raih harimu
            </Text>
          </View>

          <View className="mt-10 gap-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <form.Field name="username">
              {(field) => (
                <FormField
                  label="USERNAME"
                  placeholder="user"
                  autoCapitalize="none"
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  onBlur={field.handleBlur}
                  error={getFirstError(field)}
                />
              )}
            </form.Field>

            <form.Field name="password">
              {(field) => (
                <FormField
                  label="PASSWORD"
                  placeholder="••••"
                  secureTextEntry
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  onBlur={field.handleBlur}
                  error={getFirstError(field)}
                />
              )}
            </form.Field>

            <PrimaryButton label="LOGIN" loading={loading} onPress={() => form.handleSubmit()} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
