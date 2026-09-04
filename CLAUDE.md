# CLAUDE.md

Catatan kerja untuk project ini. Dibaca setiap sesi baru.

---

## 1. Konteks

Website undangan pernikahan untuk **hometask assessment rekrutmen Invitato**.
Sumber requirement: `Website_Invitation_Hometask.docx` (di disk, sengaja tidak di-commit).

- **Deadline:** 1–2 hari sejak brief diterima
- **Yang dinilai:** product slice end-to-end, kualitas frontend/UI-UX, integrasi backend, *engineering judgment*
- **Template referensi:** https://invitato.net/template-rickyfelly/?code=D3EC9693640
- **Akan ada interview teknis** — user harus bisa menjelaskan setiap baris kode

### Aturan paling penting

> **Kode harus sederhana dan bisa dijelaskan oleh junior programmer dalam 2 kalimat.**
> Ini mengalahkan semua pertimbangan lain. Kalau sebuah solusi "lebih canggih" tapi
> butuh penjelasan panjang, jangan dipakai.

---

## 2. Stack

Next.js 16.3.4 · React 19.2.8 · TypeScript 5 (strict) · Tailwind 4 · Zod 4 · **Prisma 6.19** · Vitest 4 · sharp
Deploy: **Vercel + Supabase Postgres**

### Yang SENGAJA tidak dipakai (jangan tambahkan tanpa diskusi)

| Ditolak | Alasan | Gantinya |
|---|---|---|
| React Hook Form + zodResolver | 2 lapis abstraksi untuk 2 form kecil | `useState` + `schema.safeParse()` |
| Framer Motion | library besar, banyak API | `<Reveal>` ±20 baris pakai `IntersectionObserver` |
| Optimistic update + rollback | logika rollback sulit dijelaskan | submit → tunggu response → refetch |
| Cursor pagination | konsep cursor butuh penjelasan panjang | `findMany({ orderBy: desc, take: 100 })` |
| Context / state manager | tidak dibutuhkan di skala ini | state lokal di komponen pemakainya |
| Generator file `.ics` | kode parsing yang tidak menarik | link Google Calendar |
| **Prisma 7** | wajib `prisma.config.ts` + driver adapter + path client hasil generate — 3 konsep tambahan | **Prisma 6**: `url` di schema, `new PrismaClient()`, import dari `@prisma/client` |

---

## 3. Perintah

```bash
npm run dev              # dev server
npm run build            # prisma generate && next build
npm run typecheck        # tsc --noEmit          <- harus 0 error
npm run lint             # eslint                <- harus 0 error
npm run test             # vitest run
npm run optimize-images  # assets/*.png -> public/images/*.webp
npm run db:migrate       # prisma migrate dev
npm run db:studio        # lihat isi tabel
```

---

## 4. Konvensi struktur

Tanda ✅ = sudah ada. ⬜ = belum dibuat.

