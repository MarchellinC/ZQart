cat > requirements.md <<'EOF'
# ZQART — Software Requirements

**Versi:** 1.3  
**Status:** Draft  
**Platform:** Android (Expo + React Native)  
**Jenis Aplikasi:** Single-Vendor E-Commerce

---

# 1. Gambaran Umum

## 1.1 Tujuan

ZQART merupakan aplikasi e-commerce berbasis mobile yang menyediakan katalog produk dari satu toko atau penjual. Aplikasi memungkinkan pengguna menjelajahi produk, mencari produk, melihat detail produk, menyimpan produk favorit, memasukkan produk ke keranjang, mengelola alamat pengiriman, dan melakukan simulasi checkout tanpa transaksi pembayaran nyata.

Dokumen ini menjadi acuan dalam proses analisis, perancangan, implementasi, dan pengujian aplikasi.

## 1.2 Ruang Lingkup

ZQART memiliki tiga jenis akses pengguna:

- **Guest:** Pengguna yang dapat menjelajahi katalog, mencari produk, memfilter kategori, dan melihat detail produk tanpa login.
- **Buyer:** Pengguna yang telah memiliki akun dan dapat menggunakan fitur favorit, keranjang, profil, alamat pengiriman, dan checkout simulasi.
- **Admin:** Pengelola tunggal toko yang bertanggung jawab mengelola produk, kategori, stok, dan alamat asal pengiriman toko.

ZQART menggunakan SQLite sebagai database lokal dan Firebase Firestore sebagai database cloud untuk mendukung penyimpanan serta sinkronisasi data.

## 1.3 Batasan Sistem

- Menggunakan konsep single-vendor, yaitu hanya terdapat satu toko.
- Hanya terdapat satu admin utama yang mengelola toko.
- Toko tidak memiliki cabang.
- Guest dapat menjelajahi katalog tanpa login.
- Pengguna wajib login untuk menggunakan fitur favorit dan keranjang.
- Pengguna wajib login sebelum melakukan checkout.
- Admin wajib melakukan autentikasi.
- Buyer dapat memiliki lebih dari satu alamat pengiriman.
- Toko hanya memiliki satu alamat asal pengiriman.
- Checkout hanya berupa simulasi dan ringkasan pembelian.
- Tidak terdapat payment gateway atau pembayaran nyata.
- Tidak terdapat pemrosesan pesanan dan pengiriman sungguhan.
- Tidak mendukung banyak penjual.

## 1.4 Jenis Pengguna

| Pengguna | Hak Akses |
|---|---|
| Guest | Melihat katalog, mencari produk, memfilter kategori, dan melihat detail produk. |
| Buyer | Seluruh fitur Guest, ditambah favorit, keranjang, profil, alamat, dan checkout simulasi. |
| Admin | Login admin, dashboard, CRUD produk, CRUD kategori, pengelolaan stok, dan pengelolaan alamat toko. |

---

# 2. Teknologi yang Digunakan

| Komponen | Teknologi | Kegunaan |
|---|---|---|
| Framework | Expo + React Native | Pengembangan aplikasi mobile |
| Bahasa | TypeScript | Implementasi aplikasi |
| Navigasi | Expo Router | Navigasi halaman |
| Database lokal | SQLite | Penyimpanan data lokal |
| Database cloud | Firebase Firestore | Penyimpanan dan sinkronisasi cloud |
| Autentikasi | Firebase Authentication | Login dan registrasi pengguna |
| Validasi | Zod | Validasi input |
| Penyimpanan aman | Expo SecureStore | Penyimpanan data sensitif jika diperlukan |

API publik eksternal yang akan digunakan masih perlu ditentukan berdasarkan fitur yang benar-benar diimplementasikan dan kebutuhan mata kuliah.

---

# 3. Kebutuhan Fungsional

## 3.1 Fitur Guest

| ID | Kebutuhan |
|---|---|
| FR-G01 | Guest dapat membuka halaman utama aplikasi. |
| FR-G02 | Guest dapat melihat seluruh produk yang tersedia. |
| FR-G03 | Guest dapat mencari produk berdasarkan nama atau kata kunci. |
| FR-G04 | Guest dapat memfilter produk berdasarkan kategori. |
| FR-G05 | Guest dapat melihat detail produk. |
| FR-G06 | Detail produk menampilkan nama, gambar, deskripsi, harga, kategori, dan stok. |
| FR-G07 | Guest dapat melihat informasi toko. |
| FR-G08 | Guest dapat membuka halaman login atau registrasi. |

