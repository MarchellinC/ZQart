import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/components/app-header';
import { BuyerPage } from '@/components/buyer-page';
import { Palette } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/theme';
import { initializeDatabase, storeAddressRepository } from '@/database';
import type { StoreAddressRecord } from '@/database/repositories/store-address';

export default function InfoScreen() {
  const [address, setAddress] = useState<StoreAddressRecord | null>(null);
  useEffect(() => {
    void initializeDatabase().then(storeAddressRepository.get).then(setAddress)
      .catch((error) => Alert.alert('Informasi toko gagal dimuat', String(error)));
  }, []);
  return <BuyerPage active="home">
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <AppHeader greeting="Cerita kami" title="Tentang ZQART" />
      <View style={styles.card}>
        <Text style={styles.heading}>Karya lokal, penuh cerita</Text>
        <Text style={styles.body}>ZQART adalah etalase digital untuk karya pilihan dari satu toko. Temukan produk, simpan favorit, dan atur keranjang dengan nyaman.</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.heading}>Informasi toko</Text>
        {address ? <Text style={styles.body}>{address.recipient_name} · {address.phone_number}{'\n'}{address.full_address}, {address.district}, {address.city}, {address.province} {address.postal_code}</Text>
          : <Text style={styles.body}>Alamat toko belum tersedia. Informasi ini akan muncul setelah admin mengaturnya.</Text>}
      </View>
      <Text style={styles.notice}>Checkout membuat pesanan dan memperbarui stok. Pembayaran diproses di luar aplikasi.</Text>
    </ScrollView>
  </BuyerPage>;
}

const styles = StyleSheet.create({
  content: { padding: Spacing.three, gap: Spacing.three, paddingBottom: Spacing.four },
  card: { padding: Spacing.three, gap: Spacing.two, borderRadius: Radius.medium, backgroundColor: Palette.white },
  heading: { color: Palette.text, fontSize: 16, fontWeight: '800' },
  body: { color: Palette.secondaryText, fontSize: 13, lineHeight: 20 },
  notice: { color: Palette.secondaryText, fontSize: 11, lineHeight: 17, textAlign: 'center' },
});
