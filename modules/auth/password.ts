import { compare, genSalt, hash, setRandomFallback } from 'bcryptjs';
import { getRandomBytes } from 'expo-crypto';

setRandomFallback((length) => Array.from(getRandomBytes(length)));

const SALT_ROUNDS = 10;

export async function hashPassword(password: string) {
  return hash(password, await genSalt(SALT_ROUNDS));
}

export async function verifyPassword(password: string, passwordHash: string) {
  return compare(password, passwordHash);
}

export function isPasswordHash(value: string) {
  return value.startsWith('$2a$') || value.startsWith('$2b$') || value.startsWith('$2y$');
}