## 3.2 Fitur Akun Buyer

| ID | Kebutuhan |
|---|---|
| FR-U01 | Pengguna dapat melakukan registrasi akun. |
| FR-U02 | Pengguna dapat melakukan login. |
| FR-U03 | Pengguna dapat melakukan logout. |
| FR-U04 | Buyer dapat melihat profil akun. |
| FR-U05 | Buyer dapat mengubah informasi profil. |
| FR-U06 | Pengguna yang melakukan registrasi secara mandiri mendapatkan role buyer. |

## 3.3 Fitur Favorit

| ID | Kebutuhan |
|---|---|
| FR-F01 | Pengguna wajib login untuk menggunakan fitur favorit. |
| FR-F02 | Buyer dapat menambahkan produk ke daftar favorit. |
| FR-F03 | Buyer dapat menghapus produk dari daftar favorit. |
| FR-F04 | Buyer dapat melihat seluruh produk favorit miliknya. |
| FR-F05 | Data favorit dikaitkan dengan akun buyer. |

## 3.4 Fitur Keranjang Belanja

| ID | Kebutuhan |
|---|---|
| FR-C01 | Pengguna wajib login untuk menambahkan produk ke keranjang. |
| FR-C02 | Buyer dapat menambahkan produk ke keranjang. |
| FR-C03 | Buyer dapat melihat seluruh produk dalam keranjang miliknya. |
| FR-C04 | Buyer dapat mengubah jumlah produk dalam keranjang. |
| FR-C05 | Buyer dapat menghapus produk dari keranjang. |
| FR-C06 | Sistem menghitung subtotal berdasarkan harga dan jumlah produk. |
| FR-C07 | Sistem menghitung total estimasi belanja. |
| FR-C08 | Sistem memvalidasi jumlah produk berdasarkan stok yang tersedia. |
| FR-C09 | Data keranjang dikaitkan dengan akun buyer. |
| FR-C10 | Data keranjang tetap tersedia ketika buyer logout dan login kembali. |

## 3.5 Fitur Alamat Pengiriman Buyer

| ID | Kebutuhan |
|---|---|
| FR-AD01 | Buyer dapat menambahkan alamat pengiriman. |
| FR-AD02 | Buyer dapat melihat daftar alamat miliknya. |
| FR-AD03 | Buyer dapat mengubah alamat pengiriman. |
| FR-AD04 | Buyer dapat menghapus alamat pengiriman. |
| FR-AD05 | Buyer dapat menentukan alamat utama. |
| FR-AD06 | Buyer dapat memilih alamat pengiriman ketika checkout. |
| FR-AD07 | Sistem hanya menampilkan alamat milik akun yang sedang login. |

## 3.6 Fitur Checkout

| ID | Kebutuhan |
|---|---|
| FR-CO01 | Buyer wajib login untuk membuka proses checkout. |
| FR-CO02 | Buyer harus memiliki alamat pengiriman untuk melanjutkan checkout. |
| FR-CO03 | Buyer dapat memilih alamat pengiriman. |
| FR-CO04 | Sistem menampilkan alamat asal toko sebagai informasi pengirim. |
| FR-CO05 | Sistem menampilkan ringkasan produk yang ada di keranjang. |
| FR-CO06 | Sistem menampilkan jumlah setiap produk. |
| FR-CO07 | Sistem menampilkan subtotal dan total estimasi belanja. |
| FR-CO08 | Sistem menampilkan keterangan bahwa checkout hanya simulasi. |
| FR-CO09 | Buyer dapat membatalkan proses checkout dan kembali ke keranjang. |
| FR-CO10 | Sistem tidak memproses pembayaran atau transaksi pembelian nyata. |

## 3.7 Fitur Admin

