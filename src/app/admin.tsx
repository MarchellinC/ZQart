import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/auth-context';
import { useDemoStore } from '@/contexts/demo-store';
import { initializeDatabase, productRepository, categoryRepository } from '@/database';
import type { ProductRecord } from '@/database/repositories/products';
import { Palette } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/theme';

export default function AdminScreen() {
  const { role, ready } = useAuth();
  const { products, refreshProducts } = useDemoStore();
  const [selected, setSelected] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const item = products.find((product) => product.id === selected);
    if (!item) return;
    setName(item.name); setDescription(item.description ?? ''); setCategory(item.category);
    setPrice(String(item.price)); setStock(String(item.stock ?? 0));
  }, [selected, products]);
  if (!ready || role !== 'admin') return <View style={styles.denied}>
    <Text style={styles.title}>{ready ? 'Akses admin tidak tersedia' : 'Memeriksa akun…'}</Text>
    <Pressable onPress={() => router.replace('/')}><Text style={styles.link}>Kembali ke katalog</Text></Pressable>
  </View>;
  const reset = () => { setSelected(null); setName(''); setDescription(''); setCategory(''); setPrice(''); setStock(''); };
  async function save() {
    const amount = Number(price); const count = Number(stock);
    if (!name.trim() || !description.trim() || !category.trim() || !Number.isFinite(amount) || amount < 0
      || !Number.isInteger(count) || count < 0) { Alert.alert('Data belum valid', 'Isi nama, deskripsi, kategori, harga, dan stok dengan benar.'); return; }
    setBusy(true);
    try {
      const db = await initializeDatabase();
      const categoryId = `category-${category.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')}`;
      await categoryRepository.save(db, { id: categoryId, name: category.trim(), updated_at: new Date().toISOString(), sync_status: 'pending' });
      const old = products.find((item) => item.id === selected);
      const record: ProductRecord = {
        id: selected ?? `product-${Date.now()}`, name: name.trim(), description: description.trim(),
        price: amount, image_url: old?.image_url ?? null, category_id: categoryId, stock: count,
        updated_at: new Date().toISOString(), sync_status: 'pending',
      };
      await productRepository.save(db, record);
      await refreshProducts(); reset();
    } catch (error) { Alert.alert('Gagal menyimpan produk', error instanceof Error ? error.message : String(error)); }
    finally { setBusy(false); }
  }
  async function remove(id: string) {
    try { const db = await initializeDatabase(); await productRepository.remove(db, id); await refreshProducts(); }
    catch (error) { Alert.alert('Gagal menghapus', error instanceof Error ? error.message : String(error)); }
  }
  return <ScrollView contentContainerStyle={styles.content}>
    <Text style={styles.title}>Kelola produk</Text>
    <Text style={styles.subtitle}>Perubahan disimpan di SQLite perangkat ini.</Text>
    <View style={styles.form}>
      <Text style={styles.formTitle}>{selected ? 'Ubah produk' : 'Tambah produk'}</Text>
      <Field label="Nama" value={name} onChangeText={setName} />
      <Field label="Deskripsi" value={description} onChangeText={setDescription} />
      <Field label="Kategori" value={category} onChangeText={setCategory} />
      <Field label="Harga (Rp)" value={price} onChangeText={setPrice} numeric />
      <Field label="Stok" value={stock} onChangeText={setStock} numeric />
      <Pressable style={styles.primary} disabled={busy} onPress={() => { void save(); }}><Text style={styles.primaryText}>{busy ? 'Menyimpan…' : selected ? 'Simpan perubahan' : 'Tambah produk'}</Text></Pressable>
      {selected ? <Pressable onPress={reset}><Text style={styles.link}>Batal mengubah</Text></Pressable> : null}
    </View>
    {products.map((item) => <View key={item.id} style={styles.row}>
      <View style={styles.rowInfo}><Text style={styles.productName}>{item.name}</Text><Text style={styles.subtitle}>Rp {item.price} · Stok {item.stock}</Text></View>
      <Pressable onPress={() => setSelected(item.id)}><Text style={styles.link}>Ubah</Text></Pressable>
      <Pressable onPress={() => Alert.alert('Hapus produk?', item.name, [{ text: 'Batal' }, { text: 'Hapus', style: 'destructive', onPress: () => { void remove(item.id); } }])}><Text style={styles.delete}>Hapus</Text></Pressable>
    </View>)}
    <Pressable style={styles.secondary} onPress={() => router.replace('/')}><Text style={styles.link}>Kembali ke katalog</Text></Pressable>
  </ScrollView>;
}

function Field(props: { label: string; value: string; onChangeText: (value: string) => void; numeric?: boolean }) {
  return <View style={styles.field}><Text style={styles.label}>{props.label}</Text><TextInput
    value={props.value} onChangeText={props.onChangeText} keyboardType={props.numeric ? 'decimal-pad' : 'default'}
    style={styles.input} /></View>;
}

const styles = StyleSheet.create({
  content: { padding: Spacing.three, gap: Spacing.two, backgroundColor: Palette.gradientStart, flexGrow: 1 },
  denied: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.three, backgroundColor: Palette.gradientStart },
  title: { color: Palette.text, fontSize: 24, fontWeight: '800' },
  subtitle: { color: Palette.secondaryText, fontSize: 12 },
  form: { padding: Spacing.three, gap: Spacing.two, borderRadius: Radius.medium, backgroundColor: Palette.white },
  formTitle: { fontSize: 16, fontWeight: '800', color: Palette.text },
  field: { gap: 5 }, label: { fontSize: 12, fontWeight: '700', color: Palette.text },
  input: { minHeight: 42, borderRadius: 12, borderWidth: 1, borderColor: Palette.border, paddingHorizontal: 12, color: Palette.text },
  primary: { minHeight: 46, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.pill, backgroundColor: Palette.primaryDark },
  primaryText: { color: Palette.white, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, padding: Spacing.two, borderRadius: 14, backgroundColor: Palette.white },
  rowInfo: { flex: 1 }, productName: { color: Palette.text, fontWeight: '700' },
  link: { color: Palette.primaryDark, fontWeight: '700', padding: 4 }, delete: { color: Palette.error, fontWeight: '700', padding: 4 },
  secondary: { alignItems: 'center', padding: Spacing.two },
});
