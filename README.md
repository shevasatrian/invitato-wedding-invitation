# Undangan Pernikahan — Ricky & Fellycia

Website undangan pernikahan satu halaman: halaman sampul sebagai gerbang, isi undangan yang bergulir, form konfirmasi kehadiran dan ucapan yang tersimpan ke database sungguhan.

Dibuat sebagai **hometask assessment rekrutmen Invitato**, mengikuti template referensi [rickyfelly](https://invitato.net/template-rickyfelly/?code=D3EC9693640).

- **Demo:** <https://invitato-wedding-invitation-navy.vercel.app>
- **Repository:** <https://github.com/shevasatrian/invitato-wedding-invitation>

---

## Daftar isi

1. [Cara menjalankan di komputer sendiri](#1-cara-menjalankan-di-komputer-sendiri)
2. [Menyiapkan database](#2-menyiapkan-database)
3. [Fitur](#3-fitur)
4. [Arsitektur](#4-arsitektur)
5. [Alur data RSVP](#5-alur-data-rsvp)
6. [Keputusan teknis](#6-keputusan-teknis)
7. [Aksesibilitas & performa](#7-aksesibilitas--performa)
8. [Testing](#8-testing)
9. [Deploy](#9-deploy)
10. [Disclosure penggunaan AI](#10-disclosure-penggunaan-ai)
11. [Kredit](#11-kredit)

---

## 1. Cara menjalankan di komputer sendiri

**Prasyarat:** Node.js 20 atau lebih baru (dikembangkan dengan v24.18) dan satu database PostgreSQL. Paling praktis: project gratis di [Supabase](https://supabase.com).

```bash
git clone https://github.com/shevasatrian/invitato-wedding-invitation.git
cd invitato-wedding-invitation
npm install

cp .env.example .env      # lalu isi dua URL-nya, lihat bagian 2
npm run db:migrate        # membuat tabel Rsvp dan Wish

npm run dev               # buka http://localhost:3000
```

Dua hal diatur lewat query string, dan keduanya bisa digabung:

| URL | Hasil |
|---|---|
| `/?to=Budi%20Santoso` | menyapa "Budi Santoso" di halaman sampul dan pada Access Card |
| `/?lang=id` | seluruh undangan berbahasa Indonesia |
| `/?to=Budi%20Santoso&lang=id` | keduanya sekaligus |

Nilai `lang` selain `id` — termasuk yang kosong dan yang tidak dikenal — jatuh ke Bahasa Inggris, sehingga tidak ada cara membuat halaman gagal lewat parameter ini.

### Semua perintah

| Perintah | Kegunaan |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | `prisma generate` lalu `next build` |
| `npm run start` | Menjalankan hasil build |
| `npm run typecheck` | `tsc --noEmit` — harus 0 error |
| `npm run lint` | ESLint — harus 0 error |
| `npm run test` | 37 test Vitest |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:deploy` | `prisma migrate deploy` (untuk production) |
| `npm run db:studio` | Melihat isi tabel lewat browser |
| `npm run optimize-images` | `assets/*.png` → `public/images/*.webp` |

---

## 2. Menyiapkan database

`.env` butuh **dua** URL, dan perbedaannya bukan sekadar formalitas:

```env
DATABASE_URL="postgresql://...@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://...@aws-0-<region>.pooler.supabase.com:5432/postgres"
```

| | Port | Dipakai untuk |
|---|---|---|
| `DATABASE_URL` | **6543** — transaction pooler | aplikasi saat berjalan. Deployment serverless membuat banyak instance sekaligus; pooler menahan agar jumlah koneksi tidak meledak |
| `DIRECT_URL` | **5432** — session pooler | `prisma migrate` saja. Pooler transaksi tidak mendukung *prepared statement* yang dibutuhkan migrasi |

Keduanya diambil dari dashboard Supabase → tombol **Connect** → tab **ORMs** → **Prisma**, yang sudah menuliskan kedua baris itu siap salin.

> Di menu yang sama ada **Direct connection** (`db.<ref>.supabase.co:5432`). Pada project gratis alamat itu IPv6-only dan sering tidak bisa dijangkau dari jaringan rumah di Indonesia. Pakai yang host-nya `pooler.supabase.com` untuk keduanya.

`.env` diabaikan `.gitignore`; yang ikut ter-commit hanya `.env.example` berisi placeholder.

---

## 3. Fitur

Seluruh kebutuhan wajib PRD §1.5:

- [x] Halaman publik responsif (375 / 768 / 1440 px, tanpa overflow horizontal)
- [x] Cover / opening dengan personalisasi nama tamu via `?to=`
- [x] Informasi acara: tanggal, dua acara, alamat, tombol Google Calendar
- [x] Galeri foto dengan lightbox (navigasi panah + Escape)
- [x] Form RSVP: nama, hadir/tidak hadir, jumlah orang
- [x] Form ucapan + daftar ucapan yang masuk
- [x] Backend API dan database persisten
- [x] Validasi dan penanganan error di dua sisi
- [x] Musik latar dengan tombol nyala/mati
- [x] Hitung mundur ke hari-H
- [x] Peta lokasi (Google Maps embed, tanpa API key)
- [x] Animasi transisi antar section

Ditambahkan di luar kebutuhan wajib:

- [x] **Toggle bahasa Inggris / Indonesia.** Seluruh antarmuka tamu ikut berganti — narasi, judul section, menu, label form, pesan error validasi, teks alternatif foto, sampai judul pratinjau tautan WhatsApp.
- [x] **Access Card**, kartu bergaya tiket berisi nama tamu dan kode QR.

**Sengaja tidak dikerjakan**, karena PRD §1.6 menyatakannya tidak wajib dan waktunya 1–2 hari: admin dashboard, autentikasi, guest list, video Pre-Wedding & Live Streaming (asetnya memang tidak diberikan), dan Wedding Gift. Pertimbangannya sederhana — sepuluh fitur wajib yang selesai dan teruji lebih berharga daripada lima belas fitur yang setengah jadi.

Catatan jujur tentang Access Card: QR-nya **dekoratif**. Isinya tautan undangan ini lengkap dengan nama tamu, jadi kalau dipindai akan membuka halaman yang benar — tetapi tidak ada pemindaian kehadiran di lokasi, dan memang bukan itu yang diminta.

---

## 4. Arsitektur

Satu repo Next.js yang memuat frontend sekaligus backend. Route Handler di `app/api/` berjalan di Node di server, memegang koneksi Prisma, dan **tidak pernah ikut terbundel ke JavaScript yang diunduh tamu** — kredensial database tidak pernah sampai ke browser.

```
app/
  layout.tsx              4 font + metadata
  page.tsx                susunan section, await searchParams (?to=, ?lang=)
  globals.css             design token + prefers-reduced-motion
  api/rsvp/route.ts       POST simpan · GET ringkasan
  api/wishes/route.ts     POST simpan · GET 100 terbaru

components/
  InvitationShell.tsx     split-panel desktop (aside sticky + kolom 512px)
  Invitation.tsx          satu-satunya pemegang state halaman
  sections/               1 file = 1 section, namanya sama dengan judulnya
  ui/                     Reveal, Section, Divider, Button, Field, Lightbox,
                          NavDrawer, MusicToggle, CoupleNames, LanguageToggle

lib/
  config.ts               FAKTA acara: tanggal, alamat, foto, nama
  i18n.ts                 KALIMAT acara dalam dua bahasa
  schemas.ts              validasi Zod, dipakai browser DAN server
  utils.ts                countdown, waktu relatif, link Calendar & Maps
  prisma.ts               koneksi database (singleton)

prisma/schema.prisma      model Rsvp & Wish
tests/                    50 test
```

**Empat aturan yang dipegang konsisten:**

1. **Satu file = satu section**, namanya sama dengan judul yang tampil di layar. Pertanyaan "kode hitung mundur di mana?" dijawab tanpa perlu mencari: `components/sections/Countdown.tsx`.
2. **Tidak ada data acara yang di-hardcode di komponen.** Semua dari `lib/config.ts`. Mengganti pasangan, tanggal, dan alamat cukup mengubah satu file.
3. **Server Component secara default.** Hanya 8 file memakai `"use client"`. Section-section undangan tidak punya state sama sekali; mereka masuk ke `Invitation` lewat `children`, jadi tidak ikut terbundel ke browser.
4. **Keempat route handler berbentuk sama persis:** `try` → `safeParse` → query Prisma → `NextResponse`.
5. **Bahasa disimpan di URL, bukan di state.** `?lang=id` dibaca `page.tsx`, dipakai memilih satu kamus dari `lib/i18n.ts`, lalu diteruskan sebagai prop biasa.

### Kenapa bahasa ditaruh di URL

Mekanismenya sama persis dengan `?to=` yang sudah dipakai untuk nama tamu — tidak ada konsep baru yang perlu dipelajari. Akibat langsungnya:

- **Section tetap Server Component.** Kamus diteruskan lewat prop, jadi tidak ada satu byte pun tambahan JavaScript yang diunduh tamu. Diperiksa: kata `qrcode` dan `isDark` tidak muncul di satu berkas pun dalam `.next/static/chunks`.
- **Tombolnya cuma tautan.** `components/ui/LanguageToggle.tsx` tidak menyimpan apa pun. Bentuknya dua segmen berdampingan `EN | ID`: yang aktif sebuah `<span aria-current="true">`, yang tidak aktif sebuah `<Link>` menuju URL yang sama dengan `lang` dibalik — `?to=` selalu ikut dipertahankan. Segmen aktif sengaja bukan tautan, karena menautkannya ke halaman yang sedang dibuka hanya memberi tamu sesuatu untuk diklik yang tidak mengubah apa pun.
- **Pilihan bahasa ikut terbawa saat tautan dibagikan** dan bisa di-bookmark.
- **Tidak perlu Context.** Kalau bahasa disimpan sebagai state client, setiap section harus jadi Client Component untuk bisa membacanya.

Kelengkapan terjemahan dijamin TypeScript, bukan pemeriksaan manual. Kamus Inggris ditulis **tanpa** `as const` sehingga tipe nilainya `string`, lalu kamus Indonesia dianotasi `: Dict`. Satu kunci terlewat berarti `npm run typecheck` gagal.

Satu hal yang membatasi bentuk kamus: isinya diteruskan dari Server Component ke Client Component, jadi **harus serializable** — tidak boleh berisi fungsi. Teks yang memuat angka karena itu memakai penanda, misalnya `"{n} menit lalu"`, yang diganti di tempat pemakaiannya.

### Di mana state disimpan

| Tempat | State | Kenapa di situ |
|---|---|---|
| `Invitation.tsx` | `opened`, `playing`, `musicAvailable` | ketiganya lahir dari satu klik yang sama: "Open Invitation" |
| `Gallery.tsx` | foto mana yang dibuka | hanya galeri yang peduli |
| `NavDrawer.tsx` | menu terbuka atau tidak | hanya menu yang peduli |
| `Rsvp.tsx` / `Wishes.tsx` | isian form + status kirim | milik masing-masing form |

Semuanya `useState` biasa. **Tidak ada satu pun state yang perlu dibaca komponen yang berjauhan** — itulah alasan konkret project ini tidak memakai Context maupun state manager, bukan karena "belum sempat".

Bahasa sengaja **tidak** masuk daftar ini. Ia tinggal di URL, sehingga tetap tidak ada state yang dibaca lintas komponen meskipun fiturnya bertambah.

### Kontrak API

| Endpoint | Body / Query | Sukses | Error |
|---|---|---|---|
| `POST /api/rsvp` | `{guestName, attendance, guestCount}` | `201 {data}` | `400 {error, fieldErrors}` · `500` |
| `GET /api/rsvp` | — | `200 {attending, notAttending, totalPax}` | `500` |
| `POST /api/wishes` | `{name, message}` | `201 {data}` | `400` · `500` |
| `GET /api/wishes` | — | `200 {data[]}` 100 terbaru | `500` |

---

## 5. Alur data RSVP

```
Tamu menekan "Kirim Konfirmasi"
  └─> Rsvp.tsx: rsvpSchema.safeParse(isian)        ← validasi di BROWSER
        gagal  → tampilkan error di bawah field yang salah, TIDAK ada request
        lolos  → fetch("/api/rsvp", { method: "POST", body: JSON })
                   └─> app/api/rsvp/route.ts       ← ini SERVER (Node)
                         rsvpSchema.safeParse(body) ← validasi LAGI di server
                           gagal → 400 { error, fieldErrors }
                           lolos → prisma.rsvp.create(...)
                                     └─> PostgreSQL   ← data menetap di sini
                                   201 { data }
                 <── response
        └─> setState → React render ulang → panel terima kasih tampil,
            angka ringkasan diambil ulang dari server
```

**Kenapa divalidasi dua kali?** Yang di browser untuk kenyamanan — tamu langsung tahu kesalahannya tanpa menunggu jaringan. Yang di server untuk keamanan — siapa pun bisa melewati browser dan mengirim POST langsung dengan `curl`, jadi server tidak boleh percaya kiriman client.

Ini bukan teori. Kirimkan ini ke server:

```bash
curl -X POST http://localhost:3000/api/rsvp \
  -H "Content-Type: application/json" \
  -d '{"guestName":"Siti","attendance":"NOT_ATTENDING","guestCount":9}'
```

Form di halaman tidak mungkin menghasilkan kiriman seperti itu — kolom jumlah orang bahkan disembunyikan ketika tamu memilih "berhalangan". Server tetap menyimpannya sebagai **`guestCount: 0`**, karena keputusan itu diambil di server, bukan dipercayakan ke client. Perilaku ini dikunci oleh test di `tests/api-rsvp.test.ts`.

Aturan validasinya sendiri hanya ditulis **sekali**, di `lib/schemas.ts`, lalu diimpor kedua sisi — sehingga browser dan server mustahil punya definisi "valid" yang berbeda.

---

## 6. Keputusan teknis

### Stack

Next.js 16.3.4 · React 19.2.8 · TypeScript 5 (strict) · Tailwind CSS 4 · Zod 4 · Prisma 6.19 · Vitest 4 · sharp · qrcode-generator

**Next.js fullstack, bukan Vite + Express terpisah.** Satu repo, satu deploy, satu bahasa. Route Handler sudah memenuhi kebutuhan "backend API + database" pada PRD, dan waktu yang hemat dipakai untuk mengerjakan fitur.

### Prinsip yang mengalahkan semua pertimbangan lain

> Kode harus sederhana dan bisa dijelaskan oleh junior programmer dalam dua kalimat.

Konsekuensinya beberapa hal populer sengaja **tidak** dipakai:

| Ditolak | Alasan | Gantinya |
|---|---|---|
| React Hook Form + zodResolver | dua lapis abstraksi untuk dua form kecil | `useState` + `schema.safeParse()` |
| Framer Motion | library besar, banyak API, untuk satu efek | `<Reveal>` ±20 baris dengan `IntersectionObserver` |
| Optimistic update + rollback | logika rollback sulit dijelaskan dan mudah salah | kirim → tunggu response → ambil ulang |
| Cursor pagination | konsep cursor butuh penjelasan panjang | `findMany({ orderBy: desc, take: 100 })` |
| Context / state manager | tidak ada state yang perlu dibaca komponen berjauhan | state lokal di komponen pemakainya |
| Generator file `.ics` | kode parsing yang tidak menarik untuk dinilai | tautan Google Calendar |
| Library i18n (`next-intl`, `i18next`) | konfigurasi, middleware, dan konsep namespace untuk dua bahasa di satu halaman | objek biasa di `lib/i18n.ts` + prop |
| Rute terpisah `/en` dan `/id` | seluruh isi `app/` harus pindah ke segmen dinamis, dan URL yang sudah dibagikan perlu redirect | `?lang=id` pada rute yang sama |
| Cookie / `localStorage` untuk bahasa | bahasa sudah ada di URL; menyimpannya di dua tempat membuka peluang keduanya berselisih | URL sebagai satu-satunya sumber |
| Library QR siap pakai yang menghasilkan SVG | `qrcode` menyeret `yargs` — parser argumen CLI — hanya untuk menggambar kotak | `qrcode-generator` (nol dependensi), path SVG digambar sendiri |

### Prisma 6, bukan 7

Prisma 7 melarang `url` di `schema.prisma`: koneksi harus pindah ke `prisma.config.ts`, client harus dibungkus driver adapter (`@prisma/adapter-pg` + `pg`), dan hasil generate-nya diletakkan di folder yang harus diurus sendiri. Tiga konsep tambahan sebelum satu baris fitur pun ditulis, dan build gagal dengan `P1012`.

Prisma 6 memakai pola yang ada di semua tutorial: `url` di schema, `import { PrismaClient } from "@prisma/client"`, `new PrismaClient()`. Sesuai prinsip di atas, versi yang lebih mudah dijelaskan menang.

### Detail kecil yang berdampak nyata

- **Tanggal acara ditulis dengan offset eksplisit `+07:00`**, bukan waktu lokal server. Hitung mundur jadi menunjuk ke momen yang sama untuk tamu di zona waktu mana pun.
- **`play()` musik dipanggil langsung di dalam handler klik**, bukan di `useEffect`. Browser hanya mengizinkan audio berbunyi sebagai buah gestur pengguna asli; kalau ditunda ke effect, sebagian browser (Safari terutama) sudah tidak menganggapnya bagian dari klik tadi. Itu sebabnya elemen `<audio>` tinggal di `Invitation.tsx`.
- **`preload="none"` pada `<audio>`.** Berkasnya 4,4 MB — tujuh kali lipat seluruh foto undangan. Tanpa itu, tamu mengunduhnya begitu halaman dibuka padahal belum tentu melanjutkan.
- **Tombol musik tidak ditampilkan sama sekali kalau berkas audionya gagal dimuat.** `Invitation` menyimpan status `musicAvailable`, sehingga halaman tidak pernah menyuguhkan tombol yang tidak berfungsi.
- **Panel kiri desktop memakai foto lanskap, halaman sampul memakai foto potret.** Foto potret 836×1881 yang dipasang di panel lebar akan dipotong `object-cover` sampai kepala pengantin hilang. Rasio foto dicocokkan dengan bentuk wadahnya.
- **Pesan error dari server sengaja tetap satu bahasa.** Tamu tidak pernah melihatnya: browser memvalidasi lebih dulu dengan aturan yang sama dari berkas yang sama, jadi yang sampai ke server hanya kiriman yang melewati browser — misalnya `curl`. Menambah field `lang` ke body POST demi jalur yang tidak pernah dilalui tamu berarti memperumit kontrak API tanpa ada yang diuntungkan.
- **Yang berparameter pada schema hanya pesannya, bukan aturannya.** `rsvpSchema(pesan)` tetap menulis "minimal 2 karakter" satu kali. Kalau aturannya ikut bercabang per bahasa, klaim utama project — client dan server mustahil punya definisi "valid" yang berbeda — langsung batal.
- **QR digambar sebagai satu elemen `<path>`.** Library-nya hanya ditanya kotak mana yang gelap. Dua akibatnya: tidak perlu `dangerouslySetInnerHTML`, dan satu `path` jauh lebih ringan daripada 1089 elemen `<rect>` terpisah untuk QR berukuran 33×33.

---

## 7. Aksesibilitas & performa

### Asset

`npm run optimize-images` mengubah 11 PNG mentah (**18,56 MB**) menjadi WebP (**612 KB**) — turun **97%** tanpa artefak yang terlihat. Yang ikut ter-commit hanya hasil optimasinya; folder `assets/` mentah di-*gitignore*.

### Aksesibilitas

Diperiksa dengan mengukur DOM, bukan menilai dari tangkapan layar:

- **Kontras** — diukur ulang setelah section Access Card ditambahkan: **0 dari 37 elemen** gagal pada lima section berlatar warna solid, dengan Access Card sendiri berkisar 4,81–10,27. Aturan yang dipegang: teks sekunder berukuran kecil selalu `text-ink/80`, satu-satunya opasitas yang lolos di atas kedua warna latar project ini (5,75 di atas cream; 4,76 di atas mist).
- **Struktur heading** — satu `<h1>`, satu `<h2>` per section, `<h3>` untuk sub-bagian. Penting karena pengguna pembaca layar berpindah antar bagian lewat daftar heading, bukan dengan menggulir.
- **Penanda fokus** — 26 dari 26 kontrol punya penanda fokus yang terlihat, termasuk yang berlatar gelap (cincin putih).
- **Form** — setiap isian punya `<label for>`, `aria-invalid`, dan `aria-describedby` yang menunjuk ke pesan errornya, sehingga error ikut dibacakan pembaca layar.
- **Penanda bahasa** — atribut `lang` dipasang pada `<main>` mengikuti bahasa yang dipilih tamu, sehingga pembaca layar memakai aturan pengucapan yang benar untuk seluruh isi undangan. Sebelum ada toggle bahasa, halaman berbahasa Inggris memuat dua section berbahasa Indonesia yang harus ditandai satu per satu; tambalan itu kini tidak diperlukan lagi karena seluruh halaman konsisten satu bahasa.
- **Teks alternatif foto ikut berganti bahasa.** Sebelumnya `alt` galeri berbahasa Indonesia di dalam halaman `lang="en"` — cacat yang tidak pernah terlihat di layar dan hanya terdengar oleh pembaca layar.
- **`prefers-reduced-motion`** — seluruh transisi dimatikan bagi yang mengaktifkan pengaturan hemat gerak di sistemnya, sementara isinya tetap tampil utuh.
- **Nav drawer** memakai atribut `inert` saat tertutup, jadi isinya tidak bisa dijangkau Tab.

Sapuan terakhir memeriksa 29 frasa Inggris pada halaman Indonesia dan 27 frasa Indonesia pada halaman Inggris — termasuk isi `aria-label`, `placeholder`, dan `title`, bukan hanya teks yang terlihat. Hasilnya nol kebocoran di kedua arah.

### Responsif

Diukur pada enam kombinasi — 375 / 768 / 1440 px dikali dua bahasa — dengan menyuntikkan iframe seukuran perangkat, karena media query mengikuti viewport iframe-nya. Tidak ada overflow horizontal di satu pun kombinasi. Pengujian dua bahasa bukan formalitas: kalimat Bahasa Indonesia hampir selalu lebih panjang daripada padanan Inggrisnya, dan itulah cara tata letak pecah.

---

## 8. Testing

```bash
npm run test
```

**54 test, 4 berkas, ±1 detik, tidak satu pun menyentuh database.**

| Berkas | Isi |
|---|---|
| `tests/utils.test.ts` | hitung mundur, waktu relatif, link Calendar & Maps, format tanggal berlokal, pembangun URL isi QR, pembangun tautan ganti bahasa |
| `tests/schemas.test.ts` | seluruh aturan validasi RSVP & ucapan, termasuk aturan lintas-field dan pesan yang mengikuti kamus |
| `tests/i18n.test.ts` | pemilihan bahasa dari URL, kesepadanan kedua kamus, tidak ada nilai kosong |
| `tests/api-rsvp.test.ts` | route handler dengan Prisma yang ditiru `vi.mock` |

Tiga hal yang membuat test ini bukan sekadar formalitas:

1. **`now` dikirim sebagai parameter.** `getTimeLeft(target, now)` tidak pernah membaca jam komputer sendiri — kalau iya, hasil test-nya berbeda setiap kali dijalankan.
2. **Test schema bernilai ganda.** Schema yang sama dipakai browser dan server, jadi sekali lolos, kedua sisi ikut terjamin.
3. **`vi.mock` dipakai untuk memeriksa apa yang hendak disimpan server**, bukan sekadar menghindari database. Itulah yang mengunci perilaku "`NOT_ATTENDING` selalu tersimpan 0 orang" dan "kegagalan database dijawab 500 tanpa membocorkan pesan teknis ke tamu".
4. **Test kamus menutup celah yang tidak dijangkau TypeScript.** Compiler menjamin kedua bahasa punya kunci yang sama, tetapi tidak menjamin panjang array — teks alternatif galeri yang kurang satu tetap lolos `tsc`. Test-nya membandingkan bentuk kedua kamus termasuk panjang setiap array.

---

## 9. Deploy

**Vercel + Supabase.**

1. Import repository ke Vercel.
2. Isi environment variable `DATABASE_URL` dan `DIRECT_URL` dengan nilai yang sama seperti `.env` lokal.
3. Build command dibiarkan default (`npm run build`), yang sudah menjalankan `prisma generate` lebih dulu.
4. Terapkan migrasi ke database production: `npm run db:deploy`.

Folder `prisma/migrations/` ikut ter-commit — itulah yang dipakai `prisma migrate deploy` untuk membentuk tabel di database production.

Project Vercel tersambung ke repository ini, jadi setiap push ke `main` memicu deploy production baru. Berkas rahasia tidak pernah ikut terkirim: `.env` diabaikan `.gitignore` (untuk git) dan `.vercelignore` (untuk deploy lewat CLI).

**Cara memastikan deploy benar-benar hidup**, tanpa membuka browser — jalur baca dan jalur tulis sekaligus:

```bash
URL=https://invitato-wedding-invitation-navy.vercel.app

# jalur baca: server mengambil ringkasan dari Postgres
curl -s $URL/api/rsvp
# -> {"attending":0,"notAttending":0,"totalPax":0}

# jalur tulis: server memvalidasi ulang dan tidak percaya kiriman client
curl -s -X POST $URL/api/rsvp \
  -H "Content-Type: application/json" \
  -d '{"guestName":"Uji","attendance":"NOT_ATTENDING","guestCount":9}'
# -> 201, tetapi guestCount tersimpan 0 — bukan 9
```

---

## 10. Disclosure penggunaan AI

Project ini dikerjakan dengan bantuan **Claude Code (model Claude Opus)** sebagai *pair programmer*. Disampaikan terbuka sesuai permintaan PRD §1.9.

**Yang dikerjakan dengan bantuan AI:**

- Inspeksi template referensi Invitato secara langsung di browser — membaca `getComputedStyle` halaman aslinya untuk mendapatkan nilai warna dan font yang sebenarnya, bukan menebak dari tangkapan layar.
- Scaffolding project, konfigurasi Tailwind/Prisma/Vitest, dan skrip optimasi gambar.
- Implementasi seluruh komponen, route handler, dan test.
- Audit aksesibilitas terukur (kontras, struktur heading, penanda fokus) dan verifikasi responsif lewat pengukuran DOM.
- Penulisan komentar kode, README ini, dan catatan kerja internal.

**Yang tetap menjadi keputusan manusia:**

- Pemilihan stack dan penolakan library yang dianggap berlebihan untuk skala ini (tabel di bagian 6).
- Ruang lingkup: fitur mana yang dikerjakan dan mana yang sengaja tidak, beserta alasannya.
- Pemilihan musik latar dan pemetaan foto ke tiap section.
- Persetujuan setiap tahap sebelum lanjut ke tahap berikutnya.

**Yang diverifikasi, bukan diterima begitu saja.** Setiap tahap diuji dengan bukti yang bisa diulang — `curl` ke endpoint, pengukuran DOM, dan test yang sengaja dibuat gagal lebih dulu untuk memastikan test-nya memang bisa menangkap kesalahan. Beberapa saran awal AI juga dibatalkan setelah diuji: Prisma 7 diturunkan ke 6 setelah build gagal, dan pemetaan foto panel desktop diubah setelah terlihat terpotong di layar.

Penulis memahami dan sanggup menjelaskan setiap baris kode di repository ini.

---

## 11. Kredit

- **Musik:** "Romantic Piano Inspiring" oleh **PaulYudin**, dari [Pixabay](https://pixabay.com/music/wedding-romantic-piano-inspiring-155910/). Pixabay Content License — bebas dipakai komersial, atribusi tidak diwajibkan. Dicantumkan karena pantas, bukan karena diharuskan.
- **Foto:** asset pack yang disertakan dalam hometask Invitato.
- **Desain:** mengikuti template [Invitato — Ricky & Fellycia](https://invitato.net/template-rickyfelly/?code=D3EC9693640).