```
app/
  layout.tsx              ✅ 4 font + metadata + data-scroll-behavior
  page.tsx                ✅ susunan section, await searchParams (?to=)
  globals.css             ✅ design token + Tailwind + .scroll-locked
  api/rsvp/route.ts       ✅ POST create · GET ringkasan
  api/wishes/route.ts     ✅ POST create · GET list

components/
  InvitationShell.tsx     ✅ split-panel desktop (aside sticky + kolom 512px)
  Invitation.tsx          ✅ "use client" — SATU-SATUNYA state halaman
  sections/
    Cover.tsx             ✅ gerbang, sapaan ?to=, tombol Open Invitation
    Welcoming.tsx         ✅ sambutan + foto berbingkai + tekstur sutra
    CoupleProfile.tsx     ✅ 2 kartu mempelai (PersonCard dipakai 2x)
    Countdown.tsx         ✅ "use client" — timer + Save the Date
    EventDetails.tsx      ✅ tanggal + 2 acara + See Location
    LocationMap.tsx       ✅ iframe Google Maps tanpa API key
    Gallery.tsx           ✅ "use client" — grid + lightbox
    Rsvp.tsx              ✅ "use client" — form + ringkasan angka dari GET
    Wishes.tsx            ✅ "use client" — form + daftar ucapan
    Footer.tsx            ✅ ucapan terima kasih + kredit musik
  ui/
    Reveal.tsx            ✅ "use client" — IntersectionObserver
    Section.tsx           ✅ Section + SectionTitle
    Divider.tsx           ✅ ornamen belah ketupat
    Button.tsx            ✅ solid/outline, jadi <button> ATAU tautan
    Field.tsx             ✅ label + isian + error, plus inputClasses
    CoupleNames.tsx       ✅ "RICKY and FELLYCIA" — dipakai 6 tempat
    Lightbox.tsx          ✅ "use client" — modal foto, Esc + panah
    NavDrawer.tsx         ✅ "use client" — menu geser, inert saat tutup
    MusicToggle.tsx       ✅ tombol tampilan murni, tanpa state

lib/config.ts             ✅ SATU-SATUNYA sumber data acara
lib/schemas.ts            ✅ validasi Zod, dipakai client DAN server
lib/utils.ts              ✅ countdown, timeAgo, link Calendar & Maps
lib/prisma.ts             ✅ koneksi database (singleton, aman dari hot-reload)
prisma/schema.prisma      ✅ model Rsvp & Wish
scripts/optimize-images.mjs ✅
public/images/*.webp      ✅ 11 file, 612 KB
public/audio/backsound.mp3 ✅ 4,4 MB
tests/                    ⬜
```

**Aturan yang dipegang konsisten:**
- 1 file = 1 section, namanya sama dengan judul yang tampil. "Kode countdown di mana?" → `components/sections/Countdown.tsx`
- Tidak ada string data acara yang di-hardcode di komponen. Semua dari `lib/config.ts`
- Server Component secara default. `"use client"` hanya di 7 file yang ditandai di atas
- Keempat route handler berbentuk sama persis: `try/catch` → `safeParse` → query Prisma → `NextResponse.json`
- Komentar hanya menjelaskan **kenapa**, bukan mengulang apa yang sudah jelas dari kode

### Di mana state disimpan

Hanya ada **tiga tempat** yang memegang state, dan semuanya `useState` biasa:

| Tempat | State | Kenapa di situ |
|---|---|---|
| `Invitation.tsx` | `opened`, `playing`, `musicAvailable` | ketiganya lahir dari satu klik yang sama: "Open Invitation" |
| `Gallery.tsx` | `openIndex` (foto mana yang dibuka, atau null) | hanya galeri yang peduli |
| `NavDrawer.tsx` | `open` | hanya menu yang peduli |
| `Rsvp.tsx` | `form`, `errors`, `status`, `serverError`, `summary` | milik satu form itu saja |
| `Wishes.tsx` | `form`, `errors`, `sending`, `serverError`, `sent`, `wishes`, `listState` | milik satu form itu saja |

Kelimanya `useState` biasa dan tidak ada satu pun yang dibaca komponen lain.

**Ini alasan konkret project tidak butuh Context atau state manager** — tidak ada satu pun state yang perlu dibaca komponen yang berjauhan. Section-section undangan bahkan tidak punya state sama sekali; mereka Server Component yang masuk ke `Invitation` lewat `children`, jadi tidak ikut terbundel ke JavaScript browser.

---

## 5. Desain (hasil inspeksi live template referensi)

### Token warna — dari `getComputedStyle` di halaman asli

| Token | Hex | Untuk |
|---|---|---|
| `--ink` | `#2C3F4E` | teks utama, nav drawer |
| `--mist` | `#D5DADE` | background section utama |
| `--cream` | `#FAF8F4` | background alternatif |
| `--stone` | `#737373` | tombol, teks sekunder |
| `--charcoal` | `#323030` | overlay, footer |

### Font (terkonfirmasi dari halaman asli)

