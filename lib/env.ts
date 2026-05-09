function requireEnv(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

function requireNumberEnv(name: string, value: string | undefined) {
  const numberValue = Number(requireEnv(name, value));

  if (!Number.isFinite(numberValue)) {
    throw new Error(`Invalid number environment variable: ${name}`);
  }

  return numberValue;
}

export const env = {
  databaseName: requireEnv('EXPO_PUBLIC_DATABASE_NAME', process.env.EXPO_PUBLIC_DATABASE_NAME),
  databaseVersion: requireNumberEnv(
    'EXPO_PUBLIC_DATABASE_VERSION',
    process.env.EXPO_PUBLIC_DATABASE_VERSION,
  ),
  defaultUsername: requireEnv(
    'EXPO_PUBLIC_DEFAULT_USERNAME',
    process.env.EXPO_PUBLIC_DEFAULT_USERNAME,
  ),
  defaultPassword: requireEnv(
    'EXPO_PUBLIC_DEFAULT_PASSWORD',
    process.env.EXPO_PUBLIC_DEFAULT_PASSWORD,
  ),
  sessionKey: requireEnv('EXPO_PUBLIC_SESSION_KEY', process.env.EXPO_PUBLIC_SESSION_KEY),
  sessionTtlDays: requireNumberEnv(
    'EXPO_PUBLIC_SESSION_TTL_DAYS',
    process.env.EXPO_PUBLIC_SESSION_TTL_DAYS,
  ),
};
