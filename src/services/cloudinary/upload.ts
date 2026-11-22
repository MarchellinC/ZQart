import { Platform } from 'react-native';
import { File } from 'expo-file-system';
import { fetch as expoFetch } from 'expo/fetch';
import type { ImagePickerAsset } from 'expo-image-picker';

type CloudinaryUploadResponse = { secure_url?: string; error?: { message?: string } };

export async function uploadProductImage(asset: ImagePickerAsset): Promise<string> {
  const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();
  const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET?.trim();
  if (!cloudName || !uploadPreset) {
    throw new Error('Konfigurasi Cloudinary belum lengkap. Isi cloud name dan unsigned upload preset di .env.');
  }
  if (asset.fileSize && asset.fileSize > 8 * 1024 * 1024) {
    throw new Error('Ukuran foto maksimal 8 MB. Pilih gambar yang lebih kecil.');
  }

  const form = new FormData();
  let request: typeof fetch = fetch;
  if (Platform.OS === 'web') {
    const imageResponse = await fetch(asset.uri);
    if (!imageResponse.ok) throw new Error('File foto yang dipilih tidak dapat dibaca.');
    const blob = await imageResponse.blob();
    form.append('file', blob, asset.fileName ?? `zqart-${Date.now()}.jpg`);
  } else {
    const imageFile = new File(asset.uri);
    if (!imageFile.exists) throw new Error('File foto dari galeri tidak dapat dibaca. Pilih ulang foto tersebut.');
    form.append('file', imageFile);
    request = expoFetch;
  }
  form.append('upload_preset', uploadPreset);
  form.append('folder', 'zqart/products');

  const response = await request(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`, {
    method: 'POST', body: form,
  });
  const result = await response.json() as CloudinaryUploadResponse;
  if (!response.ok || !result.secure_url) {
    throw new Error(result.error?.message ?? `Cloudinary menolak upload (HTTP ${response.status}).`);
  }
  return result.secure_url;
}
