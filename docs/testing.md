# Pengujian Black Box dan Bug Log

Dokumen ini menjadi lembar eksekusi pengujian. Status **Belum dijalankan** berarti skenario belum diverifikasi di perangkat/runtime; typecheck bukan pengganti pengujian aplikasi.

## Matriks pengujian

| ID | Skenario | Hasil yang diharapkan | Status | Hasil aktual / bukti |
|---|---|---|---|---|
| TC-01 | Membuka katalog | Daftar produk tampil | Belum dijalankan | — |
| TC-02 | Mencari nama/kata kunci | Hasil sesuai pencarian setelah debounce | Belum dijalankan | — |
| TC-03 | Memilih kategori | Katalog terfilter | Belum dijalankan | — |
| TC-04 | Membuka detail produk | Nama, gambar, deskripsi, harga, kategori, stok tampil | Belum dijalankan | — |
| TC-05 | Guest membuka favorit | Diminta login | Belum dijalankan | — |
| TC-06 | Buyer menambah/menghapus favorit | Perubahan tampil di daftar favorit | Belum dijalankan | — |
| TC-07 | Registrasi mandiri | Akun dibuat dengan role buyer | Belum dijalankan | — |
| TC-08 | Login valid | Buyer/admin dikenali sesuai UID | Belum dijalankan | — |
| TC-09 | Login tidak valid | Akses ditolak dengan pesan kesalahan | Belum dijalankan | — |
| TC-10 | Buyer membuka admin | Akses admin ditolak | Belum dijalankan | — |
| TC-11 | Admin menambah produk | Produk tersimpan di SQLite dan antrean sinkronisasi | Belum dijalankan | — |
| TC-12 | Admin mengubah produk | Perubahan tersimpan | Belum dijalankan | — |
| TC-13 | Admin menghapus produk | Produk terhapus dan tombstone tersinkron | Belum dijalankan | — |
| TC-14 | Buyer menambah alamat | Alamat tersimpan untuk UID buyer | Belum dijalankan | — |
| TC-15 | Buyer mengubah alamat | Alamat diperbarui | Belum dijalankan | — |
| TC-16 | Guest membuka keranjang | Diminta login | Belum dijalankan | — |
| TC-17 | Buyer menambah produk ke keranjang | Item masuk keranjang | Belum dijalankan | — |
| TC-18 | Buyer mengubah kuantitas | Kuantitas diperbarui dan tidak melebihi stok | Belum dijalankan | — |
| TC-19 | Buyer menghapus item keranjang | Item terhapus | Belum dijalankan | — |
| TC-20 | Logout lalu login kembali | Keranjang UID yang sama dipulihkan | Belum dijalankan | — |
| TC-21 | Guest membuka checkout | Diminta login | Belum dijalankan | — |
| TC-22 | Buyer checkout tanpa alamat | Diminta menambah alamat | Belum dijalankan | — |
| TC-23 | Buyer membuka checkout | Alamat, item, subtotal dan total tampil | Belum dijalankan | — |
| TC-24 | Checkout menampilkan alamat toko | Alamat asal tampil | Belum dijalankan | — |
| TC-25 | Admin mengubah alamat toko | Satu alamat asal aktif diperbarui | Belum dijalankan | — |
| TC-26 | Admin mencoba menambah cabang | Tidak ada alur cabang; hanya satu dokumen `store` | Belum dijalankan | — |
| TC-27 | Buyer menyelesaikan simulasi checkout | Ringkasan simulasi; tidak ada transaksi/pembayaran | Belum dijalankan | — |
| TC-28 | Kuantitas melebihi stok | Perubahan ditolak | Belum dijalankan | — |
| TC-29 | Membuka katalog offline setelah cache tersedia | Produk SQLite tetap tampil | Belum dijalankan | — |
| TC-30 | Sinkronisasi saat online | Antrean dicoba ulang dan status diperbarui | Belum dijalankan | — |
| TC-31 | Admin mengunggah foto Cloudinary | URL aman tersimpan di data produk | Belum dijalankan | — |
| TC-32 | Guest membuka informasi toko | Informasi toko dan batas simulasi tampil | Belum dijalankan | — |
| TC-33 | Buyer mengubah nama profil | Firebase Auth dan profil lokal diperbarui | Belum dijalankan | — |
| TC-34 | Guest atau admin membuka favorit/keranjang | Akses data buyer dibatasi dan diminta masuk sebagai buyer | Belum dijalankan | — |

## Bug log

| ID | Temuan | Tindakan | Status |
|---|---|---|---|
| BUG-01 | Pemeriksaan TypeScript menemukan tipe `ListEmptyComponent` yang tidak menerima `null` pada versi React Native proyek ini. | Mengubah cabang kosong menjadi `undefined`. | Diperbaiki; `npx tsc --noEmit` lulus. |
| BUG-02 | Tipe `StyleSheet` versi React Native yang terpasang tidak menyediakan `absoluteFillObject`. | Menggunakan posisi absolut eksplisit pada style gambar. | Diperbaiki; `npx tsc --noEmit` lulus. |
| BUG-03 | `npx expo lint` awalnya tidak dapat menyiapkan ESLint karena konfigurasi belum ada dan akses registry gagal (`EACCES`). | ESLint dan `eslint-config-expo` SDK 58 dipasang, konfigurasi Flat dibuat, dan temuan lint diperbaiki. | Ditutup; `npx expo lint` lulus. |

## Catatan eksekusi

- Catat perangkat/OS, versi aplikasi, tanggal, hasil aktual dan bukti untuk setiap kasus saat dijalankan.
- Sinkronisasi Firestore memerlukan project Firebase dengan Authentication, Firestore dan rules ter-deploy.
- Upload foto memerlukan Cloudinary cloud name serta unsigned preset yang sesuai.
- Katalog offline harus diuji setelah setidaknya satu kali fetch berhasil dan data tersimpan di SQLite.
