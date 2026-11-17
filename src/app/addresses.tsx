import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/auth-context';
import { initializeDatabase, addressRepository } from '@/database';
import type { AddressRecord } from '@/database/repositories/addresses';
import { Palette } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/theme';

type Fields = Omit<AddressRecord, 'id' | 'user_id' | 'is_default'>;
const empty: Fields = { recipient_name: '', phone_number: '', province: '', city: '', district: '', postal_code: '', full_address: '' };
const labels: [keyof Fields, string][] = [
  ['recipient_name', 'Nama penerima'], ['phone_number', 'Nomor telepon'], ['province', 'Provinsi'],
  ['city', 'Kota/Kabupaten'], ['district', 'Kecamatan'], ['postal_code', 'Kode pos'], ['full_address', 'Alamat lengkap'],
];

export default function AddressesScreen() {
  const { user, role } = useAuth();
  const [items, setItems] = useState<AddressRecord[]>([]);
  const [form, setForm] = useState<Fields>(empty);
  const [selected, setSelected] = useState<string | null>(null);
  const [isDefault, setIsDefault] = useState(false);
  const reload = useCallback(async () => {
    if (!user) return;
    const db = await initializeDatabase();
    setItems(await addressRepository.listForUser(db, user.uid));
  }, [user?.uid]);
  useEffect(() => { void reload().catch((error) => Alert.alert('Alamat gagal dimuat', String(error))); }, [reload]);
  if (!user || role !== 'buyer') return <View style={styles.center}><Text style={styles.title}>Masuk sebagai buyer untuk mengelola alamat.</Text><Pressable onPress={() => router.replace('/login')}><Text style={styles.link}>Masuk</Text></Pressable></View>;
  const uid = user.uid;
  const update = (key: keyof Fields, value: string) => setForm((current) => ({ ...current, [key]: value }));
  const reset = () => { setForm(empty); setSelected(null); setIsDefault(false); };
  async function save() {
    if (Object.values(form).some((value) => !value.trim())) { Alert.alert('Form belum lengkap', 'Isi semua bagian alamat.'); return; }
    try {
      const db = await initializeDatabase();
      await addressRepository.save(db, { ...form, id: selected ?? `address-${Date.now()}`, user_id: uid, is_default: isDefault || items.length === 0 ? 1 : 0 });
      await reload(); reset();
    } catch (error) { Alert.alert('Alamat gagal disimpan', error instanceof Error ? error.message : String(error)); }
  }
  async function remove(id: string) {
    const db = await initializeDatabase(); await addressRepository.remove(db, uid, id); await reload();
  }
  return <ScrollView contentContainerStyle={styles.content}>
    <Text style={styles.title}>Alamat pengiriman</Text>
    <View style={styles.form}>
      <Text style={styles.heading}>{selected ? 'Ubah alamat' : 'Tambah alamat'}</Text>
      {labels.map(([key, label]) => <View key={key} style={styles.field}><Text style={styles.label}>{label}</Text><TextInput
        value={form[key]} onChangeText={(value) => update(key, value)} style={styles.input} multiline={key === 'full_address'} /></View>)}
      <Pressable style={styles.defaultButton} onPress={() => setIsDefault((value) => !value)}><Text style={styles.link}>{isDefault ? '★ Alamat utama' : 'Jadikan alamat utama'}</Text></Pressable>
      <Pressable style={styles.primary} onPress={() => { void save(); }}><Text style={styles.primaryText}>Simpan alamat</Text></Pressable>
      {selected ? <Pressable onPress={reset}><Text style={styles.link}>Batal mengubah</Text></Pressable> : null}
    </View>
    {items.map((item) => <View key={item.id} style={styles.card}>
      <Text style={styles.heading}>{item.recipient_name}{item.is_default ? ' · Utama' : ''}</Text>
      <Text style={styles.detail}>{item.phone_number} · {item.full_address}, {item.district}, {item.city}, {item.province} {item.postal_code}</Text>
      <View style={styles.actions}>
        <Pressable onPress={() => { setSelected(item.id); setForm({ ...item }); setIsDefault(Boolean(item.is_default)); }}><Text style={styles.link}>Ubah</Text></Pressable>
        {!item.is_default ? <Pressable onPress={() => { void (async () => { const db = await initializeDatabase(); await addressRepository.setDefault(db, uid, item.id); await reload(); })().catch((error) => Alert.alert('Gagal mengubah alamat utama', String(error))); }}><Text style={styles.link}>Jadikan utama</Text></Pressable> : null}
        <Pressable onPress={() => Alert.alert('Hapus alamat?', item.recipient_name, [{ text: 'Batal' }, { text: 'Hapus', style: 'destructive', onPress: () => { void remove(item.id).catch((error) => Alert.alert('Gagal', String(error))); } }])}><Text style={styles.delete}>Hapus</Text></Pressable>
      </View>
    </View>)}
    <Pressable onPress={() => router.back()}><Text style={styles.link}>Kembali</Text></Pressable>
  </ScrollView>;
}

const styles = StyleSheet.create({
  content: { padding: Spacing.three, gap: Spacing.two, backgroundColor: Palette.gradientStart, flexGrow: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.four, gap: Spacing.two, backgroundColor: Palette.gradientStart },
  title: { color: Palette.text, fontSize: 22, fontWeight: '800' },
  form: { padding: Spacing.three, gap: Spacing.two, borderRadius: Radius.medium, backgroundColor: Palette.white },
  heading: { color: Palette.text, fontSize: 15, fontWeight: '800' }, field: { gap: 4 },
  label: { color: Palette.secondaryText, fontSize: 11, fontWeight: '700' },
  input: { minHeight: 42, borderWidth: 1, borderColor: Palette.border, borderRadius: 12, paddingHorizontal: 10, color: Palette.text },
  defaultButton: { alignSelf: 'flex-start', padding: Spacing.one },
  primary: { minHeight: 46, borderRadius: Radius.pill, backgroundColor: Palette.primaryDark, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: Palette.white, fontWeight: '700' },
  card: { padding: Spacing.three, gap: Spacing.two, borderRadius: Radius.medium, backgroundColor: Palette.white },
  detail: { color: Palette.secondaryText, fontSize: 12, lineHeight: 18 },
  actions: { flexDirection: 'row', gap: Spacing.three }, link: { color: Palette.primaryDark, fontWeight: '700', paddingVertical: 5 },
  delete: { color: Palette.error, fontWeight: '700', paddingVertical: 5 },
});
