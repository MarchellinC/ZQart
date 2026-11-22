import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { Palette } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/theme';
import { ThemedText } from './themed-text';

type Props = { greeting?: string; title?: string };

export function AppHeader({ greeting = 'Selamat datang,', title = 'Nadia' }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.identity}>
        <Image source={require('@/assets/images/zqart-logo.png')} style={styles.logo} contentFit="contain" />
        <View>
          <ThemedText style={styles.brand}>ZQART</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.greeting}>
            {greeting} <ThemedText style={styles.name}>{title}</ThemedText>
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 72, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two,
    flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center',
    backgroundColor: Palette.navbar, borderRadius: Radius.medium,
  },
  identity: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  logo: { width: 42, height: 36 },
  brand: { fontSize: 15, fontWeight: '800', letterSpacing: 2, color: Palette.primaryDark },
  greeting: { fontSize: 12, marginTop: 1 },
  name: { color: Palette.text, fontWeight: '700' },
});
