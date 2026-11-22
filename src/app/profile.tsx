import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { AppHeader } from '@/components/app-header';
import { BuyerPage } from '@/components/buyer-page';
import { Palette } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { logOut, updateDisplayName } from '@/services/firebase/auth';
import { initializeDatabase, userRepository } from '@/database';
import { profileNameSchema } from '@/utils/validation';
import { useDemoStore } from '@/contexts/demo-store';

export default function ProfileScreen() {
  const { user, role, ready } = useAuth();
  const { syncNow } = useDemoStore();
  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [savedProfile, setSavedProfile] = useState<{ uid: string; name: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const name = savedProfile && savedProfile.uid === user?.uid ? savedProfile.name : user?.displayName || 'Buyer';
  function beginEdit() { setNameDraft(name); setEditing(true); }
  async function saveProfile() {
    const validation = profileNameSchema.safeParse({ name: nameDraft });
    if (!validation.success) { Alert.alert('Nama belum valid', validation.error.issues[0]?.message); return; }
    if (!user || !role) return;
    setSaving(true);
    try {
      const updatedUser = await updateDisplayName(validation.data.name);
      const db = await initializeDatabase();
      const existing = await userRepository.findById(db, user.uid);
      await userRepository.save(db, {
        id: user.uid, name: validation.data.name, email: user.email ?? '', role,
        created_at: existing?.created_at ?? new Date().toISOString(), updated_at: new Date().toISOString(),
        sync_status: 'pending',
      });
      setSavedProfile({ uid: user.uid, name: updatedUser.displayName ?? validation.data.name });
      setEditing(false);
      void syncNow();
    } catch (error) {
      Alert.alert('Profil gagal diperbarui', error instanceof Error ? error.message : String(error));
    } finally { setSaving(false); }
  }
  return (
    <BuyerPage active="profile">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader greeting="Akun" title={name} />
        <View style={styles.card}>
          <View style={styles.avatar}><Text style={styles.avatarText}>{name[0]?.toUpperCase() ?? 'B'}</Text></View>
          <View style={styles.info}>
            <Text style={styles.name}>{user ? name : ready ? 'Tamu' : 'Memeriksa sesi…'}</Text>
            <Text style={styles.email}>{user?.email ?? 'Jelajahi ZQART tanpa login'}</Text>
            {user ? <Text style={styles.roleLabel}>{role === 'admin' ? 'Administrator toko' : 'Buyer'}</Text> : null}
          </View>
        </View>
        <Text style={styles.section}>Akun ZQART</Text>
        {user ? editing ? <View style={styles.editForm}>
          <Text style={styles.label}>Nama profil</Text>
          <TextInput value={nameDraft} onChangeText={setNameDraft} style={styles.input} autoCapitalize="words" />
          <Pressable style={styles.primary} disabled={saving} onPress={() => { void saveProfile(); }}>
            <Text style={styles.primaryText}>{saving ? 'Menyimpan…' : 'Simpan profil'}</Text>
          </Pressable>
          <Pressable style={styles.secondary} onPress={() => setEditing(false)}><Text style={styles.secondaryText}>Batal</Text></Pressable>
        </View> : <Pressable style={styles.secondary} onPress={beginEdit}><Text style={styles.secondaryText}>Ubah profil</Text></Pressable> : null}
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
  roleLabel: { color: Palette.primaryDark, fontSize: 10, fontWeight: '800', marginTop: 3 },
  section: { color: Palette.text, fontSize: 16, fontWeight: '800', marginTop: Spacing.two },
  actions: { gap: Spacing.two },
  editForm: { padding: Spacing.three, gap: Spacing.two, borderRadius: Radius.medium, backgroundColor: Palette.white },
  label: { color: Palette.text, fontSize: 12, fontWeight: '700' },
  input: { minHeight: 42, borderRadius: 12, borderWidth: 1, borderColor: Palette.border, paddingHorizontal: 12, color: Palette.text },
  primary: { minHeight: 50, borderRadius: Radius.pill, backgroundColor: Palette.primaryDark, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: Palette.white, fontSize: 14, fontWeight: '700' },
  secondary: { minHeight: 48, borderRadius: Radius.pill, borderWidth: 1, borderColor: Palette.primaryDark, alignItems: 'center', justifyContent: 'center' },
  secondaryText: { color: Palette.primaryDark, fontSize: 14, fontWeight: '700' },
  footer: { color: Palette.secondaryText, fontSize: 11, textAlign: 'center' },
});
