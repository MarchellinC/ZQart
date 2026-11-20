import { useAuth } from '@/contexts/auth-context';
import { useDemoStore } from '@/contexts/demo-store';
import { Palette } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/theme';
import { AdminLayout } from '@/components/admin-layout';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '@/components/primary-button';

export default function SyncStatusScreen() {
  const { role, ready } = useAuth();
  const { syncInfo, syncNow } = useDemoStore();
  if (!ready || role !== 'admin') return <View style={styles.denied}>
    <Text style={styles.title}>{ready ? 'Akses admin tidak tersedia' : 'Memeriksa akun…'}</Text>
    <Pressable onPress={() => router.replace('/')}><Text style={styles.link}>Kembali ke katalog</Text></Pressable>
  </View>;

  const label = syncInfo.state === 'syncing' ? 'Sedang menyinkronkan'
    : syncInfo.state === 'offline' ? 'Perangkat sedang offline'
      : syncInfo.state === 'error' ? 'Sinkronisasi mengalami kendala'
        : syncInfo.state === 'synced' ? 'Pemeriksaan terakhir selesai' : 'Menunggu pemeriksaan';
  return <AdminLayout title="Sinkronisasi data" subtitle="Perubahan lokal disimpan dulu, lalu dicoba ulang saat internet tersedia." active="sync">
    <View style={styles.card}>
      <View style={styles.statusRow}>
        <View style={[styles.dot, syncInfo.state === 'synced' && styles.dotOk, syncInfo.state === 'error' && styles.dotError]} />
        <Text style={styles.heading}>{label}</Text>
      </View>
      <Text style={styles.detail}>{syncInfo.error ?? (syncInfo.pending
        ? `${syncInfo.pending} perubahan masih menunggu sinkronisasi.`
        : 'Tidak ada perubahan yang menunggu.')}</Text>
      <Text style={styles.meta}>Terakhir berhasil: {syncInfo.lastSyncedAt
        ? new Date(syncInfo.lastSyncedAt).toLocaleString('id-ID') : 'Belum pernah'}</Text>
      <PrimaryButton title="Sinkronkan sekarang" loading={syncInfo.state === 'syncing'} onPress={() => { void syncNow(); }} />
    </View>
    <View style={styles.infoCard}>
      <Text style={styles.heading}>Cara kerja</Text>
      <Text style={styles.detail}>SQLite menjadi sumber baca utama agar katalog tetap tersedia offline. Perubahan yang belum terkirim tetap berada di antrean lokal dan dicoba ulang saat koneksi pulih.</Text>
    </View>
  </AdminLayout>;
}

const styles = StyleSheet.create({
  denied: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.three, backgroundColor: Palette.gradientStart },
  title: { color: Palette.text, fontSize: 24, fontWeight: '800' },
  card: { padding: Spacing.three, gap: Spacing.two, borderRadius: Radius.medium, backgroundColor: Palette.white },
  infoCard: { padding: Spacing.three, gap: Spacing.two, borderRadius: Radius.medium, backgroundColor: Palette.primarySoft },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: Palette.warning },
  dotOk: { backgroundColor: Palette.success }, dotError: { backgroundColor: Palette.error },
  heading: { color: Palette.text, fontSize: 15, fontWeight: '800' },
  detail: { color: Palette.secondaryText, fontSize: 12, lineHeight: 19 },
  meta: { color: Palette.secondaryText, fontSize: 10 },
  link: { color: Palette.primaryDark, fontWeight: '700', padding: 5 },
});