| ID | Kebutuhan |
|---|---|
| FR-A01 | Admin harus login sebelum mengakses halaman pengelolaan. |
| FR-A02 | Sistem menyediakan dashboard admin. |
| FR-A03 | Admin dapat menambahkan produk. |
| FR-A04 | Admin dapat melihat daftar produk. |
| FR-A05 | Admin dapat mengubah informasi produk. |
| FR-A06 | Admin dapat menghapus produk. |
| FR-A07 | Admin dapat menambahkan kategori. |
| FR-A08 | Admin dapat mengubah kategori. |
| FR-A09 | Admin dapat menghapus kategori. |
| FR-A10 | Admin dapat memperbarui stok produk. |
| FR-A11 | Admin dapat melihat status sinkronisasi data. |
| FR-A12 | Admin dapat logout. |

## 3.8 Fitur Alamat Toko

| ID | Kebutuhan |
|---|---|
| FR-SA01 | Admin dapat melihat alamat toko. |
| FR-SA02 | Admin dapat mengubah alamat asal pengiriman toko. |
| FR-SA03 | Admin dapat memperbarui nama penanggung jawab pengiriman. |
| FR-SA04 | Admin dapat memperbarui nomor telepon toko. |
| FR-SA05 | Sistem hanya menyimpan satu alamat toko aktif karena toko tidak memiliki cabang. |
| FR-SA06 | Alamat toko ditampilkan sebagai informasi asal pengiriman pada checkout simulasi. |

## 3.9 Database dan Sinkronisasi

| ID | Kebutuhan |
|---|---|
| FR-D01 | Sistem menyimpan data produk pada SQLite. |
| FR-D02 | Sistem menyimpan data produk pada Firebase Firestore. |
| FR-D03 | Sistem memuat data lokal terlebih dahulu ketika katalog dibuka. |
| FR-D04 | Sistem mengirim perubahan data lokal ke Firestore ketika internet tersedia. |
| FR-D05 | Sistem memperbarui data lokal berdasarkan data cloud yang diterima. |
| FR-D06 | Sistem mencatat status sinkronisasi data. |
| FR-D07 | Sistem menyediakan percobaan ulang ketika sinkronisasi gagal. |
| FR-D08 | Sistem menggunakan ID yang konsisten antara database lokal dan cloud. |
| FR-D09 | Sistem menyinkronkan data keranjang buyer berdasarkan akun pengguna. |
| FR-D10 | Sistem menyinkronkan data favorit buyer berdasarkan akun pengguna. |
| FR-D11 | Sistem menyimpan data alamat buyer berdasarkan akun pengguna. |
| FR-D12 | Sistem menyimpan satu alamat toko sebagai alamat asal pengiriman. |

Status sinkronisasi yang direncanakan:

- `pending`
- `synced`
- `failed`

---

# 4. Kebutuhan Nonfungsional

| ID | Kategori | Kebutuhan |
|---|---|---|
| NFR-01 | Usability | Antarmuka mudah digunakan dan dipahami. |
| NFR-02 | Responsiveness | Tampilan menyesuaikan ukuran layar perangkat. |
| NFR-03 | Performance | Daftar produk menggunakan FlatList. |
| NFR-04 | Performance | Pencarian menggunakan debounce. |
| NFR-05 | Performance | Gambar produk menggunakan mekanisme caching. |
| NFR-06 | Availability | Katalog tetap dapat diakses ketika offline selama data tersedia secara lokal. |
| NFR-07 | Security | Fitur admin hanya dapat diakses setelah autentikasi dan pemeriksaan role. |
| NFR-08 | Security | Firestore menggunakan Security Rules. |
| NFR-09 | Security | Input produk dan alamat divalidasi sebelum disimpan. |
| NFR-10 | Data Integrity | Sistem menjaga konsistensi data lokal dan cloud. |
| NFR-11 | Reliability | Perubahan lokal yang belum tersinkronisasi tidak boleh langsung hilang ketika koneksi terputus. |
| NFR-12 | Maintainability | Kode dipisahkan berdasarkan komponen dan tanggung jawabnya. |
| NFR-13 | Compatibility | Aplikasi mendukung perangkat Android yang kompatibel dengan versi Expo yang digunakan. |
| NFR-14 | Privacy | Data profil dan alamat hanya dapat diakses oleh pemilik akun serta pihak yang memiliki hak akses sesuai kebutuhan sistem. |

---

# 5. Rancangan Database

