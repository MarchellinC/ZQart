import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { AdminLayout } from '@/components/admin-layout';
import { useAuth } from '@/contexts/auth-context';
import { useDemoStore } from '@/contexts/demo-store';
import { categoryRepository, initializeDatabase } from '@/database';
import type { CategoryRecord } from '@/database/repositories/categories';
import { Palette } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/theme';
import { categoryFormSchema } from '@/utils/validation';

export default function CategoriesScreen() {
  const { role, ready } = useAuth();
  const { refreshProducts } = useDemoStore();
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const reload = useCallback(async () => {
    const db = await initializeDatabase();
    setCategories(await categoryRepository.list(db));
  }, []);

  useEffect(() => {
    let active = true;
    if (role === 'admin') void (async () => {
      const db = await initializeDatabase();
      const rows = await categoryRepository.list(db);
      if (active) setCategories(rows);
    })().catch((error) => Alert.alert('Kategori gagal dimuat', String(error)));
    return () => { active = false; };
  }, [role]);

  if (!ready || role !== 'admin') return <View style={styles.denied}>
    <Text style={styles.title}>{ready ? 'Akses admin tidak tersedia' : 'Memeriksa akun…'}</Text>
    <Pressable onPress={() => router.replace('/')}><Text style={styles.link}>Kembali ke katalog</Text></Pressable>
  </View>;

  const reset = () => { setSelected(null); setName(''); };
  async function save() {
    const validation = categoryFormSchema.safeParse({ name });
    if (!validation.success) { Alert.alert('Nama kategori diperlukan', validation.error.issues[0]?.message); return; }
    const clean = validation.data.name;
    if (categories.some((item) => item.name.toLocaleLowerCase() === clean.toLocaleLowerCase() && item.id !== selected)) {
      Alert.alert('Kategori sudah ada', 'Gunakan nama kategori lain.');
      return;
    }
    const slug = clean.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (!selected && !slug) { Alert.alert('Nama kategori tidak valid', 'Nama perlu memuat huruf atau angka.'); return; }
    setBusy(true);
    try {
      const db = await initializeDatabase();
      await categoryRepository.save(db, {
        id: selected ?? `category-${slug}`, name: clean,
        updated_at: new Date().toISOString(), sync_status: 'pending',
      });
      await Promise.all([reload(), refreshProducts()]);
      reset();
    } catch (error) {
      Alert.alert('Kategori gagal disimpan', error instanceof Error ? error.message : String(error));
    } finally { setBusy(false); }
  }

  async function remove(item: CategoryRecord) {
    try {
      const db = await initializeDatabase();
      await categoryRepository.remove(db, item.id);
      await Promise.all([reload(), refreshProducts()]);
    } catch (error) {
      Alert.alert('Kategori gagal dihapus', error instanceof Error ? error.message : String(error));
    }
  }

  return <AdminLayout title="Kelola kategori" subtitle="Atur pengelompokan produk toko." active="categories">
    <View style={styles.form}>
      <Text style={styles.heading}>{selected ? 'Ubah kategori' : 'Kategori baru'}</Text>
      <TextInput value={name} onChangeText={setName} placeholder="Contoh: Dekorasi" style={styles.input} />
      <Pressable style={[styles.primary, busy && styles.disabled]} disabled={busy} onPress={() => { void save(); }}>
        <Text style={styles.primaryText}>{busy ? 'Menyimpan…' : selected ? 'Simpan perubahan' : 'Tambah kategori'}</Text>
      </Pressable>
      {selected ? <Pressable onPress={reset}><Text style={styles.link}>Batal mengubah</Text></Pressable> : null}
    </View>
    <Text style={styles.sectionLabel}>{categories.length} kategori tersimpan</Text>
    {categories.map((item) => <View key={item.id} style={styles.row}>
      <View style={styles.copy}>
        <Text style={styles.categoryName}>{item.name}</Text>
        <Text style={styles.status}>{item.sync_status === 'synced' ? 'Tersinkron' : 'Menunggu sinkronisasi'}</Text>
      </View>
      <Pressable onPress={() => { setSelected(item.id); setName(item.name); }}><Text style={styles.link}>Ubah</Text></Pressable>
      <Pressable onPress={() => Alert.alert('Hapus kategori?', `${item.name}. Produk dalam kategori ini akan menjadi tanpa kategori.`, [
        { text: 'Batal' }, { text: 'Hapus', style: 'destructive', onPress: () => { void remove(item); } },
      ])}><Text style={styles.delete}>Hapus</Text></Pressable>
    </View>)}
  </AdminLayout>;
}

const styles = StyleSheet.create({
  denied: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.three, backgroundColor: Palette.gradientStart },
  title: { color: Palette.text, fontSize: 24, fontWeight: '800' },
  form: { padding: Spacing.three, gap: Spacing.two, borderRadius: Radius.medium, backgroundColor: Palette.white },
  heading: { color: Palette.text, fontSize: 16, fontWeight: '800' },
  input: { minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: Palette.border, paddingHorizontal: 12, color: Palette.text },
  primary: { minHeight: 46, borderRadius: Radius.pill, backgroundColor: Palette.primaryDark, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.55 }, primaryText: { color: Palette.white, fontWeight: '700' },
  sectionLabel: { color: Palette.secondaryText, fontSize: 12, fontWeight: '700', marginTop: Spacing.two },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, padding: Spacing.two, borderRadius: Radius.medium, backgroundColor: Palette.white },
  copy: { flex: 1, gap: 3 }, categoryName: { color: Palette.text, fontSize: 14, fontWeight: '700' },
  status: { color: Palette.secondaryText, fontSize: 10 },
  link: { color: Palette.primaryDark, fontWeight: '700', padding: 5 },
  delete: { color: Palette.error, fontWeight: '700', padding: 5 },
});
