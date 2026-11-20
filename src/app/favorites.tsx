import { FlatList, StyleSheet, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { AppHeader } from '@/components/app-header';
import { BuyerPage } from '@/components/buyer-page';
import { PrimaryButton } from '@/components/primary-button';
import { ProductCard } from '@/components/product-card';
import { SectionHeading } from '@/components/section-heading';
import { Palette } from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useDemoStore } from '@/contexts/demo-store';

export default function FavoritesScreen() {
  const { user, role } = useAuth();
  const { favoriteIds, toggleFavorite, products: catalog } = useDemoStore();
  const isBuyer = !!user && role === 'buyer';
  const products = catalog.filter((product) => favoriteIds.includes(product.id));
  return <BuyerPage active="favorites">
    <FlatList data={isBuyer ? products : []} keyExtractor={(item) => item.id} numColumns={2}
      columnWrapperStyle={styles.row} contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false} initialNumToRender={8} maxToRenderPerBatch={8} windowSize={7}
      ListHeaderComponent={<View style={styles.header}>
        <AppHeader greeting="Koleksi spesial" title="Favoritmu" />
        <SectionHeading title="Disimpan untuk nanti" subtitle={`${products.length} karya pilihan`} />
        {!isBuyer ? <View style={styles.loginCard}>
          <Text style={styles.note}>Masuk sebagai buyer untuk menyimpan dan melihat produk favorit.</Text>
          <PrimaryButton title="Masuk" onPress={() => router.push('/login')} />
        </View> : null}
      </View>}
      ListEmptyComponent={isBuyer
        ? <Text style={styles.empty}>Belum ada favorit. Simpan karya yang kamu suka, lalu temukan lagi di sini.</Text>
        : undefined}
      ListFooterComponent={<Text style={styles.note}>Favorit disimpan per akun dan disinkronkan saat koneksi tersedia.</Text>}
      renderItem={({ item }) => <ProductCard product={item} favorite={favoriteIds.includes(item.id)}
        onFavoritePress={() => toggleFavorite(item.id)}
        onPress={() => router.push(`/product/${item.id}` as Href)} />}
    />
  </BuyerPage>;
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, padding: Spacing.three, gap: Spacing.two, paddingBottom: Spacing.four },
  header: { gap: Spacing.three, paddingBottom: Spacing.two },
  row: { gap: Spacing.two },
  note: { textAlign: 'center', color: Palette.secondaryText, fontSize: 11, lineHeight: 17 },
  loginCard: { padding: Spacing.three, gap: Spacing.two, borderRadius: 18, backgroundColor: Palette.white },
  empty: { color: Palette.secondaryText, textAlign: 'center', padding: Spacing.four },
});