## 5.1 SQLite

### Tabel Products

| Atribut | Tipe Data | Keterangan |
|---|---|---|
| id | TEXT | Primary Key |
| name | TEXT | Nama produk |
| description | TEXT | Deskripsi produk |
| price | REAL | Harga produk |
| image_url | TEXT | URL gambar |
| category_id | TEXT | ID kategori |
| stock | INTEGER | Jumlah stok |
| updated_at | TEXT | Waktu perubahan |
| sync_status | TEXT | Status sinkronisasi |

### Tabel Categories

| Atribut | Tipe Data | Keterangan |
|---|---|---|
| id | TEXT | Primary Key |
| name | TEXT | Nama kategori |
| updated_at | TEXT | Waktu perubahan |
| sync_status | TEXT | Status sinkronisasi |

### Tabel Users

| Atribut | Tipe Data | Keterangan |
|---|---|---|
| id | TEXT | Primary Key, ID Firebase Authentication |
| name | TEXT | Nama pengguna |
| email | TEXT | Email pengguna |
| role | TEXT | Hak akses (`admin` atau `buyer`) |
| created_at | TEXT | Waktu registrasi |

### Tabel Favorites

| Atribut | Tipe Data | Keterangan |
|---|---|---|
| id | TEXT | Primary Key |
| user_id | TEXT | ID pengguna |
| product_id | TEXT | ID produk |
| created_at | TEXT | Waktu ditambahkan |

### Tabel CartItems

| Atribut | Tipe Data | Keterangan |
|---|---|---|
| id | TEXT | Primary Key |
| user_id | TEXT | ID pengguna |
| product_id | TEXT | ID produk |
| quantity | INTEGER | Jumlah produk |
| added_at | TEXT | Waktu ditambahkan |
| updated_at | TEXT | Waktu perubahan |

Data keranjang disimpan secara lokal pada SQLite dan disinkronkan ke Firestore berdasarkan akun buyer.

### Tabel Addresses

Tabel ini menyimpan alamat tujuan pengiriman milik buyer. Setiap buyer dapat memiliki lebih dari satu alamat.

| Atribut | Tipe Data | Keterangan |
|---|---|---|
| id | TEXT | Primary Key |
| user_id | TEXT | ID pemilik alamat |
| recipient_name | TEXT | Nama penerima |
| phone_number | TEXT | Nomor telepon penerima |
| province | TEXT | Provinsi |
| city | TEXT | Kabupaten/Kota |
| district | TEXT | Kecamatan |
| postal_code | TEXT | Kode pos |
| full_address | TEXT | Alamat lengkap |
| is_default | INTEGER | Status alamat utama |

### Tabel StoreAddress

Tabel ini menyimpan satu alamat tetap toko ZQART yang digunakan sebagai alamat asal pengiriman.

Karena ZQART menggunakan konsep single-vendor tanpa cabang, tabel ini hanya memiliki satu data alamat toko aktif.

| Atribut | Tipe Data | Keterangan |
|---|---|---|
| id | TEXT | Primary Key |
| recipient_name | TEXT | Nama pengirim atau penanggung jawab toko |
| phone_number | TEXT | Nomor telepon toko |
| province | TEXT | Provinsi asal pengiriman |
| city | TEXT | Kabupaten/Kota |
| district | TEXT | Kecamatan |
| postal_code | TEXT | Kode pos |
| full_address | TEXT | Alamat lengkap toko |
| updated_at | TEXT | Waktu terakhir diperbarui |

## 5.2 Firebase Firestore

Koleksi yang direncanakan:

- `products`
- `categories`
- `users`
- `favorites`
- `cartItems`
- `addresses`
- `storeAddress`

Firebase Authentication digunakan untuk autentikasi buyer dan admin.

Data profil pengguna disimpan pada koleksi `users`, sedangkan password tidak disimpan secara langsung di SQLite maupun Firestore.

Role pengguna terdiri dari:

- `admin`
- `buyer`

Pengguna yang melakukan registrasi secara mandiri otomatis mendapatkan role `buyer`. Role `admin` hanya dapat ditetapkan melalui proses administrasi yang aman.

Data favorit, keranjang, dan alamat harus dikaitkan dengan UID pengguna yang sesuai.