`Marcellus` heading · `Cormorant Upright` body · `Montserrat` label/UI · **`Parisienne`** pengganti `Boheme Floral` (berbayar) untuk kata "and" dan hashtag. Semua via `next/font/google`.

### Layout

- **Mobile:** satu kolom, lebar konten maks ~480px
- **Desktop ≥1024px:** panel kiri **fixed** (foto besar + "THE WEDDING OF" + ayat), panel kanan kolom ~480–560px yang scroll berisi seluruh undangan. Ini signature Invitato, wajib ditiru.
- **Motion:** fade-in + translate-Y saat section masuk viewport; nav drawer slide dari kanan

### Urutan section template asli

Cover (gate) → Welcoming → Groom & Bride → Love Story → Counting the Days → Wedding Details → QR Card → RSVP → A Portrait Of (gallery) → Pre-Wedding → Live Streaming → Wedding Gift → Kind Words → Footer. Floating: hamburger nav kiri-bawah + music toggle.

---

## 6. Pemetaan asset (11 file, sudah diinspeksi visual satu per satu)

Pemetaan **final** (tiga di antaranya berubah dari rencana awal setelah dicek di layar — lihat catatan di bawah tabel):

| Asli | Isi | Hasil optimasi | Dipakai di | Key di `config.images` |
|---|---|---|---|---|
| `4.png` | pasangan + 2 doberman (836×1881, potret tinggi) | `cover.webp` 50 KB | **Cover / gerbang** (HP & kolom desktop) | `cover` |
| `10.png` | pasangan berpelukan, backlit jendela (lanskap) | `moment.webp` 66 KB | **panel kiri desktop** | `desktopPanel` |
| `3.png` | pasangan black-tie, dinding putih | `welcoming.webp` 33 KB | Welcoming | `welcoming` |
| `5.png` | **groom solo** + doberman | `groom.webp` 27 KB | kartu Groom | `couple.groom.photo` |
| `6.png` | **bride solo** + doberman | `bride.webp` 26 KB | kartu Bride | `couple.bride.photo` |
| `8.png` | pasangan duduk di jendela | `gallery-4.webp` 52 KB | **bg Countdown** + galeri | `countdown` |
| `2.png` | pasangan di bar kayu gelap, champagne | `gallery-2.webp` 116 KB | **bg Footer** + galeri | `footer` |
| `background.jpg` | tekstur kain sutra putih | `texture.webp` 10 KB | latar samar Welcoming (opacity 40%) | `texture` |
| `1.png` | pasangan di yacht, sunset | `gallery-1.webp` 86 KB | galeri (foto lebar, 2 kolom) | `gallery[0]` |
| `7.png` | pasangan berdiri di jendela | `gallery-3.webp` 59 KB | galeri | `gallery[2]` |
| `9.png` | bride di ambang jendela | `gallery-5.webp` 58 KB | galeri | `gallery[4]` |

**Perubahan dari rencana, beserta alasannya:**
- **Panel kiri desktop: `cover.webp` → `moment.webp`.** Panel itu melebar, sedangkan `cover.webp` potret 836×1881. `object-cover` memotongnya sampai kepala pengantin hilang. Aturannya: **cocokkan rasio foto dengan bentuk wadahnya.** Foto lanskap untuk panel lebar, potret untuk kolom HP.
- **Bg Countdown & Footer** dipilih ulang berdasarkan terang-gelapnya, bukan isinya: teks di keduanya berwarna terang, jadi butuh foto yang bagian tengahnya gelap. `gallery-2.webp` (bar kayu gelap) paling aman untuk footer.

`assets/` mentah **di-gitignore** (18,6 MB). Yang di-commit hanya WebP di `public/images/` — **total 612 KB**.

---

## 7. Scope

**Wajib (PRD §1.5):** halaman publik responsif · cover/opening · info acara · gallery · form RSVP (Nama, Hadir/Tidak hadir, Jumlah orang) · form Wishes + daftar wishes · backend API + DB persisten · validasi & error handling · musik latar · countdown · maps · animasi transisi

