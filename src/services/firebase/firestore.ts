import { getFirestore } from 'firebase/firestore';
import { firebaseApp } from './config';

export const firestore = (() => {
  try {
    return getFirestore(firebaseApp);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Cloud Firestore initialization failed: ${message}`);
  }
})();
