# Wieldy New Next - Admin Dashboard Starter Kit

Selamat datang di **Wieldy New Next**, sebuah *boilerplate* dashboard admin modern berkinerja tinggi yang dibangun di atas **Next.js 15 (App Router)**. Proyek ini dirancang menggunakan arsitektur berlapis yang rapi, mematuhi prinsip *Clean Code*, *Single Responsibility Principle (SRP)*, dan dioptimalkan secara mendalam untuk performa rendering dan pengembangan yang cepat.

---

## 🚀 Teknologi Utama yang Digunakan

Proyek ini tidak hanya menggunakan Next.js standar, melainkan mengintegrasikan ekosistem teknologi premium berikut:

| Kategori | Teknologi | Deskripsi |
|---|---|---|
| **Core Framework** | **Next.js 15+ (App Router)** | Framework React modern dengan Server Components untuk loading instan, optimasi SEO, dan routing dinamis yang optimal. |
| **Styling & UI Library** | **Ant Design (Antd v5)** & **Tailwind CSS** | Kombinasi *utility-first* Tailwind untuk layout kustom dan Antd untuk komponen UI enterprise (tabel, popover, dropdown, tombol) yang dipadukan menggunakan sistem tema terpadu. |
| **Server State Management**| **TanStack Query (React Query v5)** | Manajemen data fetching dari server, caching otomatis, loading/error states, dan sinkronisasi data real-time di client. |
| **Centralized API Client** | **Native Fetch Wrapper** | Wrapper terpusat mirip dengan *apisauce* (`src/services/api.js`) yang menangani `BASE_URL`, penanganan error global, default headers, dan integrasi response standar (`ok`, `data`, `problem`). |
| **Internationalization (i18n)** | **State & Cookie-Based Translation** | Lokalisasi bahasa dinamis (Inggris, Arab, Prancis, Mandarin, dll.) dengan **Clean URLs** (tanpa `/en-US/` kotor di URL). Menggunakan Cookie `NEXT_LOCALE` dan sinkronisasi server-client yang sangat cepat. |
| **Font Optimization** | **Noir Pro Custom Font** | Menggunakan font premium Noir Pro yang dimuat secara asinkron melalui direktori `public/fonts/` dengan optimasi performa tinggi. |

---

## 📂 Arsitektur Folder Proyek (Clean Directory)

Proyek ini dirapikan agar mematuhi standar *clean architecture* Next.js, memusatkan semua logika di dalam `src/` dan menjaga root directory tetap bersih (hanya ada folder standar):

```bash
├── .vscode/               # Konfigurasi workspace VS Code (menyembunyikan warning CSS Tailwind)
├── public/                # File statis publik (gambar, logo, ikon)
│   └── fonts/             # Font Noir Pro premium yang diload secara statis
├── src/
│   ├── app/               # Routing utama Next.js (URL Bersih tanpa prefiks bahasa)
│   │   ├── (default)/     # Layout standar dashboard dengan header & sidebar
│   │   ├── auth/          # Halaman otentikasi login
│   │   ├── posts/         # Halaman demo integrasi API (mengonsumsi JSONPlaceholder)
│   │   ├── profile/       # Halaman profil user
│   │   ├── layout.jsx     # Root Layout dengan deteksi bahasa otomatis di sisi server
│   │   └── globals.css    # Global stylesheet dengan integrasi Tailwind, Antd, dan Font Noir Pro
│   ├── components/
│   │   ├── features/      # Komponen spesifik berdasarkan fitur/halaman (misal: posts, user-profile)
│   │   ├── layout/        # Komponen layout dashboard (Header, Sidebar, AppProvider)
│   │   └── wieldy/        # Core Wieldy engine, tema, dan container bawaan
│   ├── hooks/             # Custom Hooks terpisah berdasarkan tanggung jawab (SRP)
│   │   ├── queries/       # Hooks data fetching menggunakan TanStack Query (e.g. usePosts, useUserProfile)
│   │   └── navigation/    # Hooks konfigurasi navigasi dan daftar menu sidebar (e.g. useMenuItems)
│   ├── services/          # API Client terpusat (api.js) dan modul service (post.service, user.service)
│   ├── lib/               # Utility global dan inisialisasi QueryClient
│   └── config/            # Konfigurasi tema dan variabel lingkungan proyek
├── tailwind.config.js     # Konfigurasi Tailwind CSS
├── jsconfig.json          # Alias pathing (misal: @/*, @components/*, @hooks/*, @wieldy/*)
└── package.json           # Dependensi proyek
```

