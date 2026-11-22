import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import type { Product } from '@/types/product';
import { Palette } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/theme';
import { formatRupiah } from '@/utils/currency';
import { QuantitySelector } from './quantity-selector';
import { ThemedText } from './themed-text';
import { ConfirmDialog } from './confirm-dialog';

type Props = {
  product: Product; quantity: number; onQuantityChange: (quantity: number) => void; onRemove: () => void;
  selected: boolean; onSelect: () => void;
};

export function CartItemRow({ product, quantity, onQuantityChange, onRemove, selected, onSelect }: Props) {
  const [confirmRemove, setConfirmRemove] = useState(false);
  return (
    <>
    <View style={styles.row}>
      <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: selected }} onPress={onSelect} style={[styles.check, selected && styles.checkSelected]}>
        {selected ? <SymbolView name={{ ios: 'checkmark', android: 'check', web: 'check' }} size={13} tintColor={Palette.white} /> : null}
      </Pressable>
      <View style={[styles.art, { backgroundColor: product.artColor }]}><Text style={styles.emoji}>{product.emoji}</Text></View>
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <ThemedText numberOfLines={1} style={styles.name}>{product.name}</ThemedText>
          <Pressable accessibilityLabel="Hapus item" onPress={() => setConfirmRemove(true)} hitSlop={8}>
            <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} size={13} tintColor={Palette.secondaryText} />
          </Pressable>
        </View>
        <ThemedText style={styles.price}>{formatRupiah(product.price)}</ThemedText>
        <QuantitySelector value={quantity} min={0} max={Math.max(product.stock ?? 0, quantity)} onChange={(next) => {
          if (next === 0) setConfirmRemove(true); else onQuantityChange(next);
        }} />
      </View>
    </View>
    <ConfirmDialog visible={confirmRemove} title="Hapus dari keranjang?"
      message={`Jumlah ${product.name} akan menjadi 0 dan item dihapus dari keranjang.`}
      confirmLabel="Ya, hapus" onCancel={() => setConfirmRemove(false)}
      onConfirm={() => { setConfirmRemove(false); onRemove(); }} />
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    padding: Spacing.two, borderRadius: Radius.medium, backgroundColor: Palette.white,
    flexDirection: 'row', gap: Spacing.two, borderWidth: 1, borderColor: Palette.border,
  },
  art: { width: 84, height: 94, borderRadius: Radius.small, alignItems: 'center', justifyContent: 'center' },
  check: { width: 22, height: 22, alignSelf: 'center', borderRadius: 6, borderWidth: 1, borderColor: Palette.border, alignItems: 'center', justifyContent: 'center' },
  checkSelected: { backgroundColor: Palette.primaryDark, borderColor: Palette.primaryDark },
  emoji: { fontSize: 40 },
  info: { flex: 1, justifyContent: 'center', alignItems: 'flex-start', gap: 6 },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two, width: '100%' },
  name: { flex: 1, fontSize: 13, fontWeight: '700' },
  price: { color: Palette.primaryDark, fontSize: 12, fontWeight: '800' },
});
