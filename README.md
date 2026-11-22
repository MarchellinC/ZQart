# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **src/app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **example** directory and create a blank **src/app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Menetapkan akun admin

Role admin tidak didapat dari alamat email atau nama akun. Setelah akun masuk sekali, ambil UID akun tersebut dari **Firebase Console → Authentication → Users**. Di **Firestore Database → `users`**, buka/buat dokumen dengan ID yang sama dengan UID, lalu isi sekurangnya:

```text
id: <UID akun>
name: <nama admin>
email: <email akun>
role: admin
created_at: <waktu ISO, misalnya 2026-11-20T00:00:00.000Z>
updated_at: <waktu ISO>
```

Deploy ulang `firestore.rules` setelah perubahan rules. Tutup sesi aplikasi lalu masuk kembali agar role dimuat dari Firestore. Pengguna tidak dapat mengubah role sendiri melalui aplikasi; role hanya boleh ditetapkan lewat Firebase Console atau akun admin yang telah berwenang. Jika `users/{uid}` berisi `role: buyer`, UI akan tetap menampilkan Buyer.

## Upload foto produk

Salin `.env.example` menjadi `.env`, lalu isi `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME` dengan cloud name dari Cloudinary Dashboard dan `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET` dengan nama **unsigned upload preset**. Buat preset tersebut di **Settings → Upload → Upload presets** dan atur folder `zqart/products` bila diinginkan. Jangan masukkan API secret ke aplikasi. Setelah mengubah `.env`, mulai ulang Expo dengan membersihkan cache (`npx expo start -c`). Pada form admin, pilih foto dari perangkat; foto diunggah saat produk disimpan. URL gambar juga dapat ditempel manual sebagai alternatif.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
