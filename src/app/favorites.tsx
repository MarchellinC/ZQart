import { ScrollView, StyleSheet, Text } from 'react-native';
import { router, type Href } from 'expo-router';
import { AppHeader } from '@/components/app-header';
import { BuyerPage } from '@/components/buyer-page';
import { EmptyState } from '@/components/empty-state';
import { ProductGrid } from '@/components/product-grid';
import { SectionHeading } from '@/components/section-heading';
import { Spacing } from '@/constants/theme';
import { useDemoStore } from '@/contexts/demo-store';

export default function FavoritesScreen() {
  const { favoriteIds, toggleFavorite, products: catalog } = useDemoStore();
  const products = catalog.filter((product) => favoriteIds.includes(product.id));
  return (
    <BuyerPage active="favorites">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader greeting="Koleksi spesial" title="Favoritmu" />
        <SectionHeading title="Disimpan untuk nanti" subtitle={`${products.length} karya pilihan`} />
        {products.length
          ? <ProductGrid products={products} favoriteIds={favoriteIds}
              onFavoritePress={(product) => toggleFavorite(product.id)}
              onProductPress={(product) => router.push(`/product/${product.id}` as Href)} />
          : <EmptyState title="Belum ada favorit" description="Simpan karya yang kamu suka, lalu temukan lagi di sini." />}
        <Text style={styles.note}>Favorit disimpan lokal untuk akun yang sedang masuk.</Text>
      </ScrollView>
    </BuyerPage>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.four },
  note: { textAlign: 'center', color: '#7F7C82', fontSize: 11, lineHeight: 17 },
});
