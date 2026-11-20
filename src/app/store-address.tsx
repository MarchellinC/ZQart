import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { AdminLayout } from '@/components/admin-layout';
import { useAuth } from '@/contexts/auth-context';
import { initializeDatabase, storeAddressRepository } from '@/database';
import type { StoreAddressRecord } from '@/database/repositories/store-address';
import { Palette } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/theme';
import { addressFieldsSchema } from '@/utils/validation';

type Fields = Omit<StoreAddressRecord, 'updated_at' | 'sync_status'>;
const empty: Fields = {
  recipient_name: '', phone_number: '', province: '', city: '', district: '',
  postal_code: '', full_address: '',
};
const labels: [keyof Fields, string][] = [
  ['recipient_name', 'Nama penanggung jawab'], ['phone_number', 'Nomor telepon toko'],
  ['province', 'Provinsi'], ['city', 'Kota/Kabupaten'], ['district', 'Kecamatan'],
  ['postal_code', 'Kode pos'], ['full_address', 'Alamat lengkap'],
];

export default function StoreAddressScreen() {
  const { role, ready } = useAuth();
  const [form, setForm] = useState<Fields>(empty);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    if (role === 'admin') void (async () => {
      const db = await initializeDatabase();
      const address = await storeAddressRepository.get(db);
      if (!active || !address) return;
      const { updated_at: _updatedAt, sync_status: _syncStatus, ...fields } = address;
      setForm(fields);
    })().catch((error) => Alert.alert('Alamat toko gagal dimuat', String(error)));
    return () => { active = false; };
  }, [role]);

  if (!ready || role !== 'admin') {
    return <View style={styles.center}>
      <Text style={styles.title}>{ready ? 'Akses admin tidak tersedia' : 'Memeriksa akun…'}</Text>
      <Pressable onPress={() => router.replace('/')}><Text style={styles.link}>Kembali ke katalog</Text></Pressable>
    </View>;
  }

  const update = (key: keyof Fields, value: string) => setForm((current) => ({ ...current, [key]: value }));
  async function save() {
    const validation = addressFieldsSchema.safeParse(form);
    if (!validation.success) {
      Alert.alert('Form belum lengkap', validation.error.issues[0]?.message);
      return;
    }
    setBusy(true);
    try {
      const db = await initializeDatabase();
      await storeAddressRepository.save(db, {
        ...validation.data, updated_at: new Date().toISOString(), sync_status: 'pending',
      });
      Alert.alert('Alamat toko tersimpan', 'Alamat ini digunakan sebagai asal pada checkout simulasi.');
    } catch (error) {
      Alert.alert('Alamat toko gagal disimpan', error instanceof Error ? error.message : String(error));
    } finally {
      setBusy(false);
    }
  }

  return <AdminLayout title="Alamat asal toko" subtitle="Satu alamat aktif digunakan sebagai asal checkout." active="store">
    <View style={styles.form}>
      {labels.map(([key, label]) => <View key={key} style={styles.field}>
        <Text style={styles.label}>{label}</Text>
        <TextInput value={form[key]} onChangeText={(value) => update(key, value)}
          style={[styles.input, key === 'full_address' && styles.multiline]} multiline={key === 'full_address'} />
      </View>)}
      <Pressable style={[styles.primary, busy && styles.disabled]} disabled={busy} onPress={() => { void save(); }}>
        <Text style={styles.primaryText}>{busy ? 'Menyimpan…' : 'Simpan alamat toko'}</Text>
      </Pressable>
    </View>
  </AdminLayout>;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.four, gap: Spacing.two, backgroundColor: Palette.gradientStart },
  title: { color: Palette.text, fontSize: 22, fontWeight: '800' },
  subtitle: { color: Palette.secondaryText, fontSize: 12 },
  form: { padding: Spacing.three, gap: Spacing.two, borderRadius: Radius.medium, backgroundColor: Palette.white },
  field: { gap: 4 }, label: { color: Palette.secondaryText, fontSize: 11, fontWeight: '700' },
  input: { minHeight: 42, borderWidth: 1, borderColor: Palette.border, borderRadius: 12, paddingHorizontal: 10, color: Palette.text },
  multiline: { minHeight: 88, paddingVertical: 10, textAlignVertical: 'top' },
  primary: { minHeight: 46, borderRadius: Radius.pill, backgroundColor: Palette.primaryDark, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.55 }, primaryText: { color: Palette.white, fontWeight: '700' },
  link: { color: Palette.primaryDark, fontWeight: '700', paddingVertical: 8 },
});
