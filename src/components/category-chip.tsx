import { Pressable, StyleSheet, Text } from 'react-native';
import { Palette } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/theme';

type Props = { label: string; selected?: boolean; onPress?: () => void };

export function CategoryChip({ label, selected = false, onPress }: Props) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityState={{ selected }}
      style={[styles.chip, selected && styles.selected]}>
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.three, paddingVertical: 10, borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.62)', borderWidth: 1, borderColor: Palette.border,
  },
  selected: { backgroundColor: Palette.primaryDark, borderColor: Palette.primaryDark },
  label: { color: Palette.secondaryText, fontSize: 12, fontWeight: '600' },
  selectedLabel: { color: Palette.white },
});
