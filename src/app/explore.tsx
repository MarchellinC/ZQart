import { FlatList, StyleSheet, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { AppHeader } from '@/components/app-header';
import { BuyerPage } from '@/components/buyer-page';
import { ProductCard } from '@/components/product-card';
import { SectionHeading } from '@/components/section-heading';
import { Spacing } from '@/constants/theme';
import { useDemoStore } from '@/contexts/demo-store';

export default function ExploreScreen() {
  const { favoriteIds, toggleFavorite, products } = useDemoStore();
  return (
    <BuyerPage active="home">
      <FlatList data={products} keyExtractor={(item) => item.id} numColumns={2}
        columnWrapperStyle={styles.row} contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false} initialNumToRender={10} maxToRenderPerBatch={10} windowSize={7}
        ListHeaderComponent={<View style={styles.header}>
          <AppHeader greeting="Jelajahi" title="Karya lokal" />
          <SectionHeading title="Semua produk" subtitle="Pilihan yang dibuat dengan sepenuh hati" />
        </View>}
        renderItem={({ item }) => <ProductCard product={item} favorite={favoriteIds.includes(item.id)}
          onFavoritePress={() => toggleFavorite(item.id)}
          onPress={() => router.push(`/product/${item.id}` as Href)} />} />
    </BuyerPage>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.three, gap: Spacing.two, paddingBottom: Spacing.four },
  header: { gap: Spacing.three, paddingBottom: Spacing.two }, row: { gap: Spacing.two },
});
