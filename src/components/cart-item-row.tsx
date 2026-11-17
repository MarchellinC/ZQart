import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import type { Product } from '@/types/product';
import { Palette } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/theme';
import { formatRupiah } from '@/utils/currency';
import { QuantitySelector } from './quantity-selector';
import { ThemedText } from './themed-text';

type Props = {
  product: Product; quantity: number; onQuantityChange: (quantity: number) => void; onRemove: () => void;
};

export function CartItemRow({ product, quantity, onQuantityChange, onRemove }: Props) {
  return (
    <View style={styles.row}>
      <View style={[styles.art, { backgroundColor: product.artColor }]}><Text style={styles.emoji}>{product.emoji}</Text></View>
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <ThemedText numberOfLines={1} style={styles.name}>{product.name}</ThemedText>
          <Pressable accessibilityLabel="Hapus item" onPress={onRemove} hitSlop={8}>
            <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} size={13} tintColor={Palette.secondaryText} />
          </Pressable>
        </View>
        <ThemedText style={styles.price}>{formatRupiah(product.price)}</ThemedText>
        <QuantitySelector value={quantity} onChange={onQuantityChange} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    padding: Spacing.two, borderRadius: Radius.medium, backgroundColor: Palette.white,
    flexDirection: 'row', gap: Spacing.two, borderWidth: 1, borderColor: Palette.border,
  },
  art: { width: 84, height: 94, borderRadius: Radius.small, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 40 },
  info: { flex: 1, justifyContent: 'center', alignItems: 'flex-start', gap: 6 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two, width: '100%' },
  name: { flex: 1, fontSize: 13, fontWeight: '700' },
  price: { color: Palette.primaryDark, fontSize: 12, fontWeight: '800' },
});
