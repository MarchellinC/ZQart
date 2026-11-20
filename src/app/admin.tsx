import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import type { ImagePickerAsset } from 'expo-image-picker';
import { router } from 'expo-router';
import { AdminLayout } from '@/components/admin-layout';
import { useAuth } from '@/contexts/auth-context';
import { useDemoStore } from '@/contexts/demo-store';
import { initializeDatabase, productRepository, categoryRepository } from '@/database';
import type { ProductRecord } from '@/database/repositories/products';
import type { CategoryRecord } from '@/database/repositories/categories';
import { Palette } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/theme';
import { productFormSchema } from '@/utils/validation';
import { uploadProductImage } from '@/services/cloudinary/upload';

export default function AdminScreen() {
  const { role, ready } = useAuth();
  const { products, refreshProducts } = useDemoStore();
  const [selected, setSelected] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [price, setPrice] = useState('');
  const [priceFocused, setPriceFocused] = useState(false);
  const [priceSelection, setPriceSelection] = useState({ start: 0, end: 0 });
  const [stock, setStock] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedImage, setSelectedImage] = useState<ImagePickerAsset | null>(null);
  const [busy, setBusy] = useState(false);
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
  const reset = () => { setSelected(null); setName(''); setDescription(''); setCategory(''); setCategoryOpen(false); setPrice(''); setPriceFocused(false); setStock(''); setImageUrl(''); setSelectedImage(null); };
  async function pickImage() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [4, 3], quality: 0.85 });
      if (!result.canceled) { setSelectedImage(result.assets[0]); setImageUrl(''); }
    } catch (error) { Alert.alert('Foto tidak dapat dibuka', error instanceof Error ? error.message : String(error)); }
  }
  async function save() {
    const amount = parsePrice(price);
    const parsed = productFormSchema.safeParse({ name, description, category, price: Number.isFinite(amount) ? String(amount) : '', stock, imageUrl });
    if (!parsed.success) { Alert.alert('Data belum valid', parsed.error.issues[0]?.message ?? 'Periksa kembali data produk.'); return; }
    const count = Number(stock);
    setBusy(true);
    try {
      const db = await initializeDatabase();
      const savedCategories = await categoryRepository.list(db);
      const selectedCategory = savedCategories.find((item) => item.name.toLocaleLowerCase() === category.trim().toLocaleLowerCase());
      if (!selectedCategory) throw new Error('Kategori ini sudah tidak tersedia. Muat ulang halaman lalu pilih kategori yang ada.');
      setCategories(savedCategories);
      const old = products.find((item) => item.id === selected);
      const uploadedImageUrl = selectedImage ? await uploadProductImage(selectedImage) : imageUrl.trim();
      const record: ProductRecord = {
        id: selected ?? `product-${Date.now()}`, name: name.trim(), description: description.trim(),
        price: amount, image_url: uploadedImageUrl || old?.image_url || null, category_id: selectedCategory.id, stock: count,
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
  return <AdminLayout title="Dashboard toko" subtitle="Kelola katalog dan pantau operasional ZQART." active="products">
    <View style={styles.content}>
    <Text style={styles.title}>Kelola produk</Text>
    <Text style={styles.subtitle}>Perubahan disimpan di SQLite perangkat ini.</Text>
    <View style={styles.form}>
      <Text style={styles.formTitle}>{selected ? 'Ubah produk' : 'Tambah produk'}</Text>
      <Field label="Nama" value={name} onChangeText={setName} />
      <Field label="Deskripsi" value={description} onChangeText={setDescription} />
      <View style={styles.field}>
        <Text style={styles.label}>Kategori</Text>
        <Pressable style={styles.dropdownButton} onPress={() => setCategoryOpen((open) => !open)}>
          <Text style={[styles.dropdownText, !category && styles.placeholder]}>{category || 'Pilih kategori'}</Text>
          <Text style={styles.dropdownChevron}>{categoryOpen ? '⌃' : '⌄'}</Text>
        </Pressable>
        {categoryOpen ? <View style={styles.dropdownMenu}>
          {categories.length ? categories.map((item) => <Pressable key={item.id} style={styles.dropdownOption}
            onPress={() => { setCategory(item.name); setCategoryOpen(false); }}>
            <Text style={[styles.dropdownText, category === item.name && styles.optionSelected]}>{item.name}</Text>
          </Pressable>) : <Text style={styles.emptyCategories}>Belum ada kategori.</Text>}
          <Pressable style={styles.manageCategories} onPress={() => router.push('/categories')}>
            <Text style={styles.link}>Kelola kategori</Text>
          </Pressable>
        </View> : null}
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Harga</Text>
        <View style={styles.priceInputWrap}>
          <Text style={styles.currency}>Rp</Text>
          <TextInput value={priceFocused ? formatGroupedPrice(price) : formatPrice(price)} selection={priceFocused ? priceSelection : undefined} onFocus={() => {
            const currentPrice = parsePrice(price);
            const raw = Number.isFinite(currentPrice) ? String(Math.trunc(currentPrice)) : '';
            setPrice(raw); setPriceSelection({ start: raw.length, end: raw.length }); setPriceFocused(true);
          }} onBlur={() => setPriceFocused(false)} onChangeText={(value) => {
            const raw = value.replace(/\D/g, '');
            const cursor = formatGroupedPrice(raw).length;
            setPrice(raw); setPriceSelection({ start: cursor, end: cursor });
          }}
            keyboardType="number-pad" style={styles.priceInput} placeholder="0,00" />
        </View>
        <Text style={styles.hint}>Pemisah ribuan dan ,00 ditampilkan otomatis setelah selesai mengetik.</Text>
      </View>
      <Field label="Stok" value={stock} onChangeText={setStock} numeric />
      <View style={styles.field}>
        <Text style={styles.label}>Foto produk</Text>
        {(selectedImage || imageUrl) ? <View style={styles.imagePreview}><Image source={{ uri: selectedImage?.uri ?? imageUrl }} style={styles.image} contentFit="contain" /></View> : <View style={styles.imagePlaceholder}><Text style={styles.hint}>Belum ada foto</Text></View>}
        <Pressable style={styles.outline} disabled={busy} onPress={() => { void pickImage(); }}>
          <Text style={styles.link}>{selectedImage ? 'Pilih foto lain' : 'Pilih foto dari perangkat'}</Text>
        </Pressable>
        {selectedImage ? <Text style={styles.hint}>{selectedImage.fileName ?? 'Foto dipilih'} · diunggah saat disimpan (maks. 8 MB).</Text> : null}
        <Field label="Atau tempel URL gambar" value={imageUrl} onChangeText={(value) => { setImageUrl(value); setSelectedImage(null); }} />
      </View>
      <Pressable style={styles.primary} disabled={busy} onPress={() => { void save(); }}><Text style={styles.primaryText}>{busy ? 'Menyimpan…' : selected ? 'Simpan perubahan' : 'Tambah produk'}</Text></Pressable>
      {selected ? <Pressable onPress={reset}><Text style={styles.link}>Batal mengubah</Text></Pressable> : null}
    </View>
    {products.map((item) => <View key={item.id} style={styles.row}>
      <View style={styles.rowInfo}><Text style={styles.productName}>{item.name}</Text><Text style={styles.subtitle}>Rp {item.price} · Stok {item.stock}</Text></View>
      <Pressable onPress={() => {
        setSelected(item.id); setName(item.name); setDescription(item.description ?? '');
        setCategory(item.category); setPrice(String(item.price)); setPriceFocused(false); setCategoryOpen(false); setStock(String(item.stock ?? 0));
        setImageUrl(item.image_url ?? ''); setSelectedImage(null);
      }}><Text style={styles.link}>Ubah</Text></Pressable>
      <Pressable onPress={() => Alert.alert('Hapus produk?', item.name, [{ text: 'Batal' }, { text: 'Hapus', style: 'destructive', onPress: () => { void remove(item.id); } }])}><Text style={styles.delete}>Hapus</Text></Pressable>
    </View>)}
    </View>
  </AdminLayout>;
}

function Field(props: { label: string; value: string; onChangeText: (value: string) => void; numeric?: boolean }) {
  return <View style={styles.field}><Text style={styles.label}>{props.label}</Text><TextInput
    value={props.value} onChangeText={props.onChangeText} keyboardType={props.numeric ? 'decimal-pad' : 'default'}
    style={styles.input} /></View>;
}

function parsePrice(value: string) {
  if (!value.trim()) return Number.NaN;
  const normalized = value.includes(',') ? value.replace(/\./g, '').replace(',', '.') : value;
  return Number(normalized);
}

function formatPrice(value: string) {
  const amount = parsePrice(value);
  if (!Number.isFinite(amount)) return '';
  return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
}

function formatGroupedPrice(value: string) {
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
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
  dropdownButton: { minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: Palette.border, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Palette.white },
  dropdownText: { color: Palette.text, fontSize: 14 },
  placeholder: { color: Palette.secondaryText },
  dropdownChevron: { color: Palette.primaryDark, fontSize: 18, fontWeight: '800' },
  dropdownMenu: { borderWidth: 1, borderColor: Palette.border, borderRadius: 12, backgroundColor: Palette.white, overflow: 'hidden' },
  dropdownOption: { minHeight: 42, justifyContent: 'center', paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: Palette.border },
  optionSelected: { color: Palette.primaryDark, fontWeight: '800' },
  emptyCategories: { padding: 12, color: Palette.secondaryText, fontSize: 12 },
  manageCategories: { alignItems: 'flex-start', paddingHorizontal: 8, paddingVertical: 6 },
  priceInputWrap: { minHeight: 44, borderRadius: 12, borderWidth: 1, borderColor: Palette.border, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  currency: { color: Palette.primaryDark, fontWeight: '800' },
  priceInput: { flex: 1, minHeight: 42, color: Palette.text },
  imagePreview: { width: '100%', height: 170, borderRadius: 12, backgroundColor: Palette.gradientStart, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  imagePlaceholder: { width: '100%', height: 120, borderRadius: 12, backgroundColor: Palette.gradientStart, alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '100%' },
  outline: { minHeight: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 12, borderWidth: 1, borderColor: Palette.primaryDark },
  hint: { color: Palette.secondaryText, fontSize: 12 },
  primary: { minHeight: 46, alignItems: 'center', justifyContent: 'center', borderRadius: Radius.pill, backgroundColor: Palette.primaryDark },
  primaryText: { color: Palette.white, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, padding: Spacing.two, borderRadius: 14, backgroundColor: Palette.white },
  rowInfo: { flex: 1 }, productName: { color: Palette.text, fontWeight: '700' },
  link: { color: Palette.primaryDark, fontWeight: '700', padding: 4 }, delete: { color: Palette.error, fontWeight: '700', padding: 4 },
});
