type EnvConfig = {
  name: string;
  value: string | undefined;
  type: 'string' | 'number';
};

type ParsedEnv<T extends EnvConfig> = T['type'] extends 'number' ? number : string;

const envSchema = {
  databaseName: {
    name: 'EXPO_PUBLIC_DATABASE_NAME',
    value: process.env.EXPO_PUBLIC_DATABASE_NAME,
    type: 'string',
  },
  databaseVersion: {
    name: 'EXPO_PUBLIC_DATABASE_VERSION',
    value: process.env.EXPO_PUBLIC_DATABASE_VERSION,
    type: 'number',
  },
  defaultUsername: {
    name: 'EXPO_PUBLIC_DEFAULT_USERNAME',
    value: process.env.EXPO_PUBLIC_DEFAULT_USERNAME,
    type: 'string',
  },
  defaultPassword: {
    name: 'EXPO_PUBLIC_DEFAULT_PASSWORD',
    value: process.env.EXPO_PUBLIC_DEFAULT_PASSWORD,
    type: 'string',
  },
  sessionKey: {
    name: 'EXPO_PUBLIC_SESSION_KEY',
    value: process.env.EXPO_PUBLIC_SESSION_KEY,
    type: 'string',
  },
  sessionTtlDays: {
    name: 'EXPO_PUBLIC_SESSION_TTL_DAYS',
    value: process.env.EXPO_PUBLIC_SESSION_TTL_DAYS,
    type: 'number',
  },
} as const;

function parseEnv<T extends EnvConfig>(config: T): ParsedEnv<T> {
  if (!config.value) {
    throw new Error(`Missing environment variable: ${config.name}`);
  }

  if (config.type === 'number') {
    const numberValue = Number(config.value);

    if (!Number.isFinite(numberValue)) {
      throw new Error(`Invalid number environment variable: ${config.name}`);
    }

    return numberValue as ParsedEnv<T>;
  }

  return config.value as ParsedEnv<T>;
}

export const env = {
  databaseName: parseEnv(envSchema.databaseName),
  databaseVersion: parseEnv(envSchema.databaseVersion),
  defaultUsername: parseEnv(envSchema.defaultUsername),
  defaultPassword: parseEnv(envSchema.defaultPassword),
  sessionKey: parseEnv(envSchema.sessionKey),
  sessionTtlDays: parseEnv(envSchema.sessionTtlDays),
};
