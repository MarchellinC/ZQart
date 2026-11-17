import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Auth, createUserWithEmailAndPassword, getAuth, initializeAuth,
  signInWithEmailAndPassword, signOut, updateProfile,
} from 'firebase/auth';
// Firebase 13.3.0 exposes this through its React Native entry, but omits it from shared declarations.
// @ts-expect-error The React Native runtime entry for firebase/auth exports this API.
import { getReactNativePersistence } from 'firebase/auth';
import { firebaseApp } from './config';

function isAlreadyInitialized(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error
    && error.code === 'auth/already-initialized';
}

function createAuth(): Auth {
  try {
    return initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    if (isAlreadyInitialized(error)) return getAuth(firebaseApp);
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Firebase Authentication initialization failed: ${message}`);
  }
}

export const firebaseAuth = createAuth();

export async function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
}

export async function register(email: string, password: string, displayName: string) {
  const credential = await createUserWithEmailAndPassword(firebaseAuth, email.trim(), password);
  await updateProfile(credential.user, { displayName: displayName.trim() });
  return credential;
}

export function logOut() {
  return signOut(firebaseAuth);
}

export function getAuthErrorMessage(error: unknown): string {
  const code = typeof error === 'object' && error !== null && 'code' in error
    ? String(error.code) : '';
  const messages: Record<string, string> = {
    'auth/invalid-email': 'Format email tidak valid.',
    'auth/invalid-credential': 'Email atau kata sandi salah.',
    'auth/email-already-in-use': 'Email ini sudah terdaftar. Silakan masuk.',
    'auth/weak-password': 'Kata sandi terlalu lemah (minimal 6 karakter).',
    'auth/network-request-failed': 'Koneksi gagal. Periksa internet dan coba lagi.',
    'auth/too-many-requests': 'Terlalu banyak percobaan. Coba lagi nanti.',
  };
  return messages[code] ?? 'Autentikasi gagal. Periksa data dan coba lagi.';
}