**Tidak dikerjakan (PRD §1.6 eksplisit tidak wajib):** admin dashboard, autentikasi, guest list, QR/Access Card, video Pre-Wedding & Live Streaming (asetnya tidak diberikan), Wedding Gift.
Alasan: dengan deadline 1–2 hari, kualitas 10 fitur wajib > breadth.

**Stretch (hanya kalau tidak menambah kerumitan):** toggle EN/ID, OG image. Personalisasi nama tamu via `?to=` sudah masuk core.

---

## 8. Kontrak API

| Endpoint | Body/Query | Sukses | Error |
|---|---|---|---|
| `POST /api/rsvp` | `{guestName, attendance, guestCount}` | `201 {data}` | `400 {error, fieldErrors}` · `500` |
| `GET /api/rsvp` | — | `200 {attending, notAttending, totalPax}` | `500` |
| `POST /api/wishes` | `{name, message}` | `201 {data}` | `400` · `500` |
| `GET /api/wishes` | — | `200 {data[]}` 100 terbaru | `500` |

Validasi: `guestName` 2–80 char · `guestCount` int 1–10 kalau Hadir, dipaksa 0 kalau Tidak Hadir (satu `.refine()`) · `message` 3–500 char. Pesan error untuk user dalam Bahasa Indonesia.

**Kenapa Route Handler dihitung "backend API":** `app/api/*/route.ts` jalan di server (Node runtime), memegang koneksi Prisma, tidak pernah ter-bundle ke client. Backend HTTP sungguhan dengan boundary tegas. Jelaskan ini di README.

---

## 9. Catatan teknis yang mudah terlewat

- **Supabase butuh DUA URL.** PgBouncer tidak mendukung prepared statement, sedangkan `prisma migrate` membutuhkannya.
  `DATABASE_URL` = pooler `:6543?pgbouncer=true&connection_limit=1` (runtime) · `DIRECT_URL` = langsung `:5432` (migrate saja)
- **Google Maps embed tanpa API key:** `https://www.google.com/maps?q=<alamat>&output=embed`
- **Tanggal acara diubah** dari 26 Des 2024 (referensi, sudah lewat → countdown mati) ke **Sabtu 26 Des 2026**. Hari & bulan sama persis. Ditulis dengan offset `+07:00` eksplisit supaya countdown sama untuk semua zona waktu.
- **`LayoutProps<"/">`** bawaan template Next 16 butuh `.next/types` hasil build. Sudah diganti dengan tipe eksplisit `{ children: React.ReactNode }` — lebih mudah dibaca juga.
- **ESLint** harus mengabaikan `.claude/**` (skill scripts bukan kode aplikasi).

### Next.js 16 — breaking change yang mengenai project ini

Dokumentasi versi terpasang ada di `node_modules/next/dist/docs/`. Yang relevan:

- **`searchParams` sekarang Promise.** Fitur personalisasi nama tamu (`?to=`) WAJIB `await props.searchParams`. Akses sinkron sudah dihapus total di v16.
- **`data-scroll-behavior="smooth"` di `<html>`** diperlukan agar Next mematikan sementara `scroll-behavior: smooth` saat pindah halaman. Sudah dipasang di `app/layout.tsx`.
- **`next dev` menulis ulang blok `BEGIN:nextjs-agent-rules` di akhir file ini** setiap kali dev server jalan — jadi ikut di-commit saja supaya working tree tetap bersih. Bisa dimatikan lewat `agentRules: false` di `next.config.ts`.
- **JANGAN pernah menulis penanda `<`+`!-- BEGIN:nextjs-agent-rules --`+`>` secara utuh di dalam prosa file ini.** Generatornya (`node_modules/next/dist/server/lib/generate-agent-files.js:149`) mencari kemunculan **pertama** penanda BEGIN dan kemunculan **pertama** penanda END, lalu membuang semua yang ada di antaranya. Penyebutan di tengah dokumen membuat seluruh isi setelahnya terhapus — sudah pernah terjadi sekali, §10 sampai §13 hilang (147 baris) dan dipulihkan dengan `git checkout -- CLAUDE.md`. Karena itu penandanya sekarang ditulis terpotong.