---

## 🛠️ Fitur & Implementasi Arsitektur Unggulan

### 1. Centralized API Client (api.js)
Terinspirasi dari pola clean code, pemanggilan API disentralisasi di [src/services/api.js](file:///d:/Template%20Project/wieldy-new-next/starter/src/services/api.js):
- Tidak ada pemanggilan berulang `getBaseUrl()` di tiap service.
- Menyediakan fungsi REST standar (`api.get`, `api.post`, `api.put`, `api.delete`).
- Menstandarisasikan response object (`ok`, `data`, `problem`, `status`) demi penanganan error yang konsisten di UI.

### 2. State & Cookie-Based i18n (Clean URLs)
Sistem multilanguage (i18n) dirombak agar tidak mengotori path URL (`/posts` bukan `/en-US/posts`):
- **Server Detection**: Server mendeteksi bahasa terpilih via cookie `NEXT_LOCALE` atau header browser `Accept-Language`, lalu memuat file kamus lokalisasi di sisi server.
- **Client Synchronization**: Menggunakan React Context (`AppProvider`) untuk menyebarkan terjemahan secara instan.
- **Instant Language Swap**: Ketika dropdown bendera bahasa diklik, fungsi `changeLanguage(code)` akan menyetel cookie baru dan memicu `router.refresh()`. Next.js melakukan re-fetch secara instan tanpa reload halaman penuh!

### 3. Separation of Hooks Responsibility
Custom hooks dipisah secara tegas berdasarkan tanggung jawabnya:
- Folder `@hooks/queries/` khusus menangani pemanggilan server state (TanStack Query).
- Folder `@hooks/navigation/` khusus menangani susunan dan render menu UI sidebar/header.
- Ekspor root `@hooks` disederhanakan hanya untuk internal provider, mencegah import campur aduk (*Clean Import Boundaries*).

---

## 💻 Cara Menjalankan Proyek

### Kebutuhan Sistem
- **Node.js**: Versi `18.17.0` atau yang lebih baru (sangat direkomendasikan Node 20+).

### 1. Instalasi Dependensi
Jalankan perintah berikut di root folder proyek Anda:
```bash
npm install
```

### 2. Menjalankan Server Development
Jalankan perintah berikut untuk memulai server lokal dengan fitur Fast Refresh:
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda untuk melihat hasilnya.

### 3. Kompilasi Produksi (Production Build)
Untuk membangun bundel produksi yang dioptimalkan dengan performa tertinggi:
```bash
npm run build
```
Setelah proses build selesai tanpa error, jalankan server produksi dengan:
```bash
npm run start
```

---

## 🛡️ Standar Penulisan Kode (Clean Code Guidelines)

Untuk menjaga kualitas proyek ini saat berkolaborasi:
1. **Gunakan Path Alias**: Selalu gunakan path alias `@components/...`, `@hooks/...`, `@services/...`, atau `@/...` untuk memudahkan pembacaan impor dan mencegah broken paths relative (`../../../../`).
2. **Pisahkan Data & Tampilan**: Jangan melakukan data fetching langsung di dalam komponen UI. Gunakan custom hook di bawah `src/hooks/queries/` dan panggil service di bawah `src/services/`.
3. **Pertahankan Clean Root**: Jangan menambahkan folder kustom baru di luar direktori `src/` atau `public/`.
