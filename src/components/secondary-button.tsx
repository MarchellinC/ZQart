import { Pressable, StyleSheet, Text, type PressableProps } from 'react-native';
import { Palette } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/theme';

type Props = Omit<PressableProps, 'children' | 'style'> & { title: string; compact?: boolean };

export function SecondaryButton({ title, compact = false, disabled, ...props }: Props) {
  return (
    <Pressable disabled={disabled} style={({ pressed }) => [
      styles.button, compact && styles.compact, disabled && styles.disabled, pressed && styles.pressed,
    ]} {...props}>
      <Text style={styles.label}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50, paddingHorizontal: Spacing.four, borderRadius: Radius.pill,
    borderWidth: 1, borderColor: Palette.primary, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  compact: { minHeight: 40, paddingHorizontal: Spacing.three },
  label: { color: Palette.primaryDark, fontSize: 14, fontWeight: '700' },
  disabled: { opacity: 0.45 },
  pressed: { backgroundColor: Palette.primarySoft },
});
