import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Palette } from '@/constants/colors';
import { Spacing } from '@/constants/theme';
import { ThemedText } from './themed-text';

export function LoadingState({ label = 'Memuat...' }: { label?: string }) {
  return (
    <View accessibilityRole="progressbar" style={styles.container}>
      <ActivityIndicator size="large" color={Palette.primaryDark} />
      <ThemedText themeColor="textSecondary" style={styles.label}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, minHeight: 160, alignItems: 'center', justifyContent: 'center', gap: Spacing.two },
  label: { fontSize: 13 },
});
