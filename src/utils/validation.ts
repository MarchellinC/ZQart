import { z } from 'zod';

const requiredText = (label: string) => z.string().trim().min(1, `${label} wajib diisi.`);

export const productFormSchema = z.object({
  name: requiredText('Nama produk'),
  description: requiredText('Deskripsi'),
  category: requiredText('Kategori'),
  price: z.string().trim().regex(/^\d+(?:[.,]\d{1,2})?$/, 'Harga harus berupa angka yang valid.'),
  stock: z.string().trim().regex(/^\d+$/, 'Stok harus berupa bilangan bulat.'),
  imageUrl: z.string().trim().refine(
    (value) => !value || /^https?:\/\/\S+$/i.test(value),
    'URL gambar harus menggunakan HTTP atau HTTPS.',
  ),
}).refine((value) => Number(value.price.replace(',', '.')) >= 0, {
  path: ['price'], message: 'Harga tidak boleh negatif.',
}).refine((value) => Number(value.stock) >= 0, {
  path: ['stock'], message: 'Stok tidak boleh negatif.',
});

export const categoryFormSchema = z.object({ name: requiredText('Nama kategori') });
export const profileNameSchema = z.object({ name: requiredText('Nama profil').max(80, 'Nama maksimal 80 karakter.') });

export const addressFieldsSchema = z.object({
  recipient_name: requiredText('Nama penerima'),
  phone_number: requiredText('Nomor telepon'),
  province: requiredText('Provinsi'),
  city: requiredText('Kota/Kabupaten'),
  district: requiredText('Kecamatan'),
  postal_code: requiredText('Kode pos'),
  full_address: requiredText('Alamat lengkap'),
});