Koleksi `storeAddress` hanya menyimpan satu dokumen alamat toko yang dapat diperbarui oleh admin.

---

# 6. Struktur Navigasi

## 6.1 Area Guest

1. Home / Katalog
2. Pencarian Produk
3. Filter Kategori
4. Detail Produk
5. Informasi Toko
6. Login
7. Register

## 6.2 Area Buyer

1. Home / Katalog
2. Detail Produk
3. Favorit
4. Keranjang Belanja
5. Checkout
6. Profil Pengguna
7. Manajemen Alamat

## 6.3 Area Admin

1. Login Admin
2. Dashboard Admin
3. Daftar Produk
4. Tambah Produk
5. Edit Produk
6. Kelola Kategori
7. Alamat Toko
8. Status Sinkronisasi

---

# 7. Aturan Bisnis

1. ZQART hanya memiliki satu toko dan satu admin utama.
2. Toko tidak memiliki cabang.
3. Guest dapat menjelajahi katalog tanpa login.
4. Pengguna wajib login untuk menggunakan fitur favorit.
5. Pengguna wajib login untuk menambahkan produk ke keranjang.
6. Buyer hanya dapat mengakses favorit dan keranjang miliknya.
7. Buyer wajib login sebelum melanjutkan checkout.
8. Buyer harus memiliki alamat pengiriman sebelum menyelesaikan simulasi checkout.
9. Pengguna yang mendaftar sendiri mendapatkan role `buyer`.
10. Role `admin` hanya dapat ditetapkan oleh pihak yang berwenang.
11. Buyer dapat memiliki lebih dari satu alamat pengiriman.
12. Toko hanya memiliki satu alamat asal pengiriman.
13. Admin dapat mengubah alamat toko, tetapi tidak dapat menambahkan alamat cabang.
14. Alamat buyer digunakan sebagai alamat tujuan pengiriman.
15. Alamat toko digunakan sebagai alamat asal pengiriman.
16. Buyer dapat memasukkan produk ke keranjang.
17. Jumlah produk dalam keranjang tidak boleh melebihi stok yang tersedia.
18. Sistem menghitung subtotal berdasarkan harga dan jumlah produk.
19. Keranjang tetap tersimpan ketika buyer logout dan login kembali.
20. Data keranjang disinkronkan berdasarkan akun buyer.
21. Checkout hanya digunakan untuk menampilkan ringkasan belanja, alamat tujuan, dan alamat asal toko.
22. Tidak ada pembayaran atau transaksi pembelian nyata.
23. Data katalog lokal digunakan untuk mendukung akses offline.
24. Perubahan data yang belum tersinkronisasi harus tetap tersimpan secara lokal.

---

# 8. Strategi Pengujian

Pengujian menggunakan metode Black Box Testing.

| ID | Skenario | Hasil yang Diharapkan |
|---|---|---|
| TC-01 | Membuka halaman katalog | Produk berhasil ditampilkan |
| TC-02 | Mencari produk | Produk sesuai kata kunci ditampilkan |
| TC-03 | Memilih kategori | Produk berhasil difilter |
| TC-04 | Membuka detail produk | Detail produk ditampilkan |
| TC-05 | Membuka fitur favorit tanpa login | Sistem meminta pengguna login |
| TC-06 | Menambahkan produk ke favorit | Produk masuk daftar favorit |
| TC-07 | Registrasi buyer | Akun berhasil dibuat dengan role buyer |
| TC-08 | Login dengan data valid | Pengguna berhasil login |
| TC-09 | Login dengan data tidak valid | Sistem menolak akses |
| TC-10 | Buyer mencoba membuka dashboard admin | Akses ditolak |
| TC-11 | Admin menambahkan produk | Produk berhasil disimpan |
| TC-12 | Admin mengubah produk | Data produk diperbarui |
| TC-13 | Admin menghapus produk | Produk berhasil dihapus |
| TC-14 | Menambahkan alamat buyer | Alamat berhasil disimpan |
| TC-15 | Mengubah alamat buyer | Alamat berhasil diperbarui |
| TC-16 | Membuka keranjang tanpa login | Sistem meminta pengguna login |
| TC-17 | Menambahkan produk ke keranjang | Produk masuk keranjang |
| TC-18 | Mengubah jumlah produk | Jumlah produk diperbarui |
| TC-19 | Menghapus produk dari keranjang | Produk dihapus |
| TC-20 | Logout dan login kembali | Keranjang pengguna tetap tersedia |
| TC-21 | Checkout tanpa login | Sistem meminta pengguna login |
| TC-22 | Checkout tanpa alamat buyer | Sistem meminta pengguna menambahkan alamat |
| TC-23 | Membuka halaman checkout | Ringkasan belanja dan alamat ditampilkan |
| TC-24 | Menampilkan alamat asal toko | Alamat toko ZQART ditampilkan |
| TC-25 | Admin mengubah alamat toko | Alamat asal pengiriman diperbarui |
| TC-26 | Admin mencoba menambahkan alamat cabang | Sistem tidak menyediakan fitur tersebut |
| TC-27 | Menyelesaikan simulasi checkout | Tidak terjadi pembayaran atau transaksi nyata |
| TC-28 | Memasukkan jumlah melebihi stok | Sistem menolak jumlah yang tidak valid |
| TC-29 | Membuka katalog tanpa internet | Data lokal tetap ditampilkan |
| TC-30 | Melakukan sinkronisasi | Data lokal dan cloud diperbarui |

