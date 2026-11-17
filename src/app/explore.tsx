import { ScrollView, StyleSheet } from 'react-native';
import { router, type Href } from 'expo-router';
import { AppHeader } from '@/components/app-header';
import { BuyerPage } from '@/components/buyer-page';
import { ProductGrid } from '@/components/product-grid';
import { SectionHeading } from '@/components/section-heading';
import { Spacing } from '@/constants/theme';
import { useDemoStore } from '@/contexts/demo-store';

export default function ExploreScreen() {
  const { favoriteIds, toggleFavorite, products } = useDemoStore();
  return (
    <BuyerPage active="home">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader greeting="Jelajahi" title="Karya lokal" />
        <SectionHeading title="Semua produk" subtitle="Pilihan yang dibuat dengan sepenuh hati" />
        <ProductGrid products={products} favoriteIds={favoriteIds}
          onFavoritePress={(product) => toggleFavorite(product.id)}
          onProductPress={(product) => router.push(`/product/${product.id}` as Href)} />
      </ScrollView>
    </BuyerPage>
  );
}

const styles = StyleSheet.create({ content: { padding: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.four } });