### Cara cek tampilan responsif di mesin ini

`resize_window` **tidak mengubah viewport halaman** di sini — `innerWidth` mentok di 1536 berapa pun ukuran jendelanya. Cara yang berhasil: suntik iframe berukuran HP lewat console, karena media query mengikuti viewport iframe-nya.

```js
document.body.innerHTML =
  '<iframe src="/" style="width:390px;height:800px;border:0"></iframe>' +
  '<iframe src="/" style="width:768px;height:800px;border:0"></iframe>';
```

Lalu ukur dari luar: `iframe.contentWindow.innerWidth`, `getComputedStyle(aside).display`, `documentElement.scrollWidth <= innerWidth` (cek tidak ada overflow horizontal).

**Catatan penting:** tab yang dikendalikan otomatis di sini **tidak di-composite**. Akibatnya ada dua:

1. Tangkapan layar sering menampilkan frame basi — teks terlihat pucat/hilang padahal DOM-nya benar. Sudah dua kali `Reveal` disangka rusak padahal `opacity: 1`.
2. **Transisi CSS pada properti yang dianimasikan compositor (`translate`, `opacity`, `transform`) macet di `playState: "running"` dan tidak pernah selesai.** NavDrawer sempat disangka tidak membuka karena ini.

Cara memeriksa yang benar: matikan transisinya dulu (`el.style.transition='none'`), baru ukur posisi akhirnya. Dan **jangan menilai bug dari screenshot** — selalu ukur lewat `getComputedStyle` / `getBoundingClientRect`.

Catatan lain: Tailwind v4 memakai properti CSS `translate`, bukan `transform`. Jadi `getComputedStyle(el).transform` akan selalu `"none"` untuk `translate-x-*` — yang harus dibaca `getComputedStyle(el).translate`.

Dan: **klik lewat `computer` tool sering meleset di tab ini.** Yang berhasil untuk menguji alur adalah `element.click()` dari console. Konsekuensinya lihat catatan autoplay di bawah.

### Autoplay audio — dan kenapa `play()` ada di handler klik

Browser hanya mengizinkan audio berbunyi sebagai buah **gestur pengguna asli**. Dua akibatnya:

1. **`play()` dipanggil langsung di dalam `handleOpen`, bukan di `useEffect`.** Kalau ditunda ke `useEffect`, sebagian browser (Safari terutama) sudah tidak menganggapnya bagian dari klik tadi. Ini alasan elemen `<audio>` tinggal di `Invitation.tsx`, bukan di `MusicToggle`.
2. **Bunyi musik TIDAK BISA diverifikasi lewat otomasi di sini.** `element.click()` dari console bukan gestur asli, jadi `play()` selalu ditolak `NotAllowedError`. Yang bisa diverifikasi: berkas valid, tersaji benar (`200`, `audio/mpeg`, `Accept-Ranges`), elemen ter-mount dengan `preload="none"` tanpa mengunduh apa pun (`networkState: 1`), dan penolakan ditangani rapi sehingga tombol tetap bisa dipakai manual. **Sisanya harus dicek manusia.**

### Spasi di JSX — cacat aksesibilitas yang tidak terlihat di layar

JSX membuang whitespace yang mengandung baris baru. Jadi ini:

```jsx
{couple.groom.shortName}
<span className="mx-2">and</span>
{couple.bride.shortName}
```

menghasilkan teks `RICKYandFELLYCIA`. Di layar terlihat berjarak karena `mx-2`, tapi pembaca layar melafalkannya sebagai satu kata. Perbaikannya `{" "}` eksplisit — sekarang terpusat di `components/ui/CoupleNames.tsx`. **Cara mendeteksinya: baca `element.innerText`, jangan lihat layar.**

---

## 10. Keputusan yang sudah diambil

