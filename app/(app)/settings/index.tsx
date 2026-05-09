import { Ionicons } from '@expo/vector-icons';
import { useForm } from '@tanstack/react-form';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Image,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/AppHeader';
import { useNotificationStore } from '@/components/AppNotifications';
import { FormField } from '@/components/FormField';
import { PrimaryButton } from '@/components/PrimaryButton';
import { changePassword } from '@/modules/auth/repository';
import { useAuthSessionStore } from '@/modules/auth/session-store';
import { passwordChangeSchema } from '@/modules/auth/validation';
import type { PasswordFormValues } from '@/types';

function getFirstError(field: { state: { meta: { errors: unknown[] } } }) {
  const first = field.state.meta.errors[0];

  if (!first) return undefined;
  if (typeof first === 'string') return first;
  if (typeof first === 'object' && 'message' in first && typeof first.message === 'string') {
    return first.message;
  }

  return 'Input tidak valid';
}

export default function SettingsScreen() {
  const db = useSQLiteContext();
  const insets = useSafeAreaInsets();
  const logout = useAuthSessionStore((state) => state.logout);
  const showAlert = useNotificationStore((state) => state.showAlert);
  const showToast = useNotificationStore((state) => state.showToast);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    await logout();
    showToast({ title: 'Logout berhasil', message: 'Sesi sudah ditutup', tone: 'info' });
    router.replace('/sign-in');
  };

  const form = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
    } as PasswordFormValues,
    validators: {
      onSubmit: passwordChangeSchema,
    },
    onSubmit: async ({ value }) => {
      setLoading(true);
      try {
        const result = await changePassword(db, value.currentPassword, value.newPassword);

        if (!result.success) {
          showAlert({ title: 'Gagal', message: result.message });
          return;
        }

        form.reset();
        showToast({ title: 'Password diperbarui', message: result.message, tone: 'success' });
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <View className="flex-1 bg-slate-50" style={{ paddingBottom: insets.bottom }}>
      <AppHeader
        title="Pengaturan"
        showBack
        rightAction={
          <Pressable
            accessibilityRole="button"
            onPress={handleLogout}
            className="h-10 w-10 items-center justify-center rounded-full active:opacity-70"
          >
            <Ionicons name="log-out-outline" size={24} color="white" />
          </Pressable>
        }
      />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerClassName="gap-5 p-5" keyboardShouldPersistTaps="handled">
          <Text className="text-sm font-extrabold tracking-[2px] text-slate-500">
            GANTI PASSWORD
          </Text>

          <View className="gap-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <form.Field name="currentPassword">
              {(field) => (
                <FormField
                  label="PASSWORD SAAT INI"
                  placeholder="Masukkan password saat ini"
                  secureTextEntry
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  error={getFirstError(field)}
                />
              )}
            </form.Field>

            <form.Field name="newPassword">
              {(field) => (
                <FormField
                  label="PASSWORD BARU"
                  placeholder="Masukkan password baru"
                  secureTextEntry
                  value={field.state.value}
                  onChangeText={field.handleChange}
                  error={getFirstError(field)}
                />
              )}
            </form.Field>

            <PrimaryButton
              label="SIMPAN PASSWORD"
              loading={loading}
              onPress={() => form.handleSubmit()}
            />
          </View>

          <View className="items-center rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <Image
              source={{
                uri: 'https://media.licdn.com/dms/image/v2/D4D03AQEz-Of2ybGExg/profile-displayphoto-shrink_200_200/B4DZPFE.2CHUAY-/0/1734178238816?e=1779926400&v=beta&t=sDTIDNqjQNeGYgyvBkjzoGx9plTxl4HL9tpoSN3kBEo',
              }}
              className="h-24 w-24 rounded-full bg-slate-100"
            />
            <Text className="mt-4 text-center text-xl font-black text-slate-900">
              Syahrul Bhudi Ferdiansyah
            </Text>
            <Text className="mt-1 text-center text-base font-bold text-slate-500">
              NIM: 2241720167
            </Text>
            <View className="mt-4 flex-row items-center gap-2 rounded-full bg-slate-100 px-4 py-2">
              <Ionicons name="code-slash-outline" size={18} color="#68758A" />
              <Text className="text-xs font-extrabold tracking-[1.5px] text-slate-500">
                DEVELOPER APLIKASI
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
