import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, type Href } from 'expo-router';
import { Image } from 'expo-image';
import { SymbolView, type AndroidSymbol, type SFSymbol } from 'expo-symbols';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Palette } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/theme';
import { logOut } from '@/services/firebase/auth';

type AdminSection = 'products' | 'categories' | 'store' | 'sync';
type AdminRoute = { id: AdminSection; label: string; href: Href; ios: SFSymbol; native: AndroidSymbol };
const routes: AdminRoute[] = [
  { id: 'products', label: 'Produk', href: '/admin' as Href, ios: 'shippingbox.fill', native: 'inventory_2' },
  { id: 'categories', label: 'Kategori', href: '/categories' as Href, ios: 'square.grid.2x2.fill', native: 'category' },
  { id: 'store', label: 'Alamat toko', href: '/store-address' as Href, ios: 'mappin.and.ellipse', native: 'store' },
  { id: 'sync', label: 'Sinkronisasi', href: '/sync-status' as Href, ios: 'arrow.triangle.2.circlepath', native: 'sync' },
];

export function AdminLayout(props: {
  title: string; subtitle: string; active: AdminSection; children: ReactNode;
}) {
  return <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
    <View style={styles.topbar}>
      <View style={styles.brand}>
        <Image source={require('@/assets/images/zqart-logo.png')} style={styles.logo} contentFit="contain" />
        <View><Text style={styles.brandName}>ZQART</Text><Text style={styles.brandTag}>ADMIN STUDIO</Text></View>
      </View>
      <Pressable accessibilityRole="button" onPress={() => { void logOut(); router.replace('/'); }} style={styles.logout}>
        <Text style={styles.logoutText}>Keluar</Text>
      </Pressable>
    </View>
    <View style={styles.heading}>
      <Text style={styles.title}>{props.title}</Text>
      <Text style={styles.subtitle}>{props.subtitle}</Text>
    </View>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      {props.children}
    </ScrollView>
    <View style={styles.bottomBar}>
      {routes.map((item) => {
        const selected = item.id === props.active;
        const color = selected ? Palette.activeIcon : Palette.inactiveIcon;
        return <Pressable key={item.id} accessibilityRole="button" accessibilityState={{ selected }}
          onPress={() => { if (!selected) router.replace(item.href); }} style={styles.tab}>
          <View style={[styles.iconWrap, selected && styles.selectedIcon]}>
            <SymbolView name={{ ios: item.ios, android: item.native, web: item.native }} size={19} tintColor={color} />
          </View>
          <Text style={[styles.tabLabel, { color }, selected && styles.selectedLabel]}>{item.label}</Text>
        </Pressable>;
      })}
    </View>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Palette.gradientStart },
  topbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.three, paddingVertical: Spacing.two },
  brand: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  logo: { width: 40, height: 34 },
  brandName: { color: Palette.primaryDark, fontSize: 14, fontWeight: '900', letterSpacing: 1.8 },
  brandTag: { color: Palette.secondaryText, fontSize: 9, fontWeight: '800', letterSpacing: 1.3 },
  logout: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: Radius.pill, backgroundColor: Palette.white, borderWidth: 1, borderColor: Palette.border },
  logoutText: { color: Palette.primaryDark, fontSize: 12, fontWeight: '700' },
  heading: { paddingHorizontal: Spacing.three, paddingTop: Spacing.two, paddingBottom: Spacing.three, gap: 5 },
  title: { color: Palette.text, fontSize: 25, fontWeight: '900', letterSpacing: -0.4 },
  subtitle: { color: Palette.secondaryText, fontSize: 12, lineHeight: 18 },
  content: { flexGrow: 1, padding: Spacing.three, paddingTop: Spacing.two, paddingBottom: Spacing.five, gap: Spacing.two },
  bottomBar: { minHeight: 66, flexDirection: 'row', backgroundColor: Palette.tabBar, borderTopWidth: 1, borderTopColor: Palette.border, paddingTop: 7 },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
  iconWrap: { width: 36, height: 29, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  selectedIcon: { backgroundColor: Palette.primarySoft },
  tabLabel: { fontSize: 10, fontWeight: '500' },
  selectedLabel: { fontWeight: '700' },
});
