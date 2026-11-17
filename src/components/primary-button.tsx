import { ActivityIndicator, Pressable, StyleSheet, Text, type PressableProps } from 'react-native';
import { Palette } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/theme';

type Props = Omit<PressableProps, 'children' | 'style'> & {
  title: string; loading?: boolean; compact?: boolean;
};

export function PrimaryButton({ title, loading = false, compact = false, disabled, ...props }: Props) {
  return (
    <Pressable disabled={disabled || loading} style={({ pressed }) => [
      styles.button, compact && styles.compact, (disabled || loading) && styles.disabled,
      pressed && styles.pressed,
    ]} {...props}>
      {loading ? <ActivityIndicator color={Palette.white} /> : <Text style={styles.label}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52, paddingHorizontal: Spacing.four, borderRadius: Radius.pill,
    alignItems: 'center', justifyContent: 'center', backgroundColor: Palette.primaryDark,
  },
  compact: { minHeight: 42, paddingHorizontal: Spacing.three },
  label: { color: Palette.white, fontSize: 14, fontWeight: '700' },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.82 },
});
