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

Next.js 16.3.4 · React 19.2.8 · TypeScript 5 (strict) · Tailwind 4 · Zod 4 · Prisma 7.10 · Vitest 4 · sharp
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

```
app/
  layout.tsx           fonts + metadata
  page.tsx             komposisi semua section (Server Component)
  globals.css          design token + Tailwind
  api/rsvp/route.ts    POST create · GET ringkasan
  api/wishes/route.ts  POST create · GET list
components/sections/   1 file = 1 section, nama = judul di layar
components/ui/         Reveal, NavDrawer, MusicToggle, Lightbox, Divider, Button, Field
lib/config.ts          SATU-SATUNYA sumber data acara
lib/schemas.ts         validasi Zod, dipakai client DAN server
lib/prisma.ts          koneksi database
lib/utils.ts           fungsi murni, semuanya ada test-nya
prisma/schema.prisma
scripts/optimize-images.mjs
tests/
```

**Aturan yang dipegang konsisten:**
- 1 file = 1 section, namanya sama dengan judul yang tampil. "Kode countdown di mana?" → `components/sections/Countdown.tsx`
- Tidak ada string data acara yang di-hardcode di komponen. Semua dari `lib/config.ts`
- Server Component secara default. `"use client"` hanya di: Countdown, Rsvp, Wishes, NavDrawer, MusicToggle, Lightbox, Reveal
- Keempat route handler berbentuk sama persis: `try/catch` → `safeParse` → query Prisma → `NextResponse.json`
- Komentar hanya menjelaskan **kenapa**, bukan mengulang apa yang sudah jelas dari kode

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

| File | Isi | Dipakai di | Nama hasil optimasi |
|---|---|---|---|
| `background.jpg` | tekstur kain sutra putih | bg Welcoming + Wishes | `texture.webp` |
| `1.png` | pasangan di yacht, sunset | gallery | `gallery-1.webp` |
| `2.png` | pasangan di bar kayu, champagne | gallery | `gallery-2.webp` |
| `3.png` | pasangan black-tie, dinding putih | Welcoming | `welcoming.webp` |
| `4.png` | pasangan + 2 doberman (836×1881) | **Cover gate** + panel kiri desktop | `cover.webp` |
| `5.png` | **groom solo** + doberman | kartu Groom | `groom.webp` |
| `6.png` | **bride solo** + doberman | kartu Bride | `bride.webp` |
| `7.png` | pasangan berdiri di jendela | gallery | `gallery-3.webp` |
| `8.png` | pasangan duduk di jendela | gallery | `gallery-4.webp` |
| `9.png` | bride di ambang jendela | gallery | `gallery-5.webp` |
| `10.png` | pasangan berpelukan, backlit | bg Countdown + Footer | `moment.webp` |

`assets/` mentah **di-gitignore** (19 MB). Yang di-commit hanya hasil WebP di `public/images/` (~2 MB).

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

---

## 10. Keputusan yang sudah diambil

1. **Stack Next.js fullstack**, bukan Vite+Express terpisah — 1 repo, 1 deploy, cukup untuk memenuhi "backend API + database" di PRD, hemat waktu.
2. **Konten pakai Ricky & Fellycia** (ikut referensi) supaya reviewer bisa membandingkan side-by-side.
3. **Nama orang tua diisi sendiri** — referensi cuma placeholder "Mr. Parent Man". Dipakai: Hendra & Lianawati Ravanelli, Bambang Pratama & Sylvia Indriyani. Ubah di `lib/config.ts`.
4. **`prisma` CLI di-pin ke `^7.10.0`** — npm sempat memasang `8.0.0-rc` (release candidate) yang tidak cocok dengan `@prisma/client` v7. RC tidak dipakai di project assessment.
5. **`.claude/`, `skills-lock.json`, `*.docx` di-gitignore.** Dua yang pertama tooling, bukan karya user. PRD `.docx` adalah dokumen internal Invitato dan dokumennya sendiri melarang publikasi di luar proses seleksi. File tetap ada di disk.

---

## 11. Progress

- [x] **Step 1 — Scaffold.** Next.js + TS + Tailwind + Prisma + Zod + Vitest ter-install & terverifikasi (`tsc` 0 error, `eslint` 0 error, prisma/sharp/vitest jalan). `lib/config.ts`, `lib/schemas.ts`, `lib/utils.ts`, `prisma/schema.prisma` sudah ditulis. Git init + commit `4a4d68b` di branch `main`.
- [x] **Step 2 — Optimasi asset.** `scripts/optimize-images.mjs` jalan: **18.56 MB → 0.57 MB (-97%)**. 11 WebP di `public/images/` dengan nama bermakna. Kualitas dicek visual, tidak ada artefak. Path-nya ditambahkan ke `lib/config.ts` (`images` + `gallery`). Commit `9337d96`.
- [ ] **Step 3 — Design system** (token, font, `Reveal`/`Divider`/`Button`/`Field`, shell split-panel)
- [ ] **Step 4 — Section statis** (Cover → Footer + nav drawer + music toggle)
- [ ] **Step 5 — Backend** (`lib/prisma.ts`, 4 route handler)
- [ ] **Step 6 — Form RSVP & Wishes** tersambung API
- [ ] **Step 7 — Test Vitest**
- [ ] **Step 8 — Polish & verifikasi** (375/768/1440px, a11y, `prefers-reduced-motion`)
- [ ] **Step 9 — README** (cara jalan, arsitektur, keputusan teknis, disclosure AI)
- [ ] **Step 10 — Deploy** Vercel + Supabase

**Cara kerja:** user minta konfirmasi setiap selesai satu step. **Jangan lanjut ke step berikutnya tanpa aba-aba.**

---

## 12. Butuh aksi user

| Hal | Status |
|---|---|
| **Musik latar** — tidak ada file audio di asset pack. Saya cari track CC0, **kirim link untuk approval dulu**, baru download ke `public/audio/` | belum |
| **Kredensial Supabase** — user buat project, kirim `DATABASE_URL` + `DIRECT_URL`. Jangan pernah di-commit, hanya `.env.example` | belum |
| **Push GitHub** — butuh `gh auth login` dari user. Minta konfirmasi sebelum push pertama | belum |

---

## 13. Deliverables (PRD §1.9)

Dikirim lewat https://forms.gle/goztBD5BejTkkhGU7

1. Link GitHub repository
2. Live deployment URL yang bisa dibuka
3. README: cara jalan lokal · arsitektur & keputusan teknis · setup env & database · **disclosure AI tools** (Claude Code dipakai untuk riset referensi, scaffolding, implementasi — sebutkan bagiannya)

Tambahan: ringkasan alur data (klik Submit → validasi client → `fetch` → route handler → Zod → Prisma → Postgres → response → UI) sebagai bekal interview.
