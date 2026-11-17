import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import type { Product } from '@/types/product';
import { Palette } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/theme';
import { formatRupiah } from '@/utils/currency';
import { ThemedText } from './themed-text';

type Props = { product: Product; onPress?: () => void; onFavoritePress?: () => void; favorite?: boolean };

export function ProductCard({ product, onPress, onFavoritePress, favorite = false }: Props) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={[styles.art, { backgroundColor: product.artColor }]}>
        <Text style={styles.emoji}>{product.emoji}</Text>
        {product.badge ? <Text style={styles.badge}>{product.badge}</Text> : null}
        <Pressable accessibilityLabel={favorite ? 'Hapus dari favorit' : 'Tambah ke favorit'}
          onPress={(event) => { event.stopPropagation(); onFavoritePress?.(); }} style={styles.favorite}>
          <SymbolView name={{ ios: favorite ? 'heart.fill' : 'heart', android: 'favorite', web: 'favorite' }}
            size={16} tintColor={favorite ? Palette.error : Palette.primaryDark} />
        </Pressable>
      </View>
      <View style={styles.details}>
        <ThemedText themeColor="textSecondary" style={styles.category}>{product.category}</ThemedText>
        <ThemedText numberOfLines={1} style={styles.name}>{product.name}</ThemedText>
        <View style={styles.footer}>
          <ThemedText style={styles.price}>{formatRupiah(product.price)}</ThemedText>
          <View style={styles.rating}>
            <Text style={styles.star}>★</Text>
            <ThemedText style={styles.ratingText}>{product.rating}</ThemedText>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexGrow: 1, flexBasis: '46%', minWidth: 0, maxWidth: '49%',
    borderRadius: Radius.medium, backgroundColor: Palette.white, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(232,229,235,0.8)',
  },
  art: { height: 142, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 58 },
  badge: {
    position: 'absolute', left: Spacing.two, top: Spacing.two, color: Palette.primaryDark,
    backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: Radius.pill,
    paddingHorizontal: 9, paddingVertical: 5, fontSize: 9, fontWeight: '700',
  },
  favorite: {
    position: 'absolute', right: Spacing.two, top: Spacing.two, width: 30, height: 30,
    borderRadius: Radius.pill, backgroundColor: Palette.white, alignItems: 'center', justifyContent: 'center',
  },
  details: { padding: Spacing.two, gap: 4 },
  category: { fontSize: 10, letterSpacing: 0.4 },
  name: { fontSize: 13, fontWeight: '700' },
  footer: { marginTop: 3, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 12, fontWeight: '800', color: Palette.primaryDark },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  star: { color: '#D7A34F', fontSize: 12 },
  ratingText: { fontSize: 10, fontWeight: '600' },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
});
