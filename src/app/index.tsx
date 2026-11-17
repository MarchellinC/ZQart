import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { AppHeader } from '@/components/app-header';
import { BuyerPage } from '@/components/buyer-page';
import { CategoryChip } from '@/components/category-chip';
import { CustomInput } from '@/components/custom-input';
import { ProductGrid } from '@/components/product-grid';
import { SectionHeading } from '@/components/section-heading';
import { useDemoStore } from '@/contexts/demo-store';
import { Palette } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/theme';
import type { Product } from '@/types/product';

export default function HomeScreen() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Semua');
  const { favoriteIds, toggleFavorite, products: catalog } = useDemoStore();
  const categories = useMemo(() => ['Semua', ...new Set(catalog.map((item) => item.category))], [catalog]);
  const products = useMemo(() => catalog.filter((item) =>
    (category === 'Semua' || item.category === category)
    && item.name.toLowerCase().includes(query.trim().toLowerCase())), [catalog, category, query]);
  const openProduct = (product: Product) => router.push(`/product/${product.id}` as Href);

  return (
    <BuyerPage active="home">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <AppHeader />
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>PILIHAN LOKAL, PENUH CERITA</Text>
          <Text style={styles.headline}>Temukan yang{'\n'}berarti bagimu.</Text>
          <Text style={styles.body}>Karya pilihan dari tangan-tangan kreatif Indonesia.</Text>
        </View>
        <CustomInput value={query} onChangeText={setQuery} placeholder="Cari produk favoritmu"
          symbol="magnifyingglass" returnKeyType="search" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
          {categories.map((item) => <CategoryChip key={item} label={item}
            selected={category === item} onPress={() => setCategory(item)} />)}
        </ScrollView>
        <Pressable style={styles.feature} onPress={() => setCategory('Kerajinan')}>
          <View style={styles.featureCopy}>
            <Text style={styles.featureTag}>CERITA DARI NUSANTARA</Text>
            <Text style={styles.featureTitle}>Karya lokal,{'\n'}rasa istimewa.</Text>
            <Text style={styles.featureLink}>Jelajahi koleksi  →</Text>
          </View>
          <Text style={styles.featureArt}>🪷</Text>
        </Pressable>
        <SectionHeading title="Pilihan untukmu" subtitle="Temukan karya yang dibuat dengan hati"
          actionLabel="Lihat semua" onAction={() => router.push('/explore')} />
        <ProductGrid products={products} onProductPress={openProduct} favoriteIds={favoriteIds}
          onFavoritePress={(product) => toggleFavorite(product.id)} />
        {products.length === 0 ? <Text style={styles.noResults}>Produk belum ditemukan.</Text> : null}
        <View style={styles.bottomNote}><Text style={styles.note}>Dibuat lokal, dipilih dengan hati ♡</Text></View>
      </ScrollView>
    </BuyerPage>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.four },
  hero: { paddingTop: Spacing.two, gap: Spacing.two },
  eyebrow: { color: Palette.primaryDark, fontSize: 10, fontWeight: '800', letterSpacing: 1.6 },
  headline: { color: Palette.text, fontSize: 30, fontWeight: '800', lineHeight: 35, letterSpacing: -0.6 },
  body: { color: Palette.secondaryText, fontSize: 13, lineHeight: 19 },
  categories: { gap: Spacing.two, paddingRight: Spacing.three },
  feature: {
    minHeight: 148, padding: Spacing.three, borderRadius: Radius.large,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    overflow: 'hidden', backgroundColor: Palette.primaryDark,
  },
  featureCopy: { gap: 7 },
  featureTag: { color: '#E9DAF5', fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  featureTitle: { color: Palette.white, fontSize: 19, lineHeight: 23, fontWeight: '800' },
  featureLink: { color: Palette.white, fontSize: 11, fontWeight: '600', marginTop: 3 },
  featureArt: { fontSize: 65, marginRight: 2 },
  noResults: { color: Palette.secondaryText, textAlign: 'center', padding: Spacing.four },
  bottomNote: { alignItems: 'center', paddingVertical: Spacing.two },
  note: { color: Palette.primaryDark, fontSize: 11, fontWeight: '600' },
});
