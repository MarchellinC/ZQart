import AsyncStorage from '@react-native-async-storage/async-storage';
import { Auth, getAuth, initializeAuth } from 'firebase/auth';
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