1. **Stack Next.js fullstack**, bukan Vite+Express terpisah — 1 repo, 1 deploy, cukup untuk memenuhi "backend API + database" di PRD, hemat waktu.
2. **Konten pakai Ricky & Fellycia** (ikut referensi) supaya reviewer bisa membandingkan side-by-side.
3. **Nama orang tua diisi sendiri** — referensi cuma placeholder "Mr. Parent Man". Dipakai: Hendra & Lianawati Ravanelli, Bambang Pratama & Sylvia Indriyani. Ubah di `lib/config.ts`.
4. **`prisma` CLI di-pin ke `^7.10.0`** — npm sempat memasang `8.0.0-rc` (release candidate) yang tidak cocok dengan `@prisma/client` v7. RC tidak dipakai di project assessment.
5. **Prisma diturunkan dari 7.10 ke 6.19.** Prisma 7 melarang `url` di `schema.prisma`; koneksi harus pindah ke `prisma.config.ts` DAN client harus dibungkus driver adapter (`@prisma/adapter-pg` + `pg`), dengan client hasil generate di folder terpisah yang harus diurus sendiri. Build gagal dengan error P1012. Prisma 6 memakai pola yang ada di semua tutorial: `url` di schema, `import { PrismaClient } from "@prisma/client"`, `new PrismaClient()`. Sesuai aturan §1, versi yang lebih mudah dijelaskan menang. Build sudah hijau.
6. **Panel kiri desktop memakai `moment.webp` (foto lanskap), bukan `cover.webp`.** `cover.webp` berbentuk potret 836×1881; di panel yang melebar, `object-cover` memotongnya habis sampai kepala pengantin hilang. Foto lanskap cocok dengan bentuk wadahnya. `cover.webp` tetap dipakai untuk halaman sampul di HP, di mana rasio potretnya justru pas.
7. **Musik: "Romantic Piano Inspiring" oleh PaulYudin (Pixabay).** Dipilih user dari dua kandidat. **Pixabay Content License** — bebas komersial, atribusi *tidak* wajib; kredit tetap dicantumkan di footer karena pantas, bukan karena diharuskan. Sumber lain yang ditolak: Kevin MacLeod / Incompetech (CC BY 4.0) karena atribusinya wajib dan akan memaksa nama pihak ketiga muncul permanen di footer undangan.
8. **`preload="none"` pada `<audio>`.** Berkasnya 4,4 MB — tujuh kali lipat seluruh foto undangan (612 KB). Dengan `"auto"`, tamu mengunduhnya begitu halaman dibuka padahal belum tentu melanjutkan.
9. **`.claude/`, `skills-lock.json`, `*.docx` di-gitignore.** Dua yang pertama tooling, bukan karya user. PRD `.docx` adalah dokumen internal Invitato dan dokumennya sendiri melarang publikasi di luar proses seleksi. File tetap ada di disk.

---

## 11. Progress

