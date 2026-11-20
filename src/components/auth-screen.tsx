import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { CustomInput } from '@/components/custom-input';
import { PrimaryButton } from '@/components/primary-button';
import { Palette } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/theme';
import { getAuthErrorMessage, register, signIn } from '@/services/firebase/auth';
import { useAuth } from '@/contexts/auth-context';

type Props = { mode: 'login' | 'register' };

export function AuthScreen({ mode }: Props) {
  const isRegister = mode === 'register';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirectAfterLogin, setRedirectAfterLogin] = useState(false);
  const { user, role, ready } = useAuth();

  useEffect(() => {
    if (!redirectAfterLogin || !ready || !user) return;
    router.replace(role === 'admin' ? '/admin' : '/');
  }, [ready, redirectAfterLogin, role, user]);
  async function submit() {
    setError('');
    if (!email.trim() || !password || (isRegister && !name.trim())) {
      setError('Lengkapi semua kolom terlebih dahulu.');
      return;
    }
    if (password.length < 6) {
      setError('Kata sandi minimal 6 karakter.');
      return;
    }
    setLoading(true);
    try {
      if (isRegister) await register(email, password, name);
      else await signIn(email, password);
      setRedirectAfterLogin(true);
    } catch (cause) {
      setError(getAuthErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  }
  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.brand}>ZQART</Text>
        <Text style={styles.title}>{isRegister ? 'Buat akun' : 'Selamat datang kembali'}</Text>
        <Text style={styles.subtitle}>{isRegister ? 'Daftar untuk menyimpan favorit dan keranjangmu.' : 'Masuk untuk melanjutkan belanja.'}</Text>
        <View style={styles.form}>
          {isRegister ? <CustomInput label="Nama" value={name} onChangeText={setName} autoCapitalize="words" placeholder="Nama lengkap" /> : null}
          <CustomInput label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="nama@email.com" />
          <CustomInput label="Kata sandi" value={password} onChangeText={setPassword} secureTextEntry placeholder="Minimal 6 karakter" />
          {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
          <PrimaryButton title={isRegister ? 'Daftar' : 'Masuk'} loading={loading} onPress={submit} />
        </View>
        <Text style={styles.switch} onPress={() => router.replace(isRegister ? '/login' : '/register')}>
          {isRegister ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar'}
        </Text>
        <Text style={styles.guest} onPress={() => router.replace('/')}>Lanjut sebagai tamu</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Palette.gradientStart },
  content: { flexGrow: 1, justifyContent: 'center', padding: Spacing.four, gap: Spacing.two },
  brand: { color: Palette.primaryDark, fontSize: 15, fontWeight: '900', letterSpacing: 3 },
  title: { color: Palette.text, fontSize: 28, fontWeight: '800', marginTop: Spacing.three },
  subtitle: { color: Palette.secondaryText, fontSize: 14, lineHeight: 21 },
  form: { gap: Spacing.three, marginTop: Spacing.four, padding: Spacing.three, borderRadius: Radius.large, backgroundColor: Palette.white },
  error: { color: '#B42318', fontSize: 13 },
  switch: { textAlign: 'center', color: Palette.primaryDark, fontWeight: '700', marginTop: Spacing.three, padding: Spacing.two },
  guest: { textAlign: 'center', color: Palette.secondaryText, padding: Spacing.two },
});
