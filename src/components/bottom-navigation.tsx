import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SymbolView, type AndroidSymbol, type SFSymbol } from 'expo-symbols';
import { Palette } from '@/constants/colors';

type Tab = 'home' | 'favorites' | 'cart' | 'profile';
type Item = { key: Tab; title: string; href: Href; ios: SFSymbol; native: AndroidSymbol };

const items: Item[] = [
  { key: 'home', title: 'Home', href: '/', ios: 'house.fill', native: 'home' },
  { key: 'favorites', title: 'Favorit', href: '/favorites' as Href, ios: 'heart', native: 'favorite_border' },
  { key: 'cart', title: 'Keranjang', href: '/cart' as Href, ios: 'basket', native: 'shopping_basket' },
  { key: 'profile', title: 'Profil', href: '/profile' as Href, ios: 'person.crop.circle', native: 'account_circle' },
];

export function BottomNavigation({ active }: { active: Tab }) {
  return (
    <View style={styles.bar}>
      {items.map((item) => {
        const selected = active === item.key;
        const color = selected ? Palette.activeIcon : Palette.inactiveIcon;
        return (
          <Pressable key={item.key} accessibilityRole="button" accessibilityState={{ selected }}
            onPress={() => { if (!selected) router.replace(item.href); }} style={styles.item}>
            <View style={[styles.iconWrap, selected && styles.selectedIcon]}>
              <SymbolView name={{ ios: item.ios, android: item.native, web: item.native }}
                size={19} tintColor={color} />
            </View>
            <Text style={[styles.label, { color }, selected && styles.selectedLabel]}>{item.title}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    minHeight: 66, flexDirection: 'row', backgroundColor: Palette.tabBar,
    borderTopWidth: 1, borderTopColor: Palette.border, paddingTop: 7,
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
  iconWrap: { width: 36, height: 29, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  selectedIcon: { backgroundColor: Palette.primarySoft },
  label: { fontSize: 10, fontWeight: '500' },
  selectedLabel: { fontWeight: '700' },
});
