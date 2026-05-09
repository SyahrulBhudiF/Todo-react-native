import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { AppState } from 'react-native';
import { create } from 'zustand';

import { env } from '@/lib/env';

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * env.sessionTtlDays;

type SessionStatus = 'checking' | 'authenticated' | 'unauthenticated';

type StoredSession = {
  token: string;
  expiresAt: number;
  user: {
    username: string;
  };
};

type AuthSessionState = {
  status: SessionStatus;
  accessToken?: string;
  user?: StoredSession['user'];
  bootstrapSession: () => Promise<void>;
  login: (user: StoredSession['user']) => Promise<void>;
  refreshSession: () => Promise<boolean>;
  requireValidSession: () => Promise<boolean>;
  logout: () => Promise<void>;
};

function createSession(user: StoredSession['user']): StoredSession {
  return {
    token: Crypto.randomUUID(),
    expiresAt: Date.now() + SESSION_TTL_MS,
    user,
  };
}

async function readStoredSession() {
  const rawSession = await SecureStore.getItemAsync(env.sessionKey);
  if (!rawSession) return undefined;

  try {
    return JSON.parse(rawSession) as StoredSession;
  } catch {
    await SecureStore.deleteItemAsync(env.sessionKey);
    return undefined;
  }
}

async function persistSession(session: StoredSession) {
  await SecureStore.setItemAsync(env.sessionKey, JSON.stringify(session));
}

export const useAuthSessionStore = create<AuthSessionState>((set, get) => ({
  status: 'checking',
  bootstrapSession: async () => {
    set({ status: 'checking' });
    const valid = await get().refreshSession();

    if (!valid) {
      set({ status: 'unauthenticated', accessToken: undefined, user: undefined });
    }
  },
  login: async (user) => {
    const session = createSession(user);
    await persistSession(session);
    set({ status: 'authenticated', accessToken: session.token, user: session.user });
  },
  refreshSession: async () => {
    const session = await readStoredSession();

    if (!session) return false;

    if (session.expiresAt <= Date.now()) {
      await SecureStore.deleteItemAsync(env.sessionKey);
      set({ status: 'unauthenticated', accessToken: undefined, user: undefined });
      return false;
    }

    set({ status: 'authenticated', accessToken: session.token, user: session.user });
    return true;
  },
  requireValidSession: async () => {
    const valid = await get().refreshSession();

    if (!valid) {
      set({ status: 'unauthenticated', accessToken: undefined, user: undefined });
    }

    return valid;
  },
  logout: async () => {
    await SecureStore.deleteItemAsync(env.sessionKey);
    set({ status: 'unauthenticated', accessToken: undefined, user: undefined });
  },
}));

AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    void useAuthSessionStore.getState().requireValidSession();
  }
});
