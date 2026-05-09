import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { create } from 'zustand';

type NotificationTone = 'success' | 'error' | 'info';

type NotificationAction = {
  text: string;
  onPress?: () => void;
};

type Notification = {
  id: number;
  title: string;
  message?: string;
  tone: NotificationTone;
  actions?: NotificationAction[];
  autoClose: boolean;
};

type NotificationState = {
  notification?: Notification;
  showToast: (toast: Omit<Notification, 'id' | 'actions' | 'autoClose'>) => void;
  hideToast: () => void;
  showAlert: (alert: {
    title: string;
    message: string;
    actions?: NotificationAction[];
    tone?: NotificationTone;
  }) => void;
  hideAlert: () => void;
};

const toneStyle = {
  success: {
    icon: 'checkmark-circle' as const,
    iconColor: '#16A34A',
  },
  error: {
    icon: 'alert-circle' as const,
    iconColor: '#DC2626',
  },
  info: {
    icon: 'information-circle' as const,
    iconColor: '#2563EB',
  },
};

export const useNotificationStore = create<NotificationState>((set) => ({
  showToast: (toast) => {
    set({ notification: { ...toast, id: Date.now(), autoClose: true } });
  },
  hideToast: () => set({ notification: undefined }),
  showAlert: (alert) => {
    set({
      notification: {
        id: Date.now(),
        title: alert.title,
        message: alert.message,
        tone: alert.tone ?? 'error',
        actions: alert.actions ?? [{ text: 'OK' }],
        autoClose: false,
      },
    });
  },
  hideAlert: () => set({ notification: undefined }),
}));

export function AppNotifications() {
  const notification = useNotificationStore((state) => state.notification);
  const hideToast = useNotificationStore((state) => state.hideToast);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-16)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    if (!notification) return;

    opacity.setValue(0);
    translateY.setValue(-16);
    scale.setValue(0.96);

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [notification, opacity, scale, translateY]);

  useEffect(() => {
    if (!notification?.autoClose) return;

    const timeout = setTimeout(hideToast, 2600);
    return () => clearTimeout(timeout);
  }, [hideToast, notification]);

  if (!notification) return null;

  const style = toneStyle[notification.tone];

  return (
    <View pointerEvents="box-none" className="absolute left-0 right-0 top-10 z-50 items-center px-4">
      <Animated.View
        className="w-full max-w-[420px] rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xl"
        style={{ opacity, transform: [{ translateY }, { scale }] }}
      >
        <View className="flex-row items-start gap-3">
          <View className="mt-0.5">
            <Ionicons name={style.icon} size={20} color={style.iconColor} />
          </View>

          <View className="flex-1">
            <Text className="text-[15px] font-bold leading-5 text-slate-950">{notification.title}</Text>
            {notification.message ? (
              <Text className="mt-0.5 text-[13px] font-medium leading-5 text-slate-500">
                {notification.message}
              </Text>
            ) : null}

            {notification.actions ? (
              <View className="mt-3 flex-row justify-end gap-2">
                {notification.actions.map((action, index) => {
                  const primary = index === notification.actions!.length - 1;

                  return (
                    <Pressable
                      key={action.text}
                      accessibilityRole="button"
                      onPress={() => {
                        hideToast();
                        action.onPress?.();
                      }}
                      className={`min-h-9 justify-center rounded-md px-3 active:opacity-70 ${
                        primary ? 'bg-slate-950' : 'bg-transparent'
                      }`}
                    >
                      <Text
                        className={`text-[13px] font-semibold ${primary ? 'text-white' : 'text-slate-600'}`}
                      >
                        {action.text}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </View>

          <Pressable accessibilityRole="button" onPress={hideToast} className="-mr-1 p-1 active:opacity-60">
            <Ionicons name="close" size={17} color="#94A3B8" />
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}
