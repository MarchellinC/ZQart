import { StyleSheet, Text, View } from 'react-native';
import { Palette } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/theme';
import { PrimaryButton } from './primary-button';
import { ThemedText } from './themed-text';

type Props = { title: string; description: string; emoji?: string; actionLabel?: string; onAction?: () => void };

export function EmptyState({ title, description, emoji = '♡', actionLabel, onAction }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.art}><Text style={styles.emoji}>{emoji}</Text></View>
      <ThemedText style={styles.title}>{title}</ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.description}>{description}</ThemedText>
      {actionLabel && onAction ? <PrimaryButton title={actionLabel} onPress={onAction} compact /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', padding: Spacing.five, gap: Spacing.two },
  art: {
    width: 92, height: 92, marginBottom: Spacing.two, borderRadius: Radius.large,
    backgroundColor: Palette.primarySoft, alignItems: 'center', justifyContent: 'center',
  },
  emoji: { fontSize: 38, color: Palette.primaryDark },
  title: { fontSize: 18, fontWeight: '800', textAlign: 'center' },
  description: { maxWidth: 280, fontSize: 13, lineHeight: 20, textAlign: 'center', marginBottom: Spacing.two },
});
