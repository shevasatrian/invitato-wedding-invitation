# Panduan Kode — Undangan Pernikahan Ricky & Fellycia

Dokumen ini untuk **memahami dan menjelaskan** kode di repository ini, bukan untuk memakainya. Cara menjalankan project ada di [`README.md`](../README.md).

Ditulis dengan asumsi pertanyaan yang akan datang: *"jelaskan kode kamu"*, *"kenapa begini, bukan begitu"*, dan *"tunjukkan di mana X terjadi"*.

**Ukuran project:** 3.816 baris TypeScript/TSX di 36 berkas (38 bila CSS dan skema Prisma ikut dihitung) · 54 test · 8 Client Component.

---

## Daftar isi

1. [Jawaban 30 detik](#1-jawaban-30-detik)
2. [Alur satu kunjungan, dari URL sampai piksel](#2-alur-satu-kunjungan-dari-url-sampai-piksel)
3. [Peta berkas](#3-peta-berkas)
4. [Berkas demi berkas](#4-berkas-demi-berkas)
5. [Tujuh mekanisme yang paling mungkin ditanya](#5-tujuh-mekanisme-yang-paling-mungkin-ditanya)
6. [Bank pertanyaan interview](#6-bank-pertanyaan-interview)
7. [Angka yang sebaiknya hafal](#7-angka-yang-sebaiknya-hafal)

---

## 1. Jawaban 30 detik

> Undangan pernikahan satu halaman dengan Next.js 16 App Router. Halaman sampul berfungsi sebagai gerbang — sebelum tamu menekan "Open Invitation", scroll dikunci. Isinya bergulir ke bawah: sambutan, profil mempelai, hitung mundur, detail acara, peta, kartu undangan ber-QR, RSVP, galeri, dan ucapan.
>
> Backend-nya Route Handler di `app/api/`, berjalan di Node di server dan memegang koneksi Prisma ke Postgres di Supabase. Aturan validasi ditulis **sekali** di `lib/schemas.ts` lalu dipakai browser **dan** server, sehingga keduanya mustahil punya definisi "valid" yang berbeda.
>
> Hampir semua komponen adalah Server Component. Hanya delapan berkas memakai `"use client"`, dan setiap satunya punya alasan konkret: ada state, ada event listener, atau ada API browser.

Kalau hanya boleh menyebut **satu** hal yang membedakan project ini: **tidak ada state yang dibaca lintas komponen.** Itu alasan konkret tidak ada Context, Redux, atau Zustand di sini — bukan karena belum sempat.

---

## 2. Alur satu kunjungan, dari URL sampai piksel

```
Tamu membuka  /?to=Budi%20Santoso&lang=id
        │
        ▼
app/layout.tsx          Server Component
        │               • 4 font via next/font, diunduh saat build lalu disajikan
        │                 dari domain sendiri (tidak ada request ke Google)
        │               • metadataBase saja — layout TIDAK menerima searchParams
        │               • <html lang="en" data-scroll-behavior="smooth">
        ▼
app/page.tsx            Server Component, async
        │               • const { to, lang: rawLang } = await searchParams
        │                 (Promise sejak Next 16 — akses sinkron sudah dihapus)
        │               • const lang = pickLang(rawLang)
        │               • const t    = dictionaries[lang]     ← satu kamus dipilih di sini
        │               • generateMetadata() menyusun judul + og:title sesuai bahasa
        ▼
InvitationShell         Server Component
        │               • <main lang={lang}> ← penanda bahasa DI SINI, bukan di <html>
        │               • DesktopPanel: foto + ayat, sticky, hanya tampil ≥1024px
        ▼
Invitation              "use client"  ← satu-satunya pemegang state halaman
        │               • useState: opened, playing, musicAvailable
        │               • <Cover> di atas, {children} di bawah
        │
        ├── children ──► 10 section, SEMUANYA tetap Server Component
        │                Welcoming · CoupleProfile · Countdown · EventDetails
        │                LocationMap · AccessCard · Rsvp · Gallery · Wishes · Footer
        │
        └── setelah opened ──► NavDrawer + MusicToggle
```

### Bagian yang paling sering ditanya dari diagram ini

**Kenapa section tetap Server Component padahal induknya Client Component?**

Karena section masuk lewat **`children`**, bukan di-`import` di dalam `Invitation`. React merender `children` di server lebih dulu, lalu hasil jadinya dititipkan ke komponen client. Kalau `Invitation` meng-`import Welcoming` dan merendernya sendiri, `Welcoming` ikut menjadi client dan seluruh isinya terbundel ke JavaScript browser.

Praktisnya: **satu pola `children` menahan sepuluh komponen agar tidak ikut ke browser.**

---

## 3. Peta berkas

```
app/
  layout.tsx              <html>, 4 font, metadataBase
  page.tsx                susunan section + generateMetadata + baca ?to= dan ?lang=
  globals.css             design token, .scroll-locked, prefers-reduced-motion
  icon.png                ikon tab        ┐
  apple-icon.png          ikon iOS        ├ konvensi nama berkas Next — tidak pernah di-import
  opengraph-image.jpg     pratinjau link  ┘
  api/rsvp/route.ts       POST simpan · GET ringkasan angka
  api/wishes/route.ts     POST simpan · GET 100 terbaru

components/
  InvitationShell.tsx     kerangka split-panel desktop
  Invitation.tsx          ★ satu-satunya pemegang state halaman
  sections/               11 berkas — 1 berkas = 1 section (Cover dirender Invitation)
  ui/                     10 komponen pakai-ulang

lib/
  config.ts               FAKTA acara: tanggal, alamat, foto, nama
  i18n.ts                 KALIMAT acara dalam dua bahasa
  schemas.ts              aturan validasi — dipakai browser DAN server
  utils.ts                fungsi murni, semuanya ada test-nya
  prisma.ts               koneksi database

prisma/schema.prisma      model Rsvp & Wish
tests/                    4 berkas, 54 test
```

**Aturan penamaan yang dipegang konsisten:** satu berkas = satu section, dan namanya sama dengan judul yang tampil di layar. Pertanyaan *"kode hitung mundur di mana?"* dijawab tanpa perlu mencari: `components/sections/Countdown.tsx`.

---

## 4. Berkas demi berkas

### `lib/config.ts` — fakta acara

Berisi hal yang **sama di bahasa mana pun**: nama, orang tua, Instagram, path foto, tanggal, jam, venue, alamat, id nav, sumber musik, dan `site.url`.

```ts
export const couple = { groom: {...}, bride: {...}, hashtag: "#RickyFellinlove" } as const;
export const weddingDate = new Date("2026-12-26T11:00:00+07:00");
export const events = [{ id: "matrimony", time, venue, address, startsAt, endsAt }, ...] as const;
export const navLinks = [{ id: "couple" }, { id: "details" }, { id: "access" }, ...] as const;
```

**Kenapa `as const`?** Supaya `event.id` bertipe `"matrimony" | "reception"`, bukan `string`. Akibatnya pemetaan `t.details.events[event.id]` diperiksa TypeScript — salah ketik nama acara langsung gagal build, bukan menghasilkan `undefined` di layar.

**Kenapa tanggalnya ditulis dengan offset `+07:00` eksplisit?** Tanpa offset, JavaScript menafsirkannya sebagai waktu lokal mesin yang menjalankan. Hitung mundur akan menunjuk momen berbeda bagi tamu di zona waktu berbeda. Dengan offset eksplisit, satu momen yang sama untuk semua orang.

### `lib/i18n.ts` — kalimat acara

Berkas terbesar (385 baris) karena memuat dua kamus lengkap.

```ts
export type Lang = "en" | "id";

const en = { locale: "en-GB", nav: {...}, cover: {...}, errors: {...}, ... };  // TANPA as const
export type Dict = typeof en;
const id: Dict = { ... };                                                      // ← pengamannya
export const dictionaries: Record<Lang, Dict> = { en, id };

export const languageCodes: Record<Lang, string> = { en: "EN", id: "ID" };
export const languages: Lang[] = ["en", "id"];

export function pickLang(raw?: string): Lang {
  return raw === "id" ? "id" : "en";
}
```

Tiga hal yang harus bisa kamu jelaskan tanpa membuka berkasnya:

**1. Kenapa `en` ditulis tanpa `as const`?**
Dengan `as const`, tipe `nav.gallery` menjadi literal `"Gallery"` — dan kamus Indonesia akan **dipaksa** berisi teks `"Gallery"` juga. Mustahil diterjemahkan. Tanpa itu, tipenya `string`.

**2. Kenapa `const id: Dict`?**
Ini pengamannya. Satu kunci lupa diterjemahkan → `npm run typecheck` gagal. **Kelengkapan terjemahan dijamin compiler, bukan diperiksa manual.**

**3. Kenapa isinya hanya boleh string?**
Kamus melintas dari Server Component ke Client Component (`Rsvp`, `Wishes`, `Gallery`, …). Yang melintasi batas itu harus **serializable** — tidak boleh fungsi, `Date`, atau `Map`. Itu sebabnya teks berangka memakai penanda `"{n} menit lalu"` yang diganti di tempat pemakaiannya, bukan fungsi pemformat.

`pickLang` menerima apa pun dan selalu mengembalikan bahasa yang sah. `?lang=xx`, `?lang=`, atau tanpa `?lang` sama-sama menghasilkan `"en"` — tidak ada cara membuat halaman gagal lewat parameter ini.

`languageCodes` berisi `"EN"` dan `"ID"`. Itu **kode**, bukan kalimat — bunyinya sama di bahasa mana pun, jadi tidak diduakan di dalam kedua kamus.

### `lib/schemas.ts` — aturan validasi

```ts
type Messages = Dict["errors"];

export function rsvpSchema(m: Messages) {
  return z
    .object({
      guestName:  z.string().trim().min(2, m.nameMin).max(80, m.nameMax),
      attendance: z.enum(ATTENDANCE, { message: m.attendanceRequired }),
      guestCount: z.coerce.number().int(m.countInteger).min(0).max(10, m.countMax),
    })
    .refine((d) => d.attendance !== "ATTENDING" || d.guestCount >= 1,
            { message: m.countMinWhenAttending, path: ["guestCount"] });
}

export function wishSchema(m: Messages) { ... }
export function toFieldErrors(error: z.ZodError): Record<string, string>
```

**Kenapa berbentuk fungsi, bukan konstanta?** Supaya pesan errornya mengikuti bahasa tamu. Yang menjadi parameter **hanya pesannya** — aturannya (`min(2)`, `max(80)`) tetap ditulis satu kali. Kalau aturannya ikut bercabang per bahasa, klaim utama project langsung batal.

**Kenapa `z.coerce.number()`?** `<input type="number">` tetap mengirim **string** ke JavaScript. `z.coerce` mengubahnya menjadi angka sebelum divalidasi.

**Apa peran `.refine()`?** Aturan **lintas-field**: kalau hadir, jumlah orang minimal 1. Tidak bisa ditulis di dalam definisi `guestCount` saja karena bergantung pada nilai `attendance`. `path: ["guestCount"]` menentukan di bawah isian mana errornya muncul.

**`toFieldErrors`** mengubah `error.issues` milik Zod menjadi objek datar `{ guestName: "Nama minimal 2 karakter" }` supaya komponen form tinggal membaca `errors.guestName`. Kalau satu field punya dua error, yang pertama menang — itulah guna `if (!result[field])`.

### `lib/utils.ts` — fungsi murni

Tanpa efek samping, dan semuanya punya test.

| Fungsi | Tanda tangan | Yang penting diingat |
|---|---|---|
| `getTimeLeft` | `(target: Date, now = new Date()) => TimeLeft` | `now` sebagai **parameter**, bukan dibaca dari jam mesin — itu yang membuat test-nya bisa diulang |
| `pad` | `(n: number) => string` | `9 → "09"`, supaya lebar countdown tidak melompat tiap detik |
| `googleCalendarUrl` | `(event) => string` | Google minta format UTC tanpa pemisah: `20261226T040000Z` |
| `mapEmbedUrl` | `(query: string) => string` | `output=embed` — **tanpa API key** |
| `mapLinkUrl` | `(query: string) => string` | untuk dibuka di tab atau aplikasi Maps |
| `timeAgo` | `(date, now, t: Dict) => string` | menerima kamus **utuh** karena butuh `t.time.*` **dan** `t.locale` |
| `formatEventDate` | `(date, locale: string) => string` | `timeZone: "Asia/Jakarta"` dikunci |
| `invitationUrl` | `(guestName?, lang?) => string` | **absolut** — isinya dibaca kamera QR |
| `languageHref` | `(target: Lang, guestName?) => string` | **relatif** — tautan di dalam halaman |

**Dua fungsi terakhir sering ditanya karena isinya nyaris kembar.** Bedanya satu hal: `invitationUrl` menghasilkan `https://…/?to=Budi`, `languageHref` menghasilkan `/?to=Budi`. QR dipindai kamera ponsel yang tidak punya konteks halaman ini, jadi wajib absolut. Tautan bahasa hidup di dalam halaman, jadi relatif sudah cukup dan lebih pendek.

**Kenapa `lang=en` tidak pernah ditulis di URL?** Inggris adalah default; menuliskannya hanya menumpuk parameter yang tidak mengubah apa pun.

### `lib/prisma.ts` — koneksi database

```ts
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

**Kenapa disimpan di `globalThis`?** Di mode development Next memuat ulang modul setiap kali berkas berubah. Kalau `new PrismaClient()` dipanggil pada setiap pemuatan, jumlah koneksi ke Postgres terus bertambah sampai ditolak.

**Kenapa dibatasi ke non-production?** Di production modulnya hanya dimuat sekali, jadi triknya tidak diperlukan — dan mengotori `globalThis` tanpa alasan.

### `prisma/schema.prisma`

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")   // pooler :6543 — dipakai aplikasi saat berjalan
  directUrl = env("DIRECT_URL")     // langsung :5432 — dipakai prisma migrate saja
}

model Rsvp { id, guestName VarChar(80), attendance Attendance, guestCount Int, createdAt
             @@index([createdAt]) }

model Wish { id, name VarChar(80), message VarChar(500), createdAt
             @@index([createdAt(sort: Desc)]) }
```

**Kenapa dua URL?** Supabase menaruh PgBouncer di depan Postgres. PgBouncer **tidak mendukung prepared statement**, sedangkan `prisma migrate` membutuhkannya. Jadi aplikasi lewat pooler (aman untuk banyak koneksi serverless), migrasi lewat koneksi langsung.

**Kenapa indeks `Wish` memakai `sort: Desc`?** Daftar ucapan selalu diambil `orderBy: { createdAt: "desc" }`. Indeks yang urutannya searah membuat query tidak perlu mengurutkan ulang.

**Kenapa `guestCount` tetap ada meski tamu tidak hadir?** Nilainya dipaksa `0` oleh server. Menyimpan `0` lebih sederhana daripada kolom nullable yang harus dicek di setiap pemakaian.

### `app/api/rsvp/route.ts` dan `app/api/wishes/route.ts`

Keempat handler berbentuk **sama persis**, dan itu disengaja — sekali paham satu, paham semuanya.

```
try
  ├─ body   = await request.json().catch(() => null)
  ├─ parsed = schema(dictionaries.id.errors).safeParse(body)
  │            gagal → 400 { error, fieldErrors }
  ├─ prisma.<model>.create({ data: ... })
  └─ 201 { data }
catch
  └─ console.error(...) lalu 500 dengan pesan umum
```

**Kenapa `.catch(() => null)` pada `request.json()`?** Kalau body bukan JSON, `request.json()` **melempar**. Tanpa penangkap, jawabannya menjadi 500 — padahal itu kesalahan client, bukan server. Dengan `null`, `safeParse` pasti gagal dan jawabannya 400. Ada test-nya.

**Kenapa `guestCount` ditulis ulang di server?**

```ts
guestCount: parsed.data.attendance === "ATTENDING" ? parsed.data.guestCount : 0
```

Karena **server tidak percaya kiriman client.** Siapa pun bisa melewati browser dan mengirim `curl` berisi `NOT_ATTENDING` bersama `guestCount: 9`. Ada test yang mengunci perilaku ini, dan test itu sudah diuji balik dengan sengaja merusak kodenya.

**Kenapa respons 500 tidak menyertakan pesan aslinya?** `console.error` untuk pengembang; tamu cukup menerima kalimat umum. Pesan teknis database bisa membocorkan struktur tabel.

**Kenapa pesan error server tetap Bahasa Indonesia meski ada toggle bahasa?** Tamu tidak pernah melihatnya — browser memvalidasi lebih dulu dengan aturan yang sama dari berkas yang sama. Yang sampai ke server hanya kiriman yang **melewati** browser. Menambah field `lang` ke body POST demi jalur yang tidak pernah dilalui tamu berarti memperumit kontrak API tanpa ada yang diuntungkan.

### `components/Invitation.tsx` — pemegang state

| State | Untuk |
|---|---|
| `opened` | sampul sudah dibuka atau belum |
| `playing` | musik sedang berbunyi |
| `musicAvailable` | berkas audio berhasil dimuat |

Ketiganya lahir dari **satu klik yang sama**, jadi dikumpulkan di satu tempat.

```ts
const handleOpen = () => {
  startMusic();          // ← DI SINI, bukan di useEffect
  setOpened(true);
  requestAnimationFrame(() => {
    document.getElementById("welcoming")?.scrollIntoView({ behavior: "smooth" });
  });
};
```

**Kenapa `play()` dipanggil langsung di handler klik?** Browser hanya mengizinkan audio berbunyi sebagai buah **gestur pengguna asli**. Kalau ditunda ke `useEffect`, sebagian browser (Safari terutama) sudah tidak menganggapnya bagian dari klik tadi dan menolaknya dengan `NotAllowedError`. Ini juga alasan elemen `<audio>` tinggal di berkas ini, bukan di `MusicToggle`.

**Kenapa `requestAnimationFrame` sebelum scroll?** Memberi satu frame agar kunci scroll benar-benar lepas sebelum halaman diminta meluncur. Tanpa itu, perintah scroll datang saat `overflow: hidden` masih aktif dan tidak terjadi apa-apa.

**Kenapa `preload="none"` pada `<audio>`?** Berkasnya 4,4 MB — tujuh kali lipat seluruh foto undangan digabung (612 KB). Dengan `"auto"`, tamu mengunduhnya begitu halaman dibuka padahal belum tentu melanjutkan.

`MusicToggle` disembunyikan sepenuhnya kalau `musicAvailable` bernilai `false`. Lebih baik tidak ada tombol daripada tombol yang ditekan tapi diam.

### Komponen `ui/` yang perlu dijelaskan

**`Reveal.tsx`** — memunculkan isinya perlahan saat masuk layar, memakai `IntersectionObserver` bawaan browser. Setelah muncul sekali, `observer.disconnect()` dipanggil supaya tidak ada pekerjaan sia-sia saat tamu menggulir naik-turun. `threshold: 0.15` menunggu 15% elemen terlihat, agar animasi tidak terpicu saat elemen baru menyembul sedikit di tepi layar. **Ini alasan project tidak memakai Framer Motion** — kebutuhannya cuma ini, dan versi manualnya 63 baris.

**`Button.tsx`** — satu komponen yang bisa menjadi `<button>` **atau** tautan. Kalau prop `href` diisi, ia merender `<Link>`; kalau tidak, `<button>`. Tipenya memakai *discriminated union* sehingga TypeScript menolak `onClick` pada varian tautan. Prop `external` menambahkan `target="_blank"` dan `rel="noreferrer"`.

**`Field.tsx`** — pembungkus satu baris form: label, isian, hint, error. Isiannya dikirim sebagai `children`, jadi satu komponen melayani `input`, `select`, dan `textarea`. Bagian aksesibilitasnya: `htmlFor` menghubungkan label ke isian, dan `role="alert"` pada pesan error membuatnya langsung dibacakan begitu muncul.

**`Section.tsx`** — jarak dan lebar baca seragam untuk semua section. Lebar dikunci `max-w-[30rem]`: di tablet undangan tetap tampil sebagai kolom ramping, karena baris teks yang terlalu panjang tidak nyaman dibaca.

**`LanguageToggle.tsx`** — dua segmen `EN | ID`. Yang aktif adalah `<span aria-current="true">`, **bukan** tautan: menautkannya ke halaman yang sedang dibuka hanya memberi tamu sesuatu untuk diklik yang tidak mengubah apa pun. Yang tidak aktif adalah `<Link scroll={false}>`.

**`Lightbox.tsx`** — penampil foto layar penuh. Dirender hanya saat `index` bukan `null`, jadi induknya cukup menyimpan satu state. Menangani `Escape`, panah kiri, dan panah kanan.

**`NavDrawer.tsx`** — memakai atribut `inert` saat tertutup, sehingga isinya tidak bisa dijangkau `Tab` maupun pembaca layar walaupun elemennya masih ada di DOM.

---

## 5. Tujuh mekanisme yang paling mungkin ditanya

### 5.1 Validasi dua kali dengan satu sumber aturan

```
Tamu klik Kirim
  └─► Rsvp.tsx: rsvpSchema(t.errors).safeParse(form)      ← validasi di BROWSER
        gagal  → tampilkan error per field, NOL request ke server
        lolos  → fetch("/api/rsvp", { method: "POST", body: JSON })
                   └─► app/api/rsvp/route.ts               ← ini SERVER, bukan browser
                         rsvpSchema(dictionaries.id.errors).safeParse(body)
                           gagal → 400 { error, fieldErrors }
                           lolos → prisma.rsvp.create(...)
                                     └─► Postgres di Supabase
                                   201 { data }
        └─► setState → React render ulang → pesan sukses
```

**Kenapa divalidasi dua kali?** Yang di browser untuk kenyamanan — tamu langsung tahu salahnya tanpa menunggu jaringan. Yang di server untuk keamanan — siapa pun bisa melewati browser dan mengirim POST langsung.

**Kenapa itu bukan duplikasi?** Aturannya hanya ditulis **sekali** di `lib/schemas.ts`. Yang terjadi dua kali adalah pemanggilannya, bukan definisinya. Keduanya mustahil berselisih.

**Bukti yang bisa kamu tunjukkan langsung:**

```bash
curl -s -X POST https://invitato-wedding-invitation-navy.vercel.app/api/rsvp \
  -H "Content-Type: application/json" \
  -d '{"guestName":"Uji","attendance":"NOT_ATTENDING","guestCount":9}'
# 201, tetapi guestCount tersimpan 0 — bukan 9
```

### 5.2 Kenapa Route Handler dihitung "backend API"

`app/api/*/route.ts` berjalan di Node **di server**, memegang koneksi Prisma, dan **tidak pernah ikut terbundel ke JavaScript browser**. Batasnya tegas: kredensial database tidak pernah sampai ke tamu.

Bukti di output `next build`: kedua route terdaftar sebagai **ƒ (Dynamic)** — dirender saat diminta, bukan disiapkan saat build.

### 5.3 Bahasa disimpan di URL, bukan di state

`?lang=id` dibaca `page.tsx`, dipakai memilih satu kamus, lalu diteruskan sebagai prop biasa. Empat akibat langsungnya:

1. **Section tetap Server Component.** Kalau bahasa disimpan sebagai state client, setiap section harus menjadi Client Component untuk bisa membacanya.
2. **Tombolnya cuma tautan.** Tidak ada state yang perlu diurus.
3. **Pilihan bahasa ikut terbawa** saat tautan dibagikan, dan bisa di-bookmark.
4. **Tidak perlu Context.** Prop drilling-nya hanya dua tingkat, dan hanya karena `Cover` serta `NavDrawer` memang dirender oleh `Invitation`.

Tiga alternatif yang ditolak beserta alasannya ada di `README.md` bagian 6.

### 5.4 Gerbang sampul: kunci scroll **dan** posisi

```ts
useEffect(() => {
  history.scrollRestoration = "manual";
  document.body.classList.toggle("scroll-locked", !opened);
  if (!opened) window.scrollTo({ top: 0, behavior: "instant" });
  return () => document.body.classList.remove("scroll-locked");
}, [opened]);
```

`.scroll-locked` isinya `overflow: hidden`.

**Kenapa ada `history.scrollRestoration = "manual"`?** Ini perbaikan sebuah bug nyata. Tamu yang membuka undangan, menggulir ke tengah, lalu me-*refresh* akan **terjebak**: `opened` selalu mulai dari `false`, browser memulihkan posisi scroll terakhir, dan `overflow: hidden` **membekukan** posisi itu alih-alih mengembalikannya. Akibatnya halaman tidak bisa digulir dan tombol "Open Invitation" berada di luar layar — tidak ada jalan keluar selain menutup tab.

**Kenapa `window.scrollTo` saja tidak cukup?** Karena **pemulihan scroll browser berjalan setelah effect React**, jadi hasilnya langsung ditimpa. Ini terukur: posisi tetap 5002 padahal `scrollTo` sudah dipanggil. Baris `scrollTo` tetap dipertahankan karena menegakkan aturan yang sama untuk sebab lain apa pun yang membuat halaman ter-*mount* dalam keadaan tergulir.

**Kenapa `behavior: "instant"`?** `globals.css` memasang `scroll-behavior: smooth`. Gulir beranimasi dari tengah halaman bisa terputus di tengah jalan.

**Kenapa ini tidak merusak toggle bahasa?** Berpindah bahasa adalah navigasi dalam aplikasi yang diurus router Next, bukan pemulihan bawaan browser. Sudah diuji: geser 0px.

### 5.5 QR digambar sendiri sebagai satu `<path>`

```ts
function qrPath(text: string): { d: string; size: number } {
  const qr = qrcode(0, "M");
  qr.addData(text);
  qr.make();

  const size = qr.getModuleCount();
  let d = "";
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (qr.isDark(row, col)) d += `M${col} ${row}h1v1h-1z`;
    }
  }
  return { d, size };
}
```

Library-nya hanya ditanya **"kotak di baris ini kolom ini gelap atau tidak"**. Gambarnya disusun sendiri.

**Kenapa tidak memakai library yang langsung menghasilkan SVG?** Dua alasan: tidak perlu `dangerouslySetInnerHTML`, dan satu `<path>` jauh lebih ringan daripada ratusan `<rect>` terpisah — QR 37×37 berarti sampai 1.369 elemen.

**Arti `M{col} {row}h1v1h-1z`:** pindah ke koordinat modul, garis 1 ke kanan, 1 ke bawah, 1 ke kiri, tutup. Satu kotak. `viewBox` yang mengatur skalanya, jadi angkanya cukup 0–36.

**Kenapa `shapeRendering="crispEdges"`?** Mematikan penghalusan tepi. Tanpa itu kotak-kotak QR jadi buram di ukuran kecil dan gagal dipindai.

**Kenapa librarinya tidak sampai ke browser?** `AccessCard` adalah Server Component. Sudah diperiksa: kata `qrcode` dan `isDark` tidak muncul di satu berkas pun dalam `.next/static/chunks`.

### 5.6 Delapan Client Component dan alasannya

| Berkas | Alasan |
|---|---|
| `Invitation.tsx` | `useState` untuk `opened`, `playing`, `musicAvailable` |
| `Countdown.tsx` | `setInterval` yang berdetak tiap detik |
| `Gallery.tsx` | `useState` untuk foto mana yang dibuka |
| `Rsvp.tsx` | state form + `fetch` |
| `Wishes.tsx` | state form + `fetch` + daftar ucapan |
| `Lightbox.tsx` | listener papan ketik (Escape, panah) |
| `NavDrawer.tsx` | `useState` untuk buka/tutup + listener Escape |
| `Reveal.tsx` | `IntersectionObserver` |

Kalau ditanya *"kenapa tidak semuanya client saja?"*: karena setiap Client Component ikut terunduh sebagai JavaScript. Sepuluh section undangan tidak punya state sama sekali — menjadikannya client berarti membebankan kode yang tidak pernah melakukan apa pun ke perangkat tamu.

### 5.7 Tiga tempat state, dan kenapa cuma segitu

| Tempat | State | Kenapa di situ |
|---|---|---|
| `Invitation.tsx` | `opened`, `playing`, `musicAvailable` | lahir dari satu klik yang sama |
| `Gallery.tsx` | `openIndex` | hanya galeri yang peduli |
| `NavDrawer.tsx` | `open` | hanya menu yang peduli |
| `Rsvp.tsx` / `Wishes.tsx` | isian form + status kirim | milik masing-masing form |

**Tidak ada satu pun yang dibaca komponen lain.** Itulah alasan konkret project ini tidak butuh Context atau state manager.

Bahasa sengaja **tidak** masuk daftar ini — ia tinggal di URL, sehingga penambahan fitur i18n tidak menambah satu pun state lintas komponen.

---

## 6. Bank pertanyaan interview

### Tentang arsitektur

**"Kenapa Next.js, bukan React + Express terpisah?"**
Satu repo, satu deploy, satu bahasa. Route Handler sudah memenuhi kebutuhan "backend API + database" pada PRD. Waktu yang hemat dipakai mengerjakan fitur, bukan mengurus dua project.

**"Apa bedanya Server Component dan Client Component di project ini?"**
Server Component dirender di server dan hasilnya dikirim sebagai HTML — kodenya tidak pernah diunduh browser. Client Component ikut terunduh karena butuh interaktivitas. Di sini 8 berkas memakai `"use client"`, dan seluruh section undangan tidak termasuk.

**"Kenapa tidak pakai state manager?"**
Tunjukkan tabel 5.7. Tidak ada state yang perlu dibaca komponen yang berjauhan. Menambahkan Context berarti menambah konsep tanpa menyelesaikan masalah yang ada.

**"Bagaimana kalau datanya bertambah banyak?"**
`GET /api/wishes` mengambil 100 terbaru dengan `take: MAX_WISHES`. Untuk skala undangan pernikahan itu memadai. Kalau perlu lebih, langkah berikutnya pagination — dan itu ditolak sekarang karena konsep cursor butuh penjelasan panjang untuk manfaat yang belum dibutuhkan.

### Tentang data dan keamanan

**"Bagaimana kamu memastikan data yang masuk valid?"**
Jelaskan alur 5.1. Tekankan: aturannya satu, pemanggilannya dua.

**"Apa yang terjadi kalau ada yang mengirim data lewat curl?"**
Server memvalidasi ulang dan menulis ulang `guestCount`. Bisa didemokan langsung dengan perintah di 5.1.

**"Kenapa kredensial database aman?"**
Route Handler berjalan di server dan tidak pernah terbundel ke browser. `.env` diabaikan `.gitignore` dan `.vercelignore`; yang ter-commit hanya `.env.example` berisi placeholder. Sebelum repo dipublikasikan, password dicari di seluruh file terlacak **dan seluruh riwayat commit** — nihil.

### Tentang kualitas

**"Test-nya menguji apa?"**
54 test di 4 berkas, tidak satu pun menyentuh database. Yang paling bernilai: test schema (bernilai ganda karena dipakai browser dan server) dan test route handler yang memakai `vi.mock` untuk memeriksa **apa yang hendak disimpan server**.

**"Bagaimana kamu tahu test-nya benar-benar bisa gagal?"**
Test kuncinya sudah diuji balik dengan sengaja merusak kode: `guestCount: attendance === "ATTENDING" ? guestCount : 0` diubah menjadi `guestCount`. Test gagal dengan pesan `expected 9 to be +0`, lalu kodenya dikembalikan. Test yang tidak pernah bisa gagal tidak membuktikan apa pun.

**"Aksesibilitasnya bagaimana?"**
Diukur, bukan dikira: kontras 0 dari 37 elemen gagal pada section berlatar solid; setiap isian form punya `label`, `aria-invalid`, dan `aria-describedby`; nav drawer memakai `inert`; `prefers-reduced-motion` mematikan seluruh transisi.

### Pertanyaan yang lebih dalam

**"Apa keputusan tersulit di project ini?"**
Menurunkan Prisma dari 7 ke 6. Prisma 7 mewajibkan `prisma.config.ts`, driver adapter, dan folder client hasil generate — tiga konsep tambahan sebelum satu baris fitur pun ditulis, dan build gagal dengan `P1012`. Prisma 6 memakai pola yang ada di semua tutorial. Versi yang lebih mudah dijelaskan menang.

**"Apa yang akan kamu perbaiki kalau punya waktu lebih?"**
Jawaban jujur: tampilan kartu Access Card belum pernah diperiksa mata manusia karena keterbatasan alat, dan terjemahan Bahasa Indonesia perlu dibaca ulang penutur asli — khususnya kutipan Kidung Agung 5:2, yang versi Inggrisnya memakai The Message sedangkan versi Indonesianya lebih dekat ke Terjemahan Baru.

**"Bagian mana yang dikerjakan AI?"**
Hampir seluruh baris kode. Yang membedakan bukan berapa banyak, melainkan lima kali saran AI **ditolak** karena pengukuran berkata lain — daftarnya ada di `README.md` bagian 10.

---

## 7. Angka yang sebaiknya hafal

| | |
|---|---|
| Baris kode | 3.816 TypeScript/TSX di 36 berkas |
| Test | 54, 4 berkas, ±1 detik, nol sentuhan database |
| Client Component | 8 |
| Section undangan | 10, semuanya Server Component |
| Optimasi gambar | 18,56 MB → 612 KB (turun 97%) |
| Berkas musik | 4,4 MB, `preload="none"` |
| Gambar pratinjau | 1200×630, 69 KB |
| QR | 37×37 modul, satu `<path>` |
| Bahasa | 2, dipilih lewat `?lang=` |
| Endpoint | 4 (`POST`/`GET` × rsvp/wishes) |
| Batas validasi | nama 2–80 · jumlah orang 1–10 · pesan 3–500 |
| Tanggal acara | Sabtu, 26 Desember 2026, `+07:00` |
| Port database | 6543 (pooler, aplikasi) · 5432 (langsung, migrate) |

---

## Kalau hanya sempat membaca satu bagian

Baca **5.1** (validasi dua kali dengan satu sumber aturan). Itu klaim teknis terkuat di project ini, bisa didemokan langsung dengan satu perintah `curl`, dan menyentuh hampir semua berkas penting sekaligus: `schemas.ts`, kedua route handler, kedua komponen form, dan modelnya di Prisma.
