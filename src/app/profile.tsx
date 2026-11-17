import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AppHeader } from '@/components/app-header';
import { BuyerPage } from '@/components/buyer-page';
import { Palette } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { logOut } from '@/services/firebase/auth';

export default function ProfileScreen() {
  const { user, role, ready } = useAuth();
  const name = user?.displayName || 'Buyer';
  return (
    <BuyerPage active="profile">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader greeting="Akun" title={name} />
        <View style={styles.card}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{user?.displayName?.[0]?.toUpperCase() ?? 'B'}</Text></View>
          <View style={styles.info}>
            <Text style={styles.name}>{user?.displayName ?? (ready ? 'Tamu' : 'Memeriksa sesi…')}</Text>
            <Text style={styles.email}>{user?.email ?? 'Jelajahi ZQART tanpa login'}</Text>
          </View>
        </View>
        <Text style={styles.section}>Akun ZQART</Text>
        {role === 'admin' ? <Pressable style={styles.secondary} onPress={() => router.push('/admin')}><Text style={styles.secondaryText}>Kelola produk dan stok</Text></Pressable> : null}
        {user ? (
          <>
          {role === 'buyer' ? <Pressable style={styles.secondary} onPress={() => router.push('/addresses')}><Text style={styles.secondaryText}>Kelola alamat pengiriman</Text></Pressable> : null}
          <Pressable style={styles.primary} onPress={() => { void logOut(); }}><Text style={styles.primaryText}>Keluar</Text></Pressable>
          </>
        ) : (
          <View style={styles.actions}>
            <Pressable style={styles.primary} onPress={() => router.push('/login')}><Text style={styles.primaryText}>Masuk</Text></Pressable>
            <Pressable style={styles.secondary} onPress={() => router.push('/register')}><Text style={styles.secondaryText}>Buat akun baru</Text></Pressable>
          </View>
        )}
        <Text style={styles.footer}>Masuk untuk menyimpan favorit dan keranjangmu.</Text>
      </ScrollView>
    </BuyerPage>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.four },
  card: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, padding: Spacing.three, borderRadius: Radius.medium, backgroundColor: Palette.white },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: Palette.primarySoft, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: Palette.primaryDark, fontSize: 20, fontWeight: '800' },
  info: { flex: 1, gap: 4 },
  name: { color: Palette.text, fontSize: 15, fontWeight: '800' },
  email: { color: Palette.secondaryText, fontSize: 11 },
  section: { color: Palette.text, fontSize: 16, fontWeight: '800', marginTop: Spacing.two },
  actions: { gap: Spacing.two },
  primary: { minHeight: 50, borderRadius: Radius.pill, backgroundColor: Palette.primaryDark, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: Palette.white, fontSize: 14, fontWeight: '700' },
  secondary: { minHeight: 48, borderRadius: Radius.pill, borderWidth: 1, borderColor: Palette.primaryDark, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { color: Palette.primaryDark, fontSize: 14, fontWeight: '700' },
  footer: { color: Palette.secondaryText, fontSize: 11, textAlign: 'center' },
});
