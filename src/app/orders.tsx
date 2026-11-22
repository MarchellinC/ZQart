import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppHeader } from '@/components/app-header';
import { BuyerPage } from '@/components/buyer-page';
import { EmptyState } from '@/components/empty-state';
import { useAuth } from '@/contexts/auth-context';
import { initializeDatabase, orderRepository } from '@/database';
import type { OrderRecord } from '@/database/repositories/orders';
import { Palette } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/theme';
import { formatRupiah } from '@/utils/currency';

export default function OrdersScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  useEffect(() => {
    let active = true;
    if (user) void (async () => {
      const db = await initializeDatabase();
      const local = await orderRepository.listForUser(db, user.uid);
      if (active) setOrders(local);
    })().catch((error) => Alert.alert('Pesanan gagal dimuat', String(error)));
    return () => { active = false; };
  }, [user]);
  return <BuyerPage active="orders"><ScrollView contentContainerStyle={styles.content}>
    <AppHeader greeting="Riwayat belanja" title="Pesanan Saya" />
    {!orders.length ? <EmptyState title="Belum ada pesanan" description="Pesanan yang selesai checkout akan tampil di sini." actionLabel="Belanja sekarang" onAction={() => router.replace('/')} />
      : orders.map((order) => <View key={order.id} style={styles.card}>
        <View style={styles.header}><Text style={styles.title}>Pesanan #{order.id.slice(-8)}</Text><Text style={styles.status}>{order.status}</Text></View>
        <Text style={styles.date}>{new Date(order.created_at).toLocaleString('id-ID')}</Text>
        {order.items.map((item) => <Text key={item.product_id} style={styles.item}>{item.name} × {item.quantity} · {formatRupiah(item.price * item.quantity)}</Text>)}
        <Text style={styles.total}>Total {formatRupiah(order.total)}</Text>
      </View>)}
  </ScrollView></BuyerPage>;
}

const styles = StyleSheet.create({ content: { flexGrow: 1, padding: Spacing.three, gap: Spacing.two }, card: { padding: Spacing.three, gap: 8, borderRadius: Radius.medium, backgroundColor: Palette.white }, header: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 }, title: { color: Palette.text, fontWeight: '800' }, status: { color: Palette.primaryDark, fontWeight: '700', textTransform: 'capitalize' }, date: { color: Palette.secondaryText, fontSize: 11 }, item: { color: Palette.secondaryText, fontSize: 12 }, total: { color: Palette.primaryDark, fontWeight: '800', textAlign: 'right' } });
