import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { firebaseAuth } from '@/services/firebase/auth';
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
        const role = LOCAL_ADMIN_UIDS.has(user.uid) ? 'admin' : 'buyer';
        await userRepository.save(db, {
          id: user.uid, name: user.displayName ?? user.email?.split('@')[0] ?? 'Buyer',
          email: user.email ?? '', role, created_at: previous?.created_at ?? new Date().toISOString(),
          sync_status: 'pending',
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
