import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { Palette } from '@/constants/colors';
import { Radius } from '@/constants/theme';

type Props = { value: number; onChange: (value: number) => void; min?: number; max?: number };

export function QuantitySelector({ value, onChange, min = 1, max = 99 }: Props) {
  return (
    <View style={styles.container}>
      <Pressable accessibilityLabel="Kurangi jumlah" disabled={value <= min}
        onPress={() => onChange(Math.max(min, value - 1))} style={[styles.button, value <= min && styles.disabled]}>
        <SymbolView name={{ ios: 'minus', android: 'remove', web: 'remove' }} size={12} tintColor={Palette.primaryDark} />
      </Pressable>
      <Text style={styles.value}>{value}</Text>
      <Pressable accessibilityLabel="Tambah jumlah" disabled={value >= max}
        onPress={() => onChange(Math.min(max, value + 1))} style={[styles.button, value >= max && styles.disabled]}>
        <SymbolView name={{ ios: 'plus', android: 'add', web: 'add' }} size={12} tintColor={Palette.primaryDark} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 4, borderWidth: 1, borderColor: Palette.border, borderRadius: Radius.pill,
  },
  button: {
    width: 28, height: 28, borderRadius: Radius.pill, backgroundColor: Palette.primarySoft,
    alignItems: 'center', justifyContent: 'center',
  },
  disabled: { opacity: 0.4 },
  value: { minWidth: 14, textAlign: 'center', color: Palette.text, fontSize: 13, fontWeight: '700' },
});
