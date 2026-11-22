import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Palette } from '@/constants/colors';
import { Radius, Spacing } from '@/constants/theme';

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({ visible, title, message, confirmLabel = 'Ya, lanjutkan', onCancel, onConfirm }: Props) {
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
    <View style={styles.overlay}>
      <Pressable accessibilityLabel="Tutup konfirmasi" style={StyleSheet.absoluteFill} onPress={onCancel} />
      <View style={styles.card}>
        <View style={styles.accent} />
        <View style={styles.icon}><Text style={styles.iconText}>!</Text></View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
        <View style={styles.actions}>
          <Pressable accessibilityRole="button" onPress={onCancel} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Batal</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={onConfirm} style={styles.confirmButton}>
            <Text style={styles.confirmText}>{confirmLabel}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({
  overlay: { flex: 1, padding: Spacing.four, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(35, 20, 48, 0.55)' },
  card: { width: '100%', maxWidth: 380, padding: Spacing.three, paddingTop: Spacing.four, gap: Spacing.two,
    borderRadius: Radius.large, backgroundColor: '#FBF7FF', alignItems: 'center', overflow: 'hidden',
    borderWidth: 1, borderColor: '#E5D5F5' },
  accent: { position: 'absolute', top: 0, left: 0, right: 0, height: 7, backgroundColor: Palette.primaryDark },
  icon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FBE8EC', alignItems: 'center', justifyContent: 'center' },
  iconText: { color: Palette.error, fontSize: 27, lineHeight: 31, fontWeight: '900' },
  title: { color: Palette.text, fontSize: 18, fontWeight: '900', textAlign: 'center' },
  message: { color: Palette.secondaryText, fontSize: 13, lineHeight: 19, textAlign: 'center' },
  actions: { width: '100%', flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.one },
  cancelButton: { flex: 1, minHeight: 44, borderRadius: Radius.pill, backgroundColor: '#EEE6F6', alignItems: 'center', justifyContent: 'center' },
  cancelText: { color: Palette.primaryDark, fontSize: 13, fontWeight: '800' },
  confirmButton: { flex: 1, minHeight: 44, borderRadius: Radius.pill, backgroundColor: Palette.error, alignItems: 'center', justifyContent: 'center' },
  confirmText: { color: Palette.white, fontSize: 13, fontWeight: '800' },
});
