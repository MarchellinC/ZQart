import { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { SymbolView, type SFSymbol } from 'expo-symbols';
import { Palette } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/theme';
import { ThemedText } from './themed-text';

type Props = TextInputProps & { label?: string; symbol?: SFSymbol };

export function CustomInput({ label, symbol, style, onFocus, onBlur, ...props }: Props) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.wrapper}>
      {label ? <ThemedText style={styles.label}>{label}</ThemedText> : null}
      <View style={[styles.field, focused && styles.focused]}>
        {symbol ? <SymbolView name={{ ios: symbol, android: 'search', web: 'search' }}
          size={18} tintColor={Palette.secondaryText} /> : null}
        <TextInput
          placeholderTextColor={Palette.secondaryText}
          style={[styles.input, style]}
          onFocus={(event) => { setFocused(true); onFocus?.(event); }}
          onBlur={(event) => { setFocused(false); onBlur?.(event); }}
          {...props}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: Spacing.two },
  label: { color: Palette.text, fontSize: 13, fontWeight: '700' },
  field: {
    minHeight: 50, paddingHorizontal: Spacing.three, borderRadius: Radius.pill,
    flexDirection: 'row', alignItems: 'center', gap: Spacing.two,
    backgroundColor: Palette.white, borderWidth: 1, borderColor: Palette.border,
  },
  focused: { borderColor: Palette.primaryDark },
  input: { flex: 1, paddingVertical: Spacing.two, color: Palette.text, fontSize: 14 },
});