- [x] **Step 1 — Scaffold.** Next.js + TS + Tailwind + Prisma + Zod + Vitest ter-install & terverifikasi (`tsc` 0 error, `eslint` 0 error, prisma/sharp/vitest jalan). `lib/config.ts`, `lib/schemas.ts`, `lib/utils.ts`, `prisma/schema.prisma` sudah ditulis. Git init + commit `4a4d68b` di branch `main`.
- [x] **Step 2 — Optimasi asset.** `scripts/optimize-images.mjs` jalan: **18.56 MB → 0.57 MB (-97%)**. 11 WebP di `public/images/` dengan nama bermakna. Kualitas dicek visual, tidak ada artefak. Path-nya ditambahkan ke `lib/config.ts` (`images` + `gallery`). Commit `9337d96`.
- [x] **Step 3 — Design system.** Token warna + 4 font Google di `globals.css`/`layout.tsx`. Komponen: `Reveal` (IntersectionObserver), `Divider`, `Button` (solid/outline, bisa jadi tombol atau tautan), `Field` + `inputClasses`, `Section` + `SectionTitle`. `InvitationShell` = split-panel desktop (aside `sticky` + kolom 512px). Terverifikasi dengan pengukuran DOM, bukan screenshot: **390px** aside hidden, konten 319px, tanpa overflow horizontal · **768px** aside hidden, konten dikunci 480px · **1536px** aside tampil, main 512px. `tsc` + `eslint` + `next build` semua hijau.
- [x] **Step 4 — Section statis.** Cover (gerbang + `?to=`) · Welcoming · CoupleProfile · Countdown · EventDetails · LocationMap · Gallery + Lightbox · Footer · NavDrawer · MusicToggle. `Invitation` memegang satu-satunya state halaman (`opened`); section tetap Server Component lewat `children`. Terverifikasi: countdown berdetak (112d 19j 32m, detik turun) · gerbang mengunci lalu melepas scroll · lightbox buka/panah/Escape · nav drawer buka-tutup + `inert` · 13 gambar termuat, 0 rusak · tanpa overflow horizontal di 390/768/1536 · `next build` hijau. **Menunggu file musik** — `MusicToggle` menyembunyikan diri sendiri kalau audio gagal dimuat, jadi halaman tetap normal sementara ini.
- [x] **Step 5 — Backend.** `lib/prisma.ts` (satu instance disimpan di `globalThis` supaya hot-reload tidak menumpuk koneksi) + 4 route handler berbentuk identik: `try` → `safeParse` → Prisma → `NextResponse`. Terverifikasi dengan `curl` ke dev server: `POST /api/wishes` isian terlalu pendek → **400** berisi `fieldErrors` per field · body bukan JSON → **400**, bukan 500, berkat `request.json().catch(() => null)` · `POST /api/rsvp` hadir tapi 0 orang → **400** "Jumlah orang minimal 1 jika Anda hadir" · `PUT /api/rsvp` → **405** dari Next · `next build` hijau dan kedua route terdaftar **ƒ (Dynamic)**, jadi tidak ikut di-prerender saat build. `tsc` + `eslint` 0 error. **Jalur suksesnya (201) belum diuji** — butuh kredensial Supabase; tanpa `DATABASE_URL`, query Prisma gagal dan tertangkap rapi sebagai 500 sesuai kontrak.
- [x] **Step 6 — Form RSVP & Wishes.** Dua Client Component yang bentuknya sengaja dibuat identik, tanpa hook bersama — satu form cukup dibaca dari atas ke bawah. Terverifikasi lewat pengukuran DOM di browser: submit form kosong → 2 pesan error + `aria-invalid` + **0 request** (validasi browser benar-benar menahan) · hadir tapi 0 orang → tertahan juga, aturan lintas-field jalan di client · submit valid → **tepat satu** `fetch("/api/rsvp")`, server balas 500 (belum ada DB), pesannya tampil dan isian tamu tidak hilang · daftar wishes gagal dimuat → "Daftar ucapan sedang tidak bisa dimuat", bukan halaman rusak · 390px form 319px, 768px form 480px, tanpa overflow horizontal. `tsc` + `eslint` + `next build` hijau.
- [ ] **Step 7 — Test Vitest**
- [ ] **Step 8 — Polish & verifikasi** (375/768/1440px, a11y, `prefers-reduced-motion`)
- [ ] **Step 9 — README** (cara jalan, arsitektur, keputusan teknis, disclosure AI)
- [ ] **Step 10 — Deploy** Vercel + Supabase

**Cara kerja:** user minta konfirmasi setiap selesai satu step. **Jangan lanjut ke step berikutnya tanpa aba-aba.**

### Riwayat commit

| Commit | Isi |
|---|---|
| `4a4d68b` | scaffold Next.js + TS + Tailwind, schema Prisma, config acara |
| `6f6003f` | CLAUDE.md |
| `9337d96` | optimasi asset 18,6 MB → 0,57 MB |
| `2dbdd7f` | tandai Step 2 selesai |
| `6190bdc` | design system + kerangka split-panel desktop |
| `b96efc1` | seluruh section, nav drawer, kontrol musik |
| `a2efc20` | musik latar + pindahkan `play()` ke handler klik |
| `5bdec90` | catatan Step 3 & 4 di CLAUDE.md |
| `595aa19` | backend: 4 route handler + koneksi Prisma |

