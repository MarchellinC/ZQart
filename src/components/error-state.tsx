import { StyleSheet, Text, View } from 'react-native';
import { Palette } from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import { SecondaryButton } from './secondary-button';
import { ThemedText } from './themed-text';

type Props = { message?: string; onRetry?: () => void };

export function ErrorState({
  message = 'Coba beberapa saat lagi.', onRetry,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>☁</Text>
      <ThemedText style={styles.title}>Ada kendala</ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.message}>{message}</ThemedText>
      {onRetry ? <SecondaryButton title="Coba lagi" onPress={onRetry} compact /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, minHeight: 180, alignItems: 'center', justifyContent: 'center', gap: Spacing.two },
  emoji: { color: Palette.warning, fontSize: 36 },
  title: { fontSize: 18, fontWeight: '800' },
  message: { maxWidth: 270, fontSize: 13, lineHeight: 19, textAlign: 'center', marginBottom: Spacing.two },
});
