import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { collection, getDocs, onSnapshot, orderBy, query } from 'firebase/firestore';
import { AdminLayout } from '@/components/admin-layout';
import { useAuth } from '@/contexts/auth-context';
import { firestore } from '@/services/firebase/firestore';
import { firebaseAuth } from '@/services/firebase/auth';
import { Palette } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/theme';
import { formatRupiah } from '@/utils/currency';
import type { OrderLine } from '@/database/repositories/orders';

type IncomingOrder = { id: string; buyer_name?: string; items: OrderLine[]; total: number; created_at: string; status: string };
export default function AdminOrdersScreen() {
  const { role, ready } = useAuth();
  const [orders, setOrders] = useState<IncomingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  async function reload() {
    setLoading(true);
    setError(null);
    try {
      const snapshot = await getDocs(query(collection(firestore, 'orders'), orderBy('created_at', 'desc')));
      setOrders(snapshot.docs.map((item) => ({ ...item.data(), id: item.id }) as IncomingOrder));
    } catch (cause) {
      if (!firebaseAuth.currentUser) return;
      const code = typeof cause === 'object' && cause !== null && 'code' in cause ? String(cause.code) : 'unknown';
      const message = cause instanceof Error ? cause.message : String(cause);
      setError(code === 'permission-denied'
        ? 'Akses Firestore ditolak. Terbitkan firestore.rules terbaru, lalu pastikan akun admin memiliki role "admin" di koleksi users.'
        : `${code}: ${message}`);
    }
    finally { setLoading(false); }
  }
  useEffect(() => { if (role === 'admin') void Promise.resolve().then(reload); }, [role]);
  useEffect(() => {
    if (role !== 'admin') return;
    return onSnapshot(query(collection(firestore, 'orders'), orderBy('created_at', 'desc')), (snapshot) => {
      setOrders(snapshot.docs.map((item) => ({ ...item.data(), id: item.id }) as IncomingOrder));
      setError(null);
      setLoading(false);
    }, (cause) => {
      // Firestore revokes admin-only listeners when sign-out clears the auth session.
      // That expected shutdown should not be shown as a page error.
      if (!firebaseAuth.currentUser) return;
      const code = 'code' in cause ? String(cause.code) : 'unknown';
      setError(code === 'permission-denied'
        ? 'Firestore menolak akses. Pastikan firestore.rules terbaru sudah diterbitkan dan akun memiliki akses admin.'
        : `${code}: ${cause.message}`);
      setLoading(false);
    });
  }, [role]);
  if (!ready || role !== 'admin') return <View style={styles.denied}><Text style={styles.title}>Akses admin tidak tersedia</Text></View>;
  return <AdminLayout title="Pesanan masuk" subtitle="Pesanan checkout dari buyer." active="orders">
    <Pressable style={styles.refresh} onPress={() => { void reload(); }}><Text style={styles.refreshText}>Muat ulang</Text></Pressable>
    {error ? <View style={styles.errorCard}><Text style={styles.errorTitle}>Pesanan gagal dimuat</Text><Text style={styles.body}>{error}</Text></View> : null}
    {loading ? <Text style={styles.body}>Memuat pesanan…</Text> : !error && !orders.length ? <Text style={styles.body}>Belum ada pesanan masuk.</Text> : !error ? orders.map((order) => <View key={order.id} style={styles.card}>
      <Text style={styles.title}>#{order.id.slice(-8)} · {order.buyer_name ?? 'Buyer'}</Text>
      <Text style={styles.body}>{new Date(order.created_at).toLocaleString('id-ID')} · {order.status}</Text>
      {order.items.map((item) => <Text key={item.product_id} style={styles.body}>{item.name} × {item.quantity} — {formatRupiah(item.price * item.quantity)}</Text>)}
      <Text style={styles.total}>Total {formatRupiah(order.total)}</Text>
    </View>) : null}
  </AdminLayout>;
}
const styles = StyleSheet.create({ denied: { flex: 1, justifyContent: 'center', alignItems: 'center' }, card: { padding: Spacing.three, gap: 7, borderRadius: Radius.medium, backgroundColor: Palette.white }, errorCard: { padding: Spacing.three, gap: 8, borderRadius: Radius.medium, backgroundColor: '#FFF0F0' }, errorTitle: { color: Palette.error, fontWeight: '800' }, title: { color: Palette.text, fontWeight: '800' }, body: { color: Palette.secondaryText, fontSize: 12, lineHeight: 18 }, total: { color: Palette.primaryDark, textAlign: 'right', fontWeight: '800' }, refresh: { padding: 10, alignSelf: 'flex-end' }, refreshText: { color: Palette.primaryDark, fontWeight: '700' } });
