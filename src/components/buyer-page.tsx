import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground } from './gradient-background';
import { BottomNavigation } from './bottom-navigation';
import { useAuth } from '@/contexts/auth-context';
import { Palette } from '@/constants/colors';

type Tab = 'home' | 'favorites' | 'cart' | 'profile';
type Props = { active: Tab; children: ReactNode };

export function BuyerPage({ active, children }: Props) {
  const { role, ready } = useAuth();
  useEffect(() => {
    if (ready && role === 'admin') router.replace('/admin');
  }, [ready, role]);

  if (!ready || role === 'admin') return <GradientBackground style={styles.guard}>
    <SafeAreaView style={styles.guardContent}>
      <View><Text style={styles.guardTitle}>{role === 'admin' ? 'Membuka dashboard admin' : 'Memeriksa sesi'}</Text></View>
    </SafeAreaView>
  </GradientBackground>;

  return (
    <GradientBackground style={{ flex: 1 }}>
      <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
        {children}
        <BottomNavigation active={active} />
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  guard: { flex: 1 },
  guardContent: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  guardTitle: { color: Palette.primaryDark, fontSize: 14, fontWeight: '700' },
});
