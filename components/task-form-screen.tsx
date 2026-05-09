import DateTimePicker from '@react-native-community/datetimepicker';
import { useForm } from '@tanstack/react-form';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { useNotificationStore } from '@/components/app-notifications';
import { FormField } from '@/components/form-field';
import { PrimaryButton } from '@/components/primary-button';
import { formatIndonesianDate, parseISODate, toISODate } from '@/lib/date';
import { taskFormSchema } from '@/modules/tasks/validation';
import type { TaskCategory, TaskFormValues } from '@/types';

type TaskFormScreenProps = {
  category: TaskCategory;
  title: string;
  color: string;
  pillLabel: string;
  titlePlaceholder: string;
  onSubmit: (values: TaskFormValues) => Promise<void>;
};

function getFirstError(field: { state: { meta: { errors: unknown[] } } }) {
  const first = field.state.meta.errors[0];

  if (!first) return undefined;
  if (typeof first === 'string') return first;
  if (typeof first === 'object' && 'message' in first && typeof first.message === 'string') {
    return first.message;
  }

  return 'Input tidak valid';
}

export function TaskFormScreen({
  category: _category,
  title,
  color,
  pillLabel,
  titlePlaceholder,
  onSubmit,
}: TaskFormScreenProps) {
  const insets = useSafeAreaInsets();
  const showAlert = useNotificationStore((state) => state.showAlert);
  const showToast = useNotificationStore((state) => state.showToast);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const today = toISODate(new Date());

  const form = useForm({
    defaultValues: {
      dueDate: today,
      title: '',
      description: '',
    } as TaskFormValues,
    validators: {
      onSubmit: taskFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        setLoading(true);
        await onSubmit(value);
        showToast({ title: 'Tugas dibuat', message: 'Tugas berhasil disimpan', tone: 'success' });
        router.back();
      } catch {
        showAlert({ title: 'Gagal', message: 'Tugas belum bisa disimpan. Coba lagi.' });
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <View className="flex-1 bg-slate-50" style={{ paddingBottom: insets.bottom }}>
      <AppHeader title={title} color={color} showBack />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerClassName="gap-5 p-5" keyboardShouldPersistTaps="handled">
        <View className="items-start">
          <Text
            className="rounded-full px-4 py-2 text-xs font-extrabold tracking-[2px] text-white"
            style={{ backgroundColor: color }}
          >
            {pillLabel}
          </Text>
        </View>

        <form.Field name="dueDate">
          {(field) => (
            <View className="gap-2">
              <Text className="text-xs font-extrabold tracking-[2px] text-slate-500">
                TANGGAL JATUH TEMPO
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => setShowPicker(true)}
                className="min-h-14 justify-center rounded-2xl border border-slate-200 bg-white px-4 active:opacity-70"
              >
                <Text className="text-base font-semibold text-slate-900">
                  {formatIndonesianDate(field.state.value)}
                </Text>
              </Pressable>
              {getFirstError(field) ? (
                <Text className="text-sm font-semibold text-red-500">{getFirstError(field)}</Text>
              ) : null}
              {showPicker ? (
                <DateTimePicker
                  value={parseISODate(field.state.value)}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(_, selectedDate) => {
                    if (Platform.OS !== 'ios') setShowPicker(false);
                    if (selectedDate) field.handleChange(toISODate(selectedDate));
                  }}
                />
              ) : null}
            </View>
          )}
        </form.Field>

        <form.Field name="title">
          {(field) => (
            <FormField
              label="JUDUL TUGAS"
              placeholder={titlePlaceholder}
              value={field.state.value}
              onChangeText={field.handleChange}
              error={getFirstError(field)}
            />
          )}
        </form.Field>

        <form.Field name="description">
          {(field) => (
            <FormField
              label="DESKRIPSI"
              placeholder="Jelaskan tugas..."
              value={field.state.value}
              onChangeText={field.handleChange}
              error={getFirstError(field)}
              multiline
              textAlignVertical="top"
              className="min-h-32 py-4"
            />
          )}
        </form.Field>

          <PrimaryButton
            label="SIMPAN"
            color={color}
            loading={loading}
            onPress={() => form.handleSubmit()}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
