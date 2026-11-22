import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { AppHeader } from '@/components/app-header';
import { BuyerPage } from '@/components/buyer-page';
import { PrimaryButton } from '@/components/primary-button';
import { useAuth } from '@/contexts/auth-context';
import { useDemoStore } from '@/contexts/demo-store';
import { addressRepository, buyerDataRepository, initializeDatabase, orderRepository, storeAddressRepository } from '@/database';
import type { AddressRecord } from '@/database/repositories/addresses';
import type { StoreAddressRecord } from '@/database/repositories/store-address';
import { Palette } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/theme';
import { formatRupiah } from '@/utils/currency';
import { firestore } from '@/services/firebase/firestore';
import { collection, doc, runTransaction } from 'firebase/firestore';
import { QuantitySelector } from '@/components/quantity-selector';

export default function CheckoutScreen() {
  const { user, role, ready } = useAuth();
  const uid = user?.uid;
  const params = useLocalSearchParams<{ items?: string }>();
  const requestedIds = typeof params.items === 'string' ? params.items : null;
  const { cartItems, products, syncNow, refreshProducts, refreshBuyerData, setQuantity } = useDemoStore();
  const [submitting, setSubmitting] = useState(false);
  const [addresses, setAddresses] = useState<AddressRecord[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [storeAddress, setStoreAddress] = useState<StoreAddressRecord | null>(null);
  const rows = useMemo(() => cartItems.flatMap((item) => {
    if (requestedIds && !requestedIds.split(',').includes(item.productId)) return [];
    const product = products.find((entry) => entry.id === item.productId);
    return product ? [{ ...item, product }] : [];
  }), [cartItems, products, requestedIds]);
  const total = rows.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const selectedAddress = addresses.find((address) => address.id === selectedAddressId) ?? null;

  useEffect(() => {
    let active = true;
    if (uid && role === 'buyer') void (async () => {
      const db = await initializeDatabase();
      const [buyerAddresses, origin] = await Promise.all([
        addressRepository.listForUser(db, uid), storeAddressRepository.get(db),
      ]);
      if (!active) return;
      setAddresses(buyerAddresses);
      setSelectedAddressId((current) => buyerAddresses.some((address) => address.id === current)
        ? current : buyerAddresses.find((address) => address.is_default)?.id ?? buyerAddresses[0]?.id ?? null);
      setStoreAddress(origin);
    })().catch((error) => Alert.alert('Checkout gagal dimuat', String(error)));
    return () => { active = false; };
  }, [role, uid]);

  if (!ready) return <View style={styles.center}><Text style={styles.title}>Memeriksa akun…</Text></View>;
  if (!user || role !== 'buyer') return <View style={styles.center}>
    <Text style={styles.title}>Masuk sebagai buyer untuk checkout.</Text>
    <PrimaryButton title="Masuk" onPress={() => router.push('/login')} />
    <Pressable onPress={() => router.back()}><Text style={styles.link}>Kembali</Text></Pressable>
  </View>;

  async function confirmSimulation() {
    if (!rows.length) { Alert.alert('Keranjang kosong', 'Tambahkan produk sebelum checkout.'); return; }
    if (!selectedAddress) { Alert.alert('Alamat diperlukan', 'Tambahkan alamat pengiriman terlebih dahulu.'); return; }
    if (!storeAddress) { Alert.alert('Alamat toko belum diatur', 'Minta admin mengisi alamat asal toko.'); return; }
    if (!uid || submitting) return;
    setSubmitting(true);
    const orderId = doc(collection(firestore, 'orders')).id;
    const createdAt = new Date().toISOString();
    try {
      const stockAfter = await runTransaction(firestore, async (transaction) => {
        const refs = rows.map((item) => doc(firestore, 'products', item.productId));
        const snapshots = await Promise.all(refs.map((ref) => transaction.get(ref)));
        const nextStock: Record<string, number> = {};
        snapshots.forEach((snapshot, index) => {
          const item = rows[index]!;
          if (!snapshot.exists() || Number(snapshot.data().stock) < item.quantity) {
            throw new Error(`${item.product.name}: stok tersisa ${snapshot.exists() ? Number(snapshot.data().stock) : 0}, jumlah yang dipilih ${item.quantity}. Kurangi jumlah atau muat ulang katalog.`);
          }
          nextStock[item.productId] = Number(snapshot.data().stock) - item.quantity;
        });
        transaction.set(doc(firestore, 'orders', orderId), {
          id: orderId, user_id: uid, buyer_name: user?.displayName ?? user?.email ?? 'Buyer',
          items: rows.map((item) => ({ product_id: item.productId, name: item.product.name, price: item.product.price, quantity: item.quantity })),
          total, address: selectedAddress, created_at: createdAt, status: 'baru',
        });
        snapshots.forEach((snapshot, index) => {
          const item = rows[index]!;
          const data = snapshot.data()!;
          transaction.update(refs[index]!, { ...data, stock: nextStock[item.productId], updated_at: createdAt });
        });
        return nextStock;
      });
      const db = await initializeDatabase();
      await orderRepository.create(db, { id: orderId, user_id: uid,
        items: rows.map((item) => ({ product_id: item.productId, name: item.product.name, price: item.product.price, quantity: item.quantity })),
        total, address: selectedAddress as unknown as Record<string, unknown>, created_at: createdAt, status: 'baru' }, stockAfter);
      await Promise.all(rows.map((item) => buyerDataRepository.removeCartItem(db, uid, item.productId)));
      await refreshBuyerData();
      await refreshProducts();
      void syncNow();
      Alert.alert('Pesanan berhasil dibuat', 'Pesanan masuk ke Pesanan Saya dan dapat dilihat admin.', [
        { text: 'Lihat pesanan', onPress: () => router.replace('/orders') },
      ]);
    } catch (error) {
      if (error instanceof Error && error.message.includes('stok tersisa')) {
        await syncNow();
        await refreshProducts();
      }
      Alert.alert('Checkout gagal', error instanceof Error ? error.message : String(error));
    } finally { setSubmitting(false); }
  }

  return <BuyerPage active="cart">
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <AppHeader greeting="Ringkasan" title="Checkout simulasi" />
      <View style={styles.card}>
        <Text style={styles.heading}>Alamat tujuan</Text>
        {addresses.length ? addresses.map((address) => {
          const selected = selectedAddressId === address.id;
          return <Pressable key={address.id} style={[styles.address, selected && styles.selected]}
            onPress={() => setSelectedAddressId(address.id)}>
            <Text style={styles.addressName}>{address.recipient_name}{address.is_default ? ' · Utama' : ''}</Text>
            <Text style={styles.detail}>{address.phone_number} · {address.full_address}, {address.district}, {address.city}, {address.province} {address.postal_code}</Text>
          </Pressable>;
        }) : <>
          <Text style={styles.detail}>Belum ada alamat pengiriman untuk akun ini.</Text>
          <PrimaryButton title="Tambah alamat" compact onPress={() => router.push('/addresses')} />
        </>}
      </View>
      <View style={styles.card}>
        <Text style={styles.heading}>Alamat asal toko</Text>
        {storeAddress ? <Text style={styles.detail}>{storeAddress.recipient_name} · {storeAddress.phone_number}{'\n'}{storeAddress.full_address}, {storeAddress.district}, {storeAddress.city}, {storeAddress.province} {storeAddress.postal_code}</Text>
          : <Text style={styles.detail}>Alamat toko belum diatur oleh admin.</Text>}
      </View>
      <View style={styles.card}>
        <Text style={styles.heading}>Ringkasan produk</Text>
        {rows.length ? rows.map((item) => <View key={item.productId} style={styles.row}>
          <View style={styles.productLine}>
            <View style={styles.itemInfo}><Text style={styles.detail}>{item.product.name} × {item.quantity}</Text>
              <Text style={styles.price}>{formatRupiah(item.product.price * item.quantity)}</Text></View>
            <QuantitySelector value={item.quantity} max={item.product.stock} onChange={(quantity) => { void setQuantity(item.productId, quantity); }} />
          </View>
        </View>) : <Text style={styles.detail}>Keranjang masih kosong.</Text>}
        <View style={styles.totalRow}><Text style={styles.heading}>Total estimasi</Text><Text style={styles.total}>{formatRupiah(total)}</Text></View>
      </View>
      <Text style={styles.notice}>Pesanan akan disimpan dan stok produk langsung diperbarui.</Text>
      <PrimaryButton title={submitting ? 'Memproses pesanan…' : 'Buat pesanan'} disabled={submitting} onPress={() => { void confirmSimulation(); }} />
      <Pressable onPress={() => router.back()}><Text style={styles.link}>Kembali ke keranjang</Text></Pressable>
    </ScrollView>
  </BuyerPage>;
}

const styles = StyleSheet.create({
  content: { padding: Spacing.three, gap: Spacing.two, paddingBottom: Spacing.four },
  center: { flex: 1, justifyContent: 'center', padding: Spacing.four, gap: Spacing.two, backgroundColor: Palette.gradientStart },
  title: { color: Palette.text, fontSize: 22, fontWeight: '800' },
  card: { padding: Spacing.three, gap: Spacing.two, borderRadius: Radius.medium, backgroundColor: Palette.white },
  heading: { color: Palette.text, fontSize: 15, fontWeight: '800' },
  address: { padding: Spacing.two, gap: 5, borderWidth: 1, borderColor: Palette.border, borderRadius: 12 },
  selected: { borderColor: Palette.primaryDark, backgroundColor: Palette.primarySoft },
  addressName: { color: Palette.text, fontWeight: '700' },
  detail: { color: Palette.secondaryText, fontSize: 12, lineHeight: 18, flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.two },
  productLine: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two },
  itemInfo: { flex: 1, gap: 3 },
  price: { color: Palette.text, fontSize: 12, fontWeight: '700' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: Spacing.two, borderTopWidth: 1, borderTopColor: Palette.border },
  total: { color: Palette.primaryDark, fontSize: 16, fontWeight: '800' },
  notice: { color: Palette.secondaryText, fontSize: 12, lineHeight: 18, textAlign: 'center' },
  link: { color: Palette.primaryDark, fontWeight: '700', textAlign: 'center', padding: Spacing.two },
});
