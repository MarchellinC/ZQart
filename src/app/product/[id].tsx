import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Image } from 'expo-image';
import { PrimaryButton } from '@/components/primary-button';
import { SecondaryButton } from '@/components/secondary-button';
import { ThemedText } from '@/components/themed-text';
import { Palette } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/theme';
import { useDemoStore } from '@/contexts/demo-store';
import { useAuth } from '@/contexts/auth-context';
import { formatRupiah } from '@/utils/currency';
import { GradientBackground } from '@/components/gradient-background';
import { QuantitySelector } from '@/components/quantity-selector';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { role } = useAuth();
  const { addToCart, setQuantity, removeFromCart, products, cartItems } = useDemoStore();
  const product = products.find((item) => item.id === id);
  if (!product) return <ThemedText>Produk tidak ditemukan.</ThemedText>;
  const selectedProduct = product;
  const cartQuantity = cartItems.find((item) => item.productId === selectedProduct.id)?.quantity ?? 0;
  async function checkoutProduct() {
    if (cartQuantity === 0) await addToCart(selectedProduct.id);
    router.push({ pathname: '/checkout', params: { items: selectedProduct.id } });
  }

  return (
    <GradientBackground style={styles.background}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }} size={18} tintColor={Palette.text} />
          <ThemedText style={styles.backLabel}>Kembali</ThemedText>
        </Pressable>
        <View style={[styles.art, { backgroundColor: product.artColor }]}>
          {product.image_url ? <Image source={product.image_url} style={styles.productImage}
            contentFit="contain" cachePolicy="disk" transition={180} /> : <Text style={styles.emoji}>{product.emoji}</Text>}
        </View>
        <View style={styles.productInfo}>
          <ThemedText themeColor="textSecondary" style={styles.category}>{product.category} · Karya lokal</ThemedText>
          <ThemedText style={styles.name}>{product.name}</ThemedText>
          <View style={styles.ratingRow}><Text style={styles.star}>★</Text>
            <ThemedText style={styles.rating}>{product.rating} · {product.reviewCount} ulasan</ThemedText></View>
          <ThemedText style={styles.price}>{formatRupiah(product.price)}</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.stock}>
            {product.stock ? `Stok tersedia: ${product.stock}` : 'Stok habis'}
          </ThemedText>
          {cartQuantity > 0 ? <View style={styles.cartControls}>
            <ThemedText style={styles.inCart}>Jumlah di keranjang</ThemedText>
            <QuantitySelector value={cartQuantity} min={0} max={Math.max(selectedProduct.stock ?? 0, cartQuantity)} onChange={(quantity) => {
              if (quantity < 1) void removeFromCart(selectedProduct.id); else void setQuantity(selectedProduct.id, quantity);
            }} />
          </View> : null}
          <ThemedText themeColor="textSecondary" style={styles.description}>
            {product.description ?? 'Dibuat dengan perhatian pada detail oleh pengrajin lokal.'}
          </ThemedText>
          <View style={styles.note}><ThemedText style={styles.noteText}>♡  Mendukung karya kreatif Indonesia</ThemedText></View>
          {role !== 'admin' ? <PrimaryButton title={product.stock ? 'Tambah ke keranjang' : 'Stok habis'}
            disabled={!product.stock} onPress={() => addToCart(product.id)} /> : null}
          {role !== 'admin' ? <SecondaryButton title="Checkout produk ini" disabled={!product.stock}
            onPress={() => { void checkoutProduct(); }} /> : null}
          <SecondaryButton title="Lanjut melihat produk" onPress={() => router.replace('/')} />
        </View>
      </ScrollView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  content: { padding: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.five },
  back: { height: 42, flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  backLabel: { fontSize: 13, fontWeight: '700' },
  art: { height: 310, borderRadius: Radius.large, alignItems: 'center', justifyContent: 'center' },
  productImage: { width: '100%', height: '100%', borderRadius: Radius.large },
  emoji: { fontSize: 112 },
  productInfo: { padding: Spacing.three, gap: Spacing.two, borderRadius: Radius.large, backgroundColor: Palette.white },
  category: { fontSize: 11, fontWeight: '600' },
  name: { fontSize: 23, fontWeight: '800' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  star: { color: '#D7A34F', fontSize: 14 },
  rating: { color: Palette.secondaryText, fontSize: 12 },
  price: { marginTop: Spacing.one, color: Palette.primaryDark, fontSize: 21, fontWeight: '800' },
  stock: { fontSize: 12, fontWeight: '700' },
  inCart: { color: Palette.primaryDark, fontSize: 13, fontWeight: '800' },
  cartControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  description: { fontSize: 13, lineHeight: 20, marginVertical: Spacing.two },
  note: { marginBottom: Spacing.two, padding: Spacing.two, borderRadius: Radius.small, backgroundColor: Palette.primarySoft },
  noteText: { color: Palette.primaryDark, fontSize: 12, fontWeight: '600' },
});
