import { StyleSheet, View } from 'react-native';
import type { Product } from '@/types/product';
import { Spacing } from '@/constants/theme';
import { ProductCard } from './product-card';

type Props = {
  products: Product[];
  onProductPress: (product: Product) => void;
  onFavoritePress?: (product: Product) => void;
  favoriteIds?: string[];
};

export function ProductGrid({ products, onProductPress, onFavoritePress, favoriteIds = [] }: Props) {
  return (
    <View style={styles.grid}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onPress={() => onProductPress(product)}
          onFavoritePress={() => onFavoritePress?.(product)} favorite={favoriteIds.includes(product.id)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({ grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two } });
