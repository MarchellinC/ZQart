import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { firebaseAuth } from '@/services/firebase/auth';
import { firestore } from '@/services/firebase/firestore';
import { initializeDatabase, userRepository } from '@/database';
import { LOCAL_ADMIN_UIDS } from '@/services/firebase/admin-accounts';

type AuthState = { user: User | null; role: 'admin' | 'buyer' | null; ready: boolean };
const AuthContext = createContext<AuthState>({ user: null, role: null, ready: false });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, role: null, ready: false });
  useEffect(() => onAuthStateChanged(firebaseAuth, (user) => {
    void (async () => {
      if (!user) { setState({ user: null, role: null, ready: true }); return; }
      try {
        const db = await initializeDatabase();
        const previous = await userRepository.findById(db, user.uid);
        let cloudRole: string | null = null;
        let cloudRoleLookupSucceeded = false;
        try {
          const profile = await getDoc(doc(firestore, 'users', user.uid));
          cloudRoleLookupSucceeded = true;
          cloudRole = profile.exists() ? String(profile.data().role ?? '') : null;
        } catch (error) {
          console.warn('Cloud role lookup failed; using the last local role.', error);
        }
        const role = cloudRoleLookupSucceeded
          ? cloudRole === 'admin' || LOCAL_ADMIN_UIDS.has(user.uid) ? 'admin' : 'buyer'
          : LOCAL_ADMIN_UIDS.has(user.uid) ? 'admin' : previous?.role ?? 'buyer';
        const name = user.displayName ?? user.email?.split('@')[0] ?? 'Buyer';
        const email = user.email ?? '';
        const changed = !previous || previous.name !== name || previous.email !== email || previous.role !== role;
        await userRepository.save(db, {
          id: user.uid, name, email, role, created_at: previous?.created_at ?? new Date().toISOString(),
          updated_at: changed ? new Date().toISOString() : previous.updated_at,
          sync_status: changed ? 'pending' : previous.sync_status,
        });
        setState({ user, role, ready: true });
      } catch (error) {
        console.error('Local user initialization failed', error);
        setState({ user, role: null, ready: true });
      }
    })();
  }, (error) => {
    console.error('Firebase Auth session check failed', error);
    setState({ user: null, role: null, ready: true });
  }), []);
  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
