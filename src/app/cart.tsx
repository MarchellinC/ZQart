import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppHeader } from '@/components/app-header';
import { BuyerPage } from '@/components/buyer-page';
import { CartItemRow } from '@/components/cart-item-row';
import { EmptyState } from '@/components/empty-state';
import { PrimaryButton } from '@/components/primary-button';
import { SectionHeading } from '@/components/section-heading';
import { Palette } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/theme';
import { useDemoStore } from '@/contexts/demo-store';
import { formatRupiah } from '@/utils/currency';

export default function CartScreen() {
  const { cartItems, products, setQuantity, removeFromCart } = useDemoStore();
  const rows = cartItems.flatMap((item) => {
    const product = products.find((entry) => entry.id === item.productId);
    return product ? [{ ...item, product }] : [];
  });
  const total = rows.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  return (
    <BuyerPage active="cart">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader greeting="Rangkuman" title="Keranjang" />
        <SectionHeading title="Belanjaanmu" subtitle={`${rows.length} produk pilihan`} />
        {rows.length ? <>
          {rows.map((item) => <CartItemRow key={item.productId} product={item.product}
            quantity={item.quantity} onQuantityChange={(quantity) => setQuantity(item.productId, quantity)}
            onRemove={() => removeFromCart(item.productId)} />)}
          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Ringkasan belanja</Text>
            <View style={styles.totalRow}><Text style={styles.totalLabel}>Subtotal demo</Text>
              <Text style={styles.total}>{formatRupiah(total)}</Text></View>
            <Text style={styles.notice}>Checkout simulasi tersedia pada tahap berikutnya.</Text>
            <PrimaryButton title="Lanjut belanja" onPress={() => router.replace('/')} />
          </View>
        </> : <EmptyState title="Keranjang masih kosong" description="Temukan karya lokal yang kamu sukai." 
          actionLabel="Jelajahi produk" onAction={() => router.replace('/')} />}
      </ScrollView>
    </BuyerPage>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.four },
  summary: { padding: Spacing.three, gap: Spacing.two, borderRadius: Radius.medium, backgroundColor: Palette.white },
  summaryTitle: { color: Palette.text, fontSize: 15, fontWeight: '800' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 3 },
  totalLabel: { color: Palette.secondaryText, fontSize: 13 },
  total: { color: Palette.primaryDark, fontSize: 16, fontWeight: '800' },
  notice: { color: Palette.secondaryText, fontSize: 11, lineHeight: 17, marginBottom: Spacing.one },
});
