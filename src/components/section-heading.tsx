import { Pressable, StyleSheet, View } from 'react-native';
import { Palette } from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import { ThemedText } from './themed-text';

type Props = { title: string; subtitle?: string; actionLabel?: string; onAction?: () => void };

export function SectionHeading({ title, subtitle, actionLabel, onAction }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.texts}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        {subtitle ? <ThemedText themeColor="textSecondary" style={styles.subtitle}>{subtitle}</ThemedText> : null}
      </View>
      {actionLabel ? <Pressable onPress={onAction}><ThemedText style={styles.action}>{actionLabel}</ThemedText></Pressable> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.two },
  texts: { gap: 3 },
  title: { color: Palette.text, fontSize: 18, fontWeight: '800' },
  subtitle: { fontSize: 12 },
  action: { color: Palette.primaryDark, fontSize: 12, fontWeight: '700' },
});