---

# 9. Optimasi dan Keamanan

## 9.1 Optimasi Performa

- Menggunakan FlatList untuk menampilkan daftar produk.
- Menggunakan caching gambar.
- Menggunakan debounce pada fitur pencarian.
- Mengutamakan pembacaan data dari SQLite.
- Menghindari permintaan data yang berulang.
- Menghindari proses render ulang komponen yang tidak diperlukan.

## 9.2 Keamanan

- Menggunakan Firebase Authentication untuk buyer dan admin.
- Menerapkan Firestore Security Rules.
- Memvalidasi input produk dan alamat sebelum disimpan.
- Tidak menyimpan password dalam database lokal.
- Memastikan buyer hanya dapat mengakses data miliknya.
- Membatasi akses administratif berdasarkan role.
- Tidak mengizinkan pengguna mengubah role menjadi admin melalui aplikasi.
- Menggunakan koneksi HTTPS untuk komunikasi jaringan.
- Membatasi perubahan alamat toko hanya untuk admin.

---

# 10. Hal yang Perlu Dikonfirmasi

1. Apakah gambar produk menggunakan URL atau Firebase Storage.
2. Bagaimana aturan penyelesaian konflik data lokal dan cloud.
3. Versi Android minimum yang akan didukung.
4. API publik eksternal yang akan digunakan untuk memenuhi kebutuhan integrasi API.
5. Apakah data keranjang dan favorit perlu tetap tersedia di perangkat ketika offline.
6. Persetujuan penggunaan Expo dan React Native sesuai ketentuan mata kuliah.

---

# 11. Kriteria Penyelesaian Proyek

Proyek dinyatakan memenuhi kebutuhan awal apabila:

- Aplikasi memiliki minimal tiga halaman dengan navigasi.
- Guest dapat melihat, mencari, dan memfilter produk.
- Guest dapat melihat detail produk.
- Buyer dapat melakukan registrasi dan login.
- Buyer dapat mengelola profil dan alamat pengiriman.
- Buyer dapat menggunakan fitur favorit setelah login.
- Buyer dapat menggunakan keranjang setelah login.
- Keranjang tetap tersedia setelah logout dan login kembali.
- Buyer dapat melakukan simulasi checkout setelah login.
- Checkout menampilkan alamat tujuan buyer dan alamat asal toko.
- Admin dapat login dan mengelola produk serta kategori.
- Admin dapat mengelola satu alamat asal pengiriman toko.
- Sistem membedakan hak akses admin dan buyer.
- SQLite digunakan sebagai database lokal.
- Firebase Firestore digunakan sebagai database cloud.
- API publik eksternal berhasil diintegrasikan.
- Katalog tetap dapat diakses secara offline setelah data tersimpan.
- Terdapat pengujian dan pencatatan bug.
- Terdapat minimal satu optimasi performa.
- Terdapat minimal satu penerapan keamanan.
- Dokumentasi dan demonstrasi proyek disiapkan.

EOF