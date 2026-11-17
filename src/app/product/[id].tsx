import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { PrimaryButton } from '@/components/primary-button';
import { SecondaryButton } from '@/components/secondary-button';
import { ThemedText } from '@/components/themed-text';
import { Palette } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/theme';
import { useDemoStore } from '@/contexts/demo-store';
import { formatRupiah } from '@/utils/currency';
import { GradientBackground } from '@/components/gradient-background';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addToCart, products } = useDemoStore();
  const product = products.find((item) => item.id === id);
  if (!product) return <ThemedText>Produk tidak ditemukan.</ThemedText>;

  return (
    <GradientBackground style={styles.background}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <SymbolView name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }} size={18} tintColor={Palette.text} />
          <ThemedText style={styles.backLabel}>Kembali</ThemedText>
        </Pressable>
        <View style={[styles.art, { backgroundColor: product.artColor }]}><Text style={styles.emoji}>{product.emoji}</Text></View>
        <View style={styles.productInfo}>
          <ThemedText themeColor="textSecondary" style={styles.category}>{product.category} · Karya lokal</ThemedText>
          <ThemedText style={styles.name}>{product.name}</ThemedText>
          <View style={styles.ratingRow}><Text style={styles.star}>★</Text>
            <ThemedText style={styles.rating}>{product.rating} · {product.reviewCount} ulasan</ThemedText></View>
          <ThemedText style={styles.price}>{formatRupiah(product.price)}</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.description}>
            {product.description ?? 'Dibuat dengan perhatian pada detail oleh pengrajin lokal.'}
          </ThemedText>
          <View style={styles.note}><ThemedText style={styles.noteText}>♡  Mendukung karya kreatif Indonesia</ThemedText></View>
          <PrimaryButton title="Tambah ke keranjang" onPress={() => addToCart(product.id)} />
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
  emoji: { fontSize: 112 },
  productInfo: { padding: Spacing.three, gap: Spacing.two, borderRadius: Radius.large, backgroundColor: Palette.white },
  category: { fontSize: 11, fontWeight: '600' },
  name: { fontSize: 23, fontWeight: '800' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  star: { color: '#D7A34F', fontSize: 14 },
  rating: { color: Palette.secondaryText, fontSize: 12 },
  price: { marginTop: Spacing.one, color: Palette.primaryDark, fontSize: 21, fontWeight: '800' },
  description: { fontSize: 13, lineHeight: 20, marginVertical: Spacing.two },
  note: { marginBottom: Spacing.two, padding: Spacing.two, borderRadius: Radius.small, backgroundColor: Palette.primarySoft },
  noteText: { color: Palette.primaryDark, fontSize: 12, fontWeight: '600' },
});
