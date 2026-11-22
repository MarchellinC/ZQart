import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { collection, onSnapshot, query, updateDoc, doc } from 'firebase/firestore';
import { AdminLayout } from '@/components/admin-layout';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { useAuth } from '@/contexts/auth-context';
import { firestore } from '@/services/firebase/firestore';
import { LOCAL_ADMIN_UIDS } from '@/services/firebase/admin-accounts';
import { Palette } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/theme';

type ManagedUser = { id: string; name: string; email: string; role: 'admin' | 'buyer' };
export default function AdminUsersScreen() {
  const { role, ready, user } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [pending, setPending] = useState<ManagedUser | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (role !== 'admin') return;
    return onSnapshot(query(collection(firestore, 'users')), (snapshot) => {
      setUsers(snapshot.docs.map((entry) => {
        const data = entry.data();
        const userRole: ManagedUser['role'] = data.role === 'admin' ? 'admin' : 'buyer';
        return { id: entry.id, name: String(data.name ?? 'Pengguna'), email: String(data.email ?? ''),
          role: userRole };
      }).sort((a, b) => a.name.localeCompare(b.name, 'id')));
      setError('');
    }, (cause) => setError(cause.message));
  }, [role]);

  if (!ready || role !== 'admin') return <View style={styles.denied}><Text style={styles.title}>Akses admin tidak tersedia</Text></View>;

  async function saveRole() {
    if (!pending) return;
    const target = pending;
    const nextRole = target.role === 'admin' ? 'buyer' : 'admin';
    setBusy(true);
    try {
      await updateDoc(doc(firestore, 'users', target.id), { role: nextRole, updated_at: new Date().toISOString() });
      setPending(null);
      Alert.alert('Role berhasil diubah', `${target.name} sekarang berperan sebagai ${nextRole}. Perubahan terlihat setelah pengguna masuk ulang.`);
    } catch (cause) {
      Alert.alert('Role gagal diubah', cause instanceof Error ? cause.message : String(cause));
    } finally { setBusy(false); }
  }

  return <AdminLayout title="Kelola pengguna" subtitle="Atur akses buyer dan admin tanpa mengubah UID di Rules." active="users">
    <View style={styles.info}><Text style={styles.infoTitle}>Akses akun</Text>
      <Text style={styles.infoText}>Perubahan role tersimpan di Firestore. Pengguna perlu masuk ulang agar aplikasi memuat role terbaru.</Text></View>
    {error ? <View style={styles.errorCard}><Text style={styles.errorTitle}>Daftar pengguna gagal dimuat</Text><Text style={styles.body}>{error}</Text></View> : null}
    {!error && !users.length ? <Text style={styles.body}>Belum ada profil pengguna tersimpan.</Text> : null}
    {users.map((item) => {
      const protectedAdmin = LOCAL_ADMIN_UIDS.has(item.id);
      const isCurrentUser = item.id === user?.uid;
      const locked = protectedAdmin;
      return <View key={item.id} style={styles.card}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}{isCurrentUser ? ' (Anda)' : ''}</Text>
          <Text style={styles.body}>{item.email}</Text>
          <Text style={[styles.role, item.role === 'admin' && styles.adminRole]}>{item.role === 'admin' ? 'ADMIN' : 'BUYER'}</Text>
        </View>
        <Pressable disabled={locked} style={[styles.action, locked && styles.disabled]}
          onPress={() => setPending(item)}>
          <Text style={styles.actionText}>{locked ? 'Admin utama' : item.role === 'admin' ? 'Jadikan buyer' : 'Jadikan admin'}</Text>
        </Pressable>
      </View>;
    })}
    <ConfirmDialog visible={pending !== null} title="Ubah role pengguna?"
      message={pending ? `${pending.name} akan diubah menjadi ${pending.role === 'admin' ? 'buyer' : 'admin'}.` : ''}
      confirmLabel={busy ? 'Menyimpan…' : 'Ya, ubah role'} onCancel={() => { if (!busy) setPending(null); }}
      onConfirm={() => { void saveRole(); }} />
  </AdminLayout>;
}

const styles = StyleSheet.create({
  denied: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { color: Palette.text, fontSize: 20, fontWeight: '800' },
  info: { padding: Spacing.three, gap: 6, borderRadius: Radius.medium, backgroundColor: Palette.primarySoft },
  infoTitle: { color: Palette.primaryDark, fontWeight: '800' },
  infoText: { color: Palette.secondaryText, fontSize: 12, lineHeight: 18 },
  card: { padding: Spacing.three, gap: Spacing.two, borderRadius: Radius.medium, backgroundColor: Palette.white },
  userInfo: { flex: 1, gap: 4 }, userName: { color: Palette.text, fontWeight: '800', fontSize: 14 },
  body: { color: Palette.secondaryText, fontSize: 12, lineHeight: 18 },
  role: { alignSelf: 'flex-start', overflow: 'hidden', paddingHorizontal: 9, paddingVertical: 4, borderRadius: Radius.pill, color: Palette.secondaryText, backgroundColor: '#F1EDF4', fontSize: 9, fontWeight: '900' },
  adminRole: { color: Palette.primaryDark, backgroundColor: '#E8D9F5' },
  action: { alignSelf: 'flex-start', paddingHorizontal: 13, paddingVertical: 9, borderRadius: Radius.pill, backgroundColor: Palette.primaryDark },
  actionText: { color: Palette.white, fontSize: 11, fontWeight: '800' }, disabled: { opacity: 0.5 },
  errorCard: { padding: Spacing.three, gap: 6, borderRadius: Radius.medium, backgroundColor: '#FFF0F0' },
  errorTitle: { color: Palette.error, fontWeight: '800' },
});
