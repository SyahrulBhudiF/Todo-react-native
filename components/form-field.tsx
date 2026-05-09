import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, TextInput, type TextInputProps, View } from 'react-native';

type FormFieldProps = TextInputProps & {
  label: string;
  error?: string;
};

export function FormField({ label, error, className, secureTextEntry, ...props }: FormFieldProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const showPasswordToggle = Boolean(secureTextEntry);

  return (
    <View className="gap-2">
      <Text className="text-xs font-extrabold tracking-[2px] text-slate-500">{label}</Text>
      <View className="relative">
        <TextInput
          placeholderTextColor="#94A3B8"
          secureTextEntry={secureTextEntry && !passwordVisible}
          className={`min-h-14 rounded-2xl border bg-white px-4 text-base text-slate-900 ${
            showPasswordToggle ? 'pr-12' : ''
          } ${error ? 'border-red-400' : 'border-slate-200'} ${className ?? ''}`}
          {...props}
        />
        {showPasswordToggle ? (
          <Pressable
            accessibilityLabel={passwordVisible ? 'Sembunyikan password' : 'Tampilkan password'}
            accessibilityRole="button"
            onPress={() => setPasswordVisible((visible) => !visible)}
            className="absolute right-2 top-2 h-10 w-10 items-center justify-center rounded-full active:opacity-70">
            <Ionicons
              name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#64748B"
            />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text className="text-sm font-semibold text-red-500">{error}</Text> : null}
    </View>
  );
}