---

## 11b. Utang yang sengaja dibiarkan (harus lunas sebelum submit)

| Hal | Kapan lunas |
|---|---|
| Belum ada satu pun test | Step 7 |
| `README.md` masih bawaan `create-next-app` | Step 9 |
| Bunyi musik belum pernah diverifikasi manusia | butuh user |
| Belum pernah dijalankan dengan database sungguhan — jalur 400 & 405 sudah diuji, jalur 201 belum | butuh kredensial Supabase dari user |

---

## 11c. Alur data RSVP — bekal interview

Pertanyaan yang hampir pasti muncul: *"coba jelaskan apa yang terjadi saat tamu mengisi RSVP."*

```
Tamu klik "Kirim"
  └─> Rsvp.tsx: rsvpSchema.safeParse(isian)          ← validasi di BROWSER
        gagal  -> tampilkan error per field, TIDAK ada request ke server
        lolos  -> fetch("/api/rsvp", { method:"POST", body: JSON })
                    └─> app/api/rsvp/route.ts        ← ini SERVER (Node), bukan browser
                          rsvpSchema.safeParse(body) ← validasi LAGI di server
                            gagal -> 400 { error, fieldErrors }
                            lolos -> prisma.rsvp.create(...)
                                       └─> Postgres di Supabase   ← data menetap di sini
                                     201 { data }
                  <- response
        └─> setState -> React render ulang -> pesan sukses tampil
```

**Kenapa divalidasi dua kali?** Yang di browser untuk kenyamanan — tamu langsung tahu salahnya tanpa menunggu jaringan. Yang di server untuk keamanan — siapa pun bisa melewati browser dan mengirim POST langsung pakai `curl`, jadi server tidak boleh percaya kiriman client. Aturannya sendiri hanya ditulis **sekali** di `lib/schemas.ts`, sehingga keduanya mustahil berbeda.

**Kenapa Route Handler dihitung backend?** `app/api/*/route.ts` berjalan di Node di server, memegang koneksi Prisma, dan **tidak pernah ikut terbundel ke JavaScript browser**. Batasnya tegas: kredensial database tidak pernah sampai ke tamu.

---

## 12. Butuh aksi user

| Hal | Status |
|---|---|
| **Musik latar** — SUDAH. "Romantic Piano Inspiring" oleh PaulYudin, Pixabay Content License, di `public/audio/backsound.mp3` (4,4 MB, 256 kbps). Kredit ada di footer + `lib/config.ts`. | selesai |
| **Uji dengar musik** — playback nyata belum bisa diverifikasi di sini: browser menolak `play()` dengan `NotAllowedError` karena klik otomatis bukan gestur pengguna asli. Perlu user membuka `localhost:3000` lalu klik "Open Invitation" sendiri. | **belum** |
| **Kredensial Supabase** — user buat project, kirim `DATABASE_URL` + `DIRECT_URL`. Jangan pernah di-commit, hanya `.env.example` | belum |
| **Push GitHub** — butuh `gh auth login` dari user. Minta konfirmasi sebelum push pertama | belum |

---

## 13. Deliverables (PRD §1.9)

Dikirim lewat https://forms.gle/goztBD5BejTkkhGU7

1. Link GitHub repository
2. Live deployment URL yang bisa dibuka
3. README: cara jalan lokal · arsitektur & keputusan teknis · setup env & database · **disclosure AI tools** (Claude Code dipakai untuk riset referensi, scaffolding, implementasi — sebutkan bagiannya)

Tambahan: ringkasan alur data (klik Submit → validasi client → `fetch` → route handler → Zod → Prisma → Postgres → response → UI) sebagai bekal interview.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
