# Toggle Bahasa EN/ID dan Access Card — Rencana Implementasi

> **Untuk pekerja agentik:** SUB-SKILL WAJIB: pakai superpowers:subagent-driven-development (disarankan) atau superpowers:executing-plans untuk mengerjakan rencana ini task demi task. Langkahnya memakai checkbox (`- [ ]`) untuk penanda.

**Goal:** Tamu bisa membaca seluruh undangan dalam Bahasa Inggris atau Indonesia lewat `?lang=`, dan ada satu section Access Card berisi kartu bernama tamu dengan QR dekoratif.

**Architecture:** Bahasa disimpan di URL, bukan di state — `page.tsx` membaca `?lang`, memilih satu kamus dari `lib/i18n.ts`, lalu meneruskannya sebagai prop biasa. Tidak ada Context dan tidak ada state manager, jadi seluruh section tetap Server Component. Toggle-nya hanyalah tautan ke URL yang sama dengan `lang` dibalik.

**Tech Stack:** Next.js 16.3.4 (App Router, Turbopack) · React 19 · TypeScript 5 strict · Tailwind 4 · Zod 4 · Vitest 4 · `qrcode-generator`

**Spec:** `docs/superpowers/specs/2026-09-05-i18n-dan-access-card-design.md`

## Global Constraints

Berlaku untuk **semua** task di bawah:

- **Aturan utama project:** kode harus bisa dijelaskan junior programmer dalam dua kalimat. Solusi lebih canggih yang butuh penjelasan panjang ditolak.
- **Dilarang menambah:** React Hook Form, Framer Motion, Context/state manager, optimistic update, cursor pagination, Prisma 7+. Alasannya ada di `CLAUDE.md` §2.
- **Kamus wajib serializable.** Kamus diteruskan dari Server Component ke Client Component (`Invitation`, `Rsvp`, `Wishes`, `Gallery`, `Countdown`, `NavDrawer`). **Isinya hanya boleh string** — tidak boleh ada fungsi, `Date`, atau `Map`. Teks yang butuh angka memakai placeholder `{n}` lalu di-`replace` di pemakainya.
- **Bahasa default Inggris.** `?lang` bernilai apa pun selain `"id"` menghasilkan Inggris. Tidak ada jalan membuat halaman gagal lewat parameter ini.
- **Section tetap Server Component.** Hanya 7 berkas yang boleh punya `"use client"`: `Invitation`, `Countdown`, `Gallery`, `Rsvp`, `Wishes`, `Reveal`, `Lightbox`, `NavDrawer`. Jangan menambah yang kedelapan.
- **Setiap task berakhir hijau:** `npm run typecheck` 0 error, `npm run lint` 0 error, `npm run test` lolos semua.
- **Komentar menjelaskan _kenapa_**, bukan mengulang apa yang sudah jelas dari kode.
- **Jangan jalankan `git push`.** Deploy production ditangani di Task 9 setelah semua verifikasi selesai.

---

### Task 1: Spike — apakah state `opened` bertahan saat bahasa berganti?

Tugas ini **tidak menghasilkan kode produksi.** Keluarannya satu keputusan yang menentukan Task 3.

Latar belakang: berpindah bahasa memicu navigasi karena bahasanya ada di URL. Kalau state `opened` di `components/Invitation.tsx` ikut ter-reset, tamu terlempar kembali ke halaman sampul di tengah membaca. Project ini punya riwayat salah menuduh berdasarkan dugaan (`Reveal` dan `NavDrawer` dua kali disangka rusak padahal tidak), jadi ini diukur, bukan ditebak.

**Files:**
- Sementara: `app/page.tsx` (dikembalikan dengan `git checkout` di akhir task)

**Interfaces:**
- Consumes: —
- Produces: keputusan tertulis "opened BERTAHAN" atau "opened TER-RESET", dipakai Task 3

- [ ] **Step 1: Tambahkan tautan uji sementara di `app/page.tsx`**

Sisipkan tepat sebelum `</Invitation>`, hanya untuk pengukuran:

```tsx
{/* SEMENTARA — dihapus di akhir Task 1 */}
<a id="probe" href="?probe=1" data-testid="probe">probe</a>
```

- [ ] **Step 2: Jalankan dev server**

Run: `npm run dev`
Buka `http://localhost:3000`.

- [ ] **Step 3: Ukur lewat console browser**

Klik "Open Invitation" secara manual (klik asli, bukan otomatis), lalu di console:

```js
// buktikan undangan benar-benar terbuka: scroll tidak lagi terkunci
document.body.classList.contains("scroll-locked")   // harus false
document.getElementById("probe").click();
// tunggu 1 detik, lalu:
document.body.classList.contains("scroll-locked")   // false = opened BERTAHAN
```

Kalau `scroll-locked` kembali `true`, artinya `Invitation` ter-mount ulang dan `opened` kembali `false`.

Catatan lingkungan (dari `CLAUDE.md` §9): jangan menilai dari tangkapan layar — tab otomatis di mesin ini tidak di-composite dan sering menampilkan frame basi. Selalu baca lewat `getComputedStyle` / properti DOM.

- [ ] **Step 4: Catat hasilnya**

Tulis satu baris hasil pengukuran di deskripsi Task 3 pada berkas rencana ini, supaya keputusannya tercatat, bukan diingat.

- [ ] **Step 5: Bersihkan**

```bash
git checkout -- app/page.tsx
git status --short   # harus kosong
```

Tidak ada commit pada task ini.

---

### Task 2: Fondasi i18n dan `?lang` yang jalan ujung ke ujung

Setelah task ini, `?lang=id` sudah benar-benar mengganti sesuatu yang terlihat (label nav drawer) — bukan sekadar berkas baru yang belum dipakai.

**Files:**
- Create: `lib/i18n.ts`
- Create: `tests/i18n.test.ts`
- Modify: `app/page.tsx`
- Modify: `components/InvitationShell.tsx`
- Modify: `components/Invitation.tsx`
- Modify: `components/ui/NavDrawer.tsx`
- Modify: `lib/config.ts`

**Interfaces:**
- Consumes: —
- Produces:
  - `export type Lang = "en" | "id"`
  - `export type Dict = typeof en`
  - `export const dictionaries: Record<Lang, Dict>`
  - `export function pickLang(raw?: string): Lang`
  - `page.tsx` meneruskan prop `t: Dict` dan `lang: Lang`

- [ ] **Step 1: Tulis test yang gagal**

Buat `tests/i18n.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { pickLang, dictionaries } from "@/lib/i18n";

describe("pickLang", () => {
  it("mengembalikan id hanya untuk nilai persis 'id'", () => {
    expect(pickLang("id")).toBe("id");
  });

  it("jatuh ke en untuk nilai lain apa pun", () => {
    expect(pickLang("en")).toBe("en");
    expect(pickLang("xx")).toBe("en");
    expect(pickLang("ID")).toBe("en");
    expect(pickLang("")).toBe("en");
    expect(pickLang(undefined)).toBe("en");
  });
});

describe("kamus", () => {
  it("kedua bahasa punya struktur kunci yang sama persis", () => {
    // TypeScript sudah menjamin ini, tapi tidak menjamin panjang array —
    // alt galeri yang kurang satu lolos dari tsc dan tertangkap di sini.
    const keys = (o: unknown, prefix = ""): string[] =>
      typeof o === "object" && o !== null && !Array.isArray(o)
        ? Object.entries(o).flatMap(([k, v]) => keys(v, `${prefix}${k}.`))
        : Array.isArray(o)
          ? [`${prefix}[${o.length}]`]
          : [prefix];

    expect(keys(dictionaries.id)).toEqual(keys(dictionaries.en));
  });

  it("tidak ada nilai kosong di kedua kamus", () => {
    const empties = (o: unknown, path = ""): string[] =>
      typeof o === "string"
        ? o.trim() === "" ? [path] : []
        : typeof o === "object" && o !== null
          ? Object.entries(o).flatMap(([k, v]) => empties(v, `${path}${k}.`))
          : [];

    expect(empties(dictionaries.en)).toEqual([]);
    expect(empties(dictionaries.id)).toEqual([]);
  });
});
```

- [ ] **Step 2: Jalankan test, pastikan GAGAL**

Run: `npm run test -- tests/i18n.test.ts`
Expected: FAIL — `Failed to resolve import "@/lib/i18n"`.

- [ ] **Step 3: Buat `lib/i18n.ts`**

```ts
/**
 * Semua kalimat yang dilihat tamu, dalam dua bahasa.
 *
 * `lib/config.ts` menyimpan FAKTA acara (tanggal, alamat, foto) yang sama
 * di bahasa mana pun. Berkas ini menyimpan KALIMAT-nya.
 *
 * Kamus ini diteruskan dari Server Component ke Client Component, jadi
 * isinya hanya boleh string — tidak boleh fungsi atau Date. Teks yang
 * memuat angka memakai penanda {n} yang diganti di tempat pemakaiannya.
 */

export type Lang = "en" | "id";

const en = {
  /** Kode locale untuk toLocaleDateString. Lihat lib/utils.ts. */
  locale: "en-GB",

  nav: {
    menu: "Invitation menu",
    open: "Open menu",
    close: "Close menu",
    couple: "Groom & Bride",
    details: "Wedding Details",
    access: "Access Card",
    gallery: "Gallery",
    rsvp: "RSVP",
    wishes: "Kind Words",
  },

  language: {
    label: "Language",
    /** Nama bahasa yang SEDANG TIDAK dipakai — jadi teks tombolnya. */
    other: "Bahasa Indonesia",
  },
};

/**
 * Bentuk kamus diambil dari versi Inggris. `en` sengaja ditulis TANPA
 * `as const`: dengan `as const`, tipe tiap nilai menjadi literal dan
 * kamus Indonesia akan dipaksa berisi string yang sama persis.
 */
export type Dict = typeof en;

/**
 * Anotasi `: Dict` di sini adalah pengamannya. Kalau ada satu kunci saja
 * yang lupa diterjemahkan, `npm run typecheck` gagal — kelengkapan
 * terjemahan dijamin compiler, bukan pemeriksaan manual.
 */
const id: Dict = {
  locale: "id-ID",

  nav: {
    menu: "Menu undangan",
    open: "Buka menu",
    close: "Tutup menu",
    couple: "Mempelai",
    details: "Detail Acara",
    access: "Kartu Undangan",
    gallery: "Galeri",
    rsvp: "Konfirmasi",
    wishes: "Ucapan & Doa",
  },

  language: {
    label: "Bahasa",
    other: "English",
  },
};

export const dictionaries: Record<Lang, Dict> = { en, id };

/** Apa pun selain "id" dianggap Inggris, termasuk nilai kosong dan aneh. */
export function pickLang(raw?: string): Lang {
  return raw === "id" ? "id" : "en";
}
```

- [ ] **Step 4: Jalankan test, pastikan LOLOS**

Run: `npm run test -- tests/i18n.test.ts`
Expected: PASS, 4 test.

- [ ] **Step 5: Buang `label` dari `navLinks` di `lib/config.ts`**

Label pindah ke kamus; config hanya menyimpan id dan urutannya. Ganti blok `navLinks` menjadi:

```ts
/**
 * Tautan nav drawer. Urutannya mengikuti urutan section.
 * Labelnya ada di `lib/i18n.ts` (`nav`) karena ikut berganti bahasa.
 */
export const navLinks = [
  { id: "couple" },
  { id: "details" },
  { id: "gallery" },
  { id: "rsvp" },
  { id: "wishes" },
] as const;
```

Entri `access` belum ditambahkan di sini — itu bagian Task 8, bersamaan dengan section-nya.

- [ ] **Step 6: Baca `?lang` di `app/page.tsx`**

Ubah tipe `searchParams` dan ambil bahasanya:

```tsx
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ to?: string; lang?: string }>;
}) {
  const { to, lang: rawLang } = await searchParams;
  const lang = pickLang(rawLang);
  const t = dictionaries[lang];
  const guestName = to?.trim() || undefined;

  return (
    <InvitationShell t={t} lang={lang}>
      <Invitation t={t} guestName={guestName}>
        ...
```

Tambahkan `import { dictionaries, pickLang } from "@/lib/i18n";`.

- [ ] **Step 7: Terima prop di `InvitationShell`, pasang atribut bahasa**

Tambahkan prop `t: Dict` dan `lang: Lang`, lalu pasang `lang` pada `<main>`:

```tsx
<main lang={lang} className="w-full bg-mist lg:w-[32rem] lg:shrink-0 lg:shadow-2xl lg:shadow-charcoal/20">
```

`<html lang="en">` di `app/layout.tsx` **tidak diubah** — layout tidak menerima `searchParams`. Pembaca layar memakai atribut `lang` terdekat, jadi `<main>` sudah benar.

`DesktopPanel` untuk sementara belum memakai `t` (ayatnya dipindahkan di Task 4); teruskan `t` ke sana sekarang supaya tanda tangannya sudah final.

- [ ] **Step 8: Teruskan `t` lewat `Invitation` ke `NavDrawer`**

`components/Invitation.tsx` menambah prop `t: Dict` dan meneruskannya: `<NavDrawer t={t} />`. `Cover` menyusul di Task 3.

- [ ] **Step 9: Pakai kamus di `NavDrawer`**

Ganti `aria-label` yang di-hardcode dan label tautan:

- `aria-label="Buka menu"` → `{t.nav.open}`
- `aria-label="Tutup menu"` → `{t.nav.close}`
- `aria-label="Menu undangan"` → `{t.nav.menu}`
- teks tiap tautan: `{t.nav[link.id]}`

- [ ] **Step 10: Verifikasi hijau lalu commit**

```bash
npm run typecheck && npm run lint && npm run test && npm run build
git add lib/i18n.ts tests/i18n.test.ts lib/config.ts app/page.tsx components/InvitationShell.tsx components/Invitation.tsx components/ui/NavDrawer.tsx
git commit -m "feat(i18n): kamus dua bahasa dan pembacaan ?lang"
```

---

### Task 3: Toggle bahasa dan halaman sampul

**Hasil pengukuran Task 1 (5 Sep 2026): `opened` BERTAHAN.** Diukur di dev server
dengan `next/link` (soft navigation), bukan `<a>` — probe versi `<a>` di rencana awal
akan memicu full reload dan memberi jawaban salah yang meyakinkan.

Bukti berantai: terkunci sebelum dibuka (`true`) → terbuka setelah klik (`false`) →
URL benar-benar berubah jadi `?probe=1` → **masih terbuka** sesudahnya, dan penanda
`window` bertahan sehingga terbukti bukan reload. Posisi scroll juga diukur terpisah:
**selisih 0px** dari 2500px berkat `scroll={false}`.

**Keputusan: toggle dipasang di halaman sampul DAN nav drawer. Step 5 dikerjakan.**

- Kalau **BERTAHAN** → pasang toggle di halaman sampul **dan** di nav drawer.
- Kalau **TER-RESET** → pasang **hanya di halaman sampul**, dan lewati Step 5.

**Files:**
- Create: `components/ui/LanguageToggle.tsx`
- Modify: `components/sections/Cover.tsx`
- Modify: `components/Invitation.tsx`
- Modify: `components/ui/NavDrawer.tsx` (hanya kalau `opened` bertahan)
- Modify: `lib/i18n.ts`

**Interfaces:**
- Consumes: `Dict`, `Lang` dari Task 2
- Produces: `<LanguageToggle lang guestName t className? />`

- [ ] **Step 1: Tambahkan kunci `cover` ke kedua kamus**

Di `lib/i18n.ts`, tambahkan ke `en`:

```ts
  cover: {
    theWeddingOf: "The Wedding Of",
    dear: "Dear Mr/Mrs/Ms,",
    open: "Open Invitation",
  },
```

dan ke `id`:

```ts
  cover: {
    theWeddingOf: "Pernikahan",
    dear: "Kepada Bapak/Ibu/Saudara,",
    open: "Buka Undangan",
  },
```

- [ ] **Step 2: Buat `components/ui/LanguageToggle.tsx`**

```tsx
import Link from "next/link";
import type { Dict, Lang } from "@/lib/i18n";

/**
 * Tombol ganti bahasa. Ini hanya sebuah tautan: bahasa disimpan di URL,
 * bukan di state, jadi tidak ada yang perlu diingat komponen ini.
 *
 * `scroll={false}` supaya tamu tidak terlempar ke atas halaman saat
 * berpindah bahasa di tengah membaca.
 */
export default function LanguageToggle({
  lang,
  guestName,
  t,
  className = "",
}: {
  lang: Lang;
  guestName?: string;
  t: Dict;
  className?: string;
}) {
  const params = new URLSearchParams();
  if (guestName) params.set("to", guestName);
  // Bahasa Inggris adalah default, jadi tidak perlu ditulis di URL.
  if (lang === "en") params.set("lang", "id");

  const href = params.size > 0 ? `/?${params}` : "/";

  return (
    <Link
      href={href}
      scroll={false}
      hrefLang={lang === "en" ? "id" : "en"}
      className={className}
    >
      {t.language.other}
    </Link>
  );
}
```

- [ ] **Step 3: Pakai kamus dan toggle di `Cover.tsx`**

Tambahkan prop `t: Dict`, `lang: Lang`, ganti tiga teks yang di-hardcode dengan `t.cover.*`, lalu pasang toggle di bawah tombol:

```tsx
<LanguageToggle
  lang={lang}
  guestName={guestName}
  t={t}
  className="mt-6 font-ui text-[0.65rem] tracking-[0.2em] text-cream/80 uppercase underline underline-offset-4 hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream"
/>
```

- [ ] **Step 4: Teruskan `lang` lewat `Invitation`**

`Invitation` menambah prop `lang: Lang` dan meneruskannya ke `Cover`.

- [ ] **Step 5: Toggle di nav drawer** — _hanya kalau Task 1 menunjukkan `opened` bertahan_

Tambahkan satu baris di bagian bawah daftar tautan:

```tsx
<p className="mt-10 font-ui text-[0.6rem] tracking-[0.25em] text-cream/60 uppercase">
  {t.language.label}
</p>
<LanguageToggle lang={lang} guestName={guestName} t={t} className="..." />
```

`NavDrawer` perlu prop `lang` dan `guestName`; teruskan keduanya dari `Invitation`.

- [ ] **Step 6: Verifikasi di browser**

Run: `npm run dev`, lalu buka:

- `/` → tombol berbunyi "Bahasa Indonesia"
- `/?lang=id` → seluruh nav dan sampul Bahasa Indonesia, tombol berbunyi "English"
- `/?to=Budi&lang=id` → nama Budi tetap tersapa, dan tombol menuju `/?to=Budi`
- `/?lang=xx` → Inggris, tidak error

- [ ] **Step 7: Verifikasi hijau lalu commit**

```bash
npm run typecheck && npm run lint && npm run test && npm run build
git add components/ui/LanguageToggle.tsx components/sections/Cover.tsx components/Invitation.tsx components/ui/NavDrawer.tsx lib/i18n.ts
git commit -m "feat(i18n): tombol ganti bahasa dan halaman sampul dua bahasa"
```

---

### Task 4: Welcoming, CoupleProfile, Countdown, dan ayat panel desktop

**Files:**
- Modify: `lib/i18n.ts`, `lib/config.ts`
- Modify: `components/sections/Welcoming.tsx`, `CoupleProfile.tsx`, `Countdown.tsx`
- Modify: `components/InvitationShell.tsx`

**Interfaces:**
- Consumes: `Dict` dari Task 2
- Produces: kunci `welcoming`, `couple`, `countdown`, `verse` di kamus

- [ ] **Step 1: Pindahkan prosa dari `lib/config.ts`**

Hapus dari `config.ts`: `verse` (seluruhnya), dan `role` pada `couple.groom` dan `couple.bride`. Sisanya di `couple` tidak berubah.

- [ ] **Step 2: Tambahkan kunci ke kedua kamus**

`en`:

```ts
  verse: {
    text:
      "I was sound asleep, but in my dreams I was wide awake. " +
      "Oh, listen! It's the sound of my lover knocking, calling!",
    source: "Song of Songs 5:2 MSG",
  },

  welcoming: {
    intro:
      "Together with joyful hearts and the grace of God,\nwe cordially request the honour of your presence\nat the wedding celebration of",
  },

  couple: {
    title: "The Groom & Bride",
    sonOf: "The Son of",
    daughterOf: "The Daughter of",
    instagram: "Open Instagram of {name}",
  },

  countdown: {
    title: "Counting the Days!",
    days: "Days",
    hours: "Hours",
    minutes: "Minutes",
    seconds: "Seconds",
    over: "The awaited day has arrived.",
    save: "Save the Date",
  },
```

`id`:

```ts
  verse: {
    text:
      "Aku tidur, tetapi hatiku bangun. Dengarlah, kekasihku mengetuk, " +
      "memanggil-manggil!",
    source: "Kidung Agung 5:2",
  },

  welcoming: {
    intro:
      "Dengan penuh sukacita dan atas rahmat Tuhan,\nkami mengundang Bapak/Ibu/Saudara\nuntuk hadir di pernikahan",
  },

  couple: {
    title: "Mempelai",
    sonOf: "Putra dari",
    daughterOf: "Putri dari",
    instagram: "Buka Instagram {name}",
  },

  countdown: {
    title: "Menghitung Hari!",
    days: "Hari",
    hours: "Jam",
    minutes: "Menit",
    seconds: "Detik",
    over: "Hari yang dinanti telah tiba.",
    save: "Simpan Tanggalnya",
  },
```

- [ ] **Step 3: Pakai di komponen**

- `InvitationShell` / `DesktopPanel`: `{t.verse.text}`, `{t.verse.source}`, dan `The Wedding Of` → `{t.cover.theWeddingOf}`
- `Cover`: ayatnya juga dari `t.verse`
- `Welcoming`: satu paragraf tiga baris. `intro` memakai `\n`, jadi render dengan `whitespace-pre-line` pada `<p>` alih-alih tiga `<br />` — lebih mudah diterjemahkan karena pemenggalannya ikut kamus
- `CoupleProfile`: judul `{t.couple.title}`; `PersonCard` menerima prop `role` (`t.couple.sonOf` atau `t.couple.daughterOf`) dan `aria-label` dari `t.couple.instagram.replace("{name}", person.fullName)`
- `Countdown`: judul, empat label unit, teks `over`, dan tombol `save`

- [ ] **Step 4: Verifikasi hijau lalu commit**

```bash
npm run typecheck && npm run lint && npm run test && npm run build
git add lib/i18n.ts lib/config.ts components/InvitationShell.tsx components/sections/Welcoming.tsx components/sections/CoupleProfile.tsx components/sections/Countdown.tsx components/sections/Cover.tsx
git commit -m "feat(i18n): sambutan, profil mempelai, dan hitung mundur dua bahasa"
```

---

### Task 5: EventDetails, LocationMap, Gallery, Footer, dan format tanggal

**Files:**
- Modify: `lib/i18n.ts`, `lib/config.ts`, `lib/utils.ts`
- Modify: `components/sections/EventDetails.tsx`, `LocationMap.tsx`, `Gallery.tsx`, `Footer.tsx`
- Modify: `tests/utils.test.ts`

**Interfaces:**
- Consumes: `Dict`
- Produces: `formatEventDate(date: Date, locale: string): string`

- [ ] **Step 1: Tulis test yang gagal untuk `formatEventDate` berlokal**

Tambahkan di `tests/utils.test.ts`:

```ts
it("mengikuti locale yang diberikan", () => {
  const d = new Date("2026-12-26T11:00:00+07:00");
  expect(formatEventDate(d, "en-GB")).toContain("December");
  expect(formatEventDate(d, "id-ID")).toContain("Desember");
});
```

- [ ] **Step 2: Jalankan, pastikan GAGAL**

Run: `npm run test -- tests/utils.test.ts`
Expected: FAIL — `formatEventDate` masih menerima satu argumen dan selalu `en-GB`.

- [ ] **Step 3: Tambahkan parameter locale**

```ts
export function formatEventDate(date: Date, locale: string): string {
  return date.toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
}
```

Perbarui test lama yang memanggilnya dengan satu argumen menjadi `formatEventDate(d, "en-GB")`.

- [ ] **Step 4: Jalankan, pastikan LOLOS**

Run: `npm run test -- tests/utils.test.ts`

- [ ] **Step 5: Pindahkan prosa dari `lib/config.ts`**

Hapus `title` dari tiap `events[]`, hapus `quote`, dan hapus `alt` dari tiap `gallery[]`. Pada `music`, pecah `credit` menjadi fakta saja:

```ts
export const music = {
  src: "/audio/backsound.mp3",
  /** Judul dan pemusiknya adalah nama karya — sama di bahasa mana pun. */
  title: "PaulYudin — Romantic Piano Inspiring",
} as const;
```

- [ ] **Step 6: Tambahkan kunci ke kedua kamus**

`en`:

```ts
  details: {
    saveTheDate: "Save the Date",
    seeLocation: "See Location",
    events: { matrimony: "Holy Matrimony", reception: "Wedding Reception" },
  },

  location: { title: "Location", openMaps: "Open in Google Maps", mapOf: "Map of {venue}" },

  gallery: {
    title: "A Portrait Of",
    quote: "True love is when both people think they're the lucky one",
    zoom: "Enlarge photo: {alt}",
    alts: [
      "Ricky and Fellycia aboard a sailboat at sunset",
      "Ricky and Fellycia toasting in a wood-panelled bar",
      "Ricky and Fellycia standing before a tall window",
      "Ricky and Fellycia seated together in a window frame",
      "Fellycia on the window ledge as Ricky leans in to watch her",
    ],
  },

  footer: { thankYou: "Thank You,", songBy: "Song by", rights: "All Rights Reserved." },
```

`id`:

```ts
  details: {
    saveTheDate: "Simpan Tanggalnya",
    seeLocation: "Lihat Lokasi",
    events: { matrimony: "Pemberkatan Nikah", reception: "Resepsi Pernikahan" },
  },

  location: { title: "Lokasi", openMaps: "Buka di Google Maps", mapOf: "Peta lokasi {venue}" },

  gallery: {
    title: "Potret",
    quote: "Cinta sejati adalah ketika keduanya merasa dialah yang beruntung",
    zoom: "Perbesar foto: {alt}",
    alts: [
      "Ricky dan Fellycia di atas kapal layar saat matahari terbenam",
      "Ricky dan Fellycia bersulang di ruang bar berpanel kayu",
      "Ricky dan Fellycia berdiri di depan jendela tinggi",
      "Ricky dan Fellycia duduk berdampingan di bingkai jendela",
      "Fellycia berdiri di ambang jendela, Ricky bersandar menatapnya",
    ],
  },

  footer: { thankYou: "Terima Kasih,", songBy: "Lagu oleh", rights: "Seluruh hak cipta dilindungi." },
```

Judul acara dipetakan lewat `id`-nya: `t.details.events[event.id]`. Karena `events` di config memakai `as const`, `event.id` bertipe `"matrimony" | "reception"` sehingga pemetaannya diperiksa TypeScript.

- [ ] **Step 7: Pakai di komponen**

- `EventDetails`: `formatEventDate(weddingDate, t.locale)`, judul acara dari peta di atas, tombol `t.details.seeLocation`, heading `t.details.saveTheDate`
- `LocationMap`: judul, `title` iframe dari `t.location.mapOf.replace("{venue}", mapVenue.venue)`, tombol `t.location.openMaps`
- `Gallery`: judul, kutipan, `alt` foto dari `t.gallery.alts[index]`, `aria-label` tombol dari `t.gallery.zoom`
- `Footer`: `t.footer.thankYou`, kredit `{t.footer.songBy} {music.title}`, dan `t.footer.rights`

- [ ] **Step 8: Verifikasi hijau lalu commit**

```bash
npm run typecheck && npm run lint && npm run test && npm run build
git add lib/i18n.ts lib/config.ts lib/utils.ts tests/utils.test.ts components/sections/EventDetails.tsx components/sections/LocationMap.tsx components/sections/Gallery.tsx components/sections/Footer.tsx
git commit -m "feat(i18n): detail acara, lokasi, galeri, dan footer dua bahasa"
```

---

### Task 6: Form RSVP dan Wishes, pesan validasi, dan waktu relatif

**Files:**
- Modify: `lib/schemas.ts`, `lib/i18n.ts`, `lib/utils.ts`
- Modify: `components/sections/Rsvp.tsx`, `components/sections/Wishes.tsx`
- Modify: `app/api/rsvp/route.ts`, `app/api/wishes/route.ts`
- Modify: `tests/schemas.test.ts`, `tests/api-rsvp.test.ts`, `tests/utils.test.ts`

**Interfaces:**
- Consumes: `Dict`
- Produces:
  - `export function rsvpSchema(m: Dict["errors"])`
  - `export function wishSchema(m: Dict["errors"])`
  - `export function timeAgo(date: Date, now: Date, t: Dict): string`

- [ ] **Step 1: Tulis test yang gagal untuk schema berparameter**

Tambahkan di `tests/schemas.test.ts`:

```ts
import { dictionaries } from "@/lib/i18n";

const en = dictionaries.en.errors;
const id = dictionaries.id.errors;

it("memakai pesan sesuai kamus yang diberikan", () => {
  const bad = { guestName: "A", attendance: "ATTENDING", guestCount: 1 };

  const idResult = rsvpSchema(id).safeParse(bad);
  expect(idResult.success).toBe(false);
  expect(toFieldErrors(idResult.error!).guestName).toBe(id.nameMin);

  const enResult = rsvpSchema(en).safeParse(bad);
  expect(toFieldErrors(enResult.error!).guestName).toBe(en.nameMin);
});
```

- [ ] **Step 2: Jalankan, pastikan GAGAL**

Run: `npm run test -- tests/schemas.test.ts`
Expected: FAIL — `rsvpSchema is not a function`.

- [ ] **Step 3: Tambahkan kunci `errors` dan `time` ke kedua kamus**

`en`:

```ts
  errors: {
    nameMin: "Name must be at least 2 characters",
    nameMax: "Name must be at most 80 characters",
    attendanceRequired: "Please choose whether you can attend",
    countInteger: "Number of guests must be a whole number",
    countMax: "Maximum 10 guests",
    countMinWhenAttending: "At least 1 guest is required if you are attending",
    messageMin: "Message must be at least 3 characters",
    messageMax: "Message must be at most 500 characters",
  },

  time: {
    justNow: "just now",
    minutes: "{n} minutes ago",
    hours: "{n} hours ago",
    days: "{n} days ago",
  },
```

`id`:

```ts
  errors: {
    nameMin: "Nama minimal 2 karakter",
    nameMax: "Nama maksimal 80 karakter",
    attendanceRequired: "Silakan pilih status kehadiran",
    countInteger: "Jumlah orang harus bilangan bulat",
    countMax: "Maksimal 10 orang",
    countMinWhenAttending: "Jumlah orang minimal 1 jika Anda hadir",
    messageMin: "Pesan minimal 3 karakter",
    messageMax: "Pesan maksimal 500 karakter",
  },

  time: {
    justNow: "baru saja",
    minutes: "{n} menit lalu",
    hours: "{n} jam lalu",
    days: "{n} hari lalu",
  },
```

Nilai pada kamus `id` **sama persis** dengan pesan yang sekarang di-hardcode di `lib/schemas.ts`, supaya kontrak API tidak berubah sedikit pun.

- [ ] **Step 4: Ubah `lib/schemas.ts` menjadi fungsi**

```ts
import type { Dict } from "@/lib/i18n";

type Messages = Dict["errors"];

export function rsvpSchema(m: Messages) {
  return z
    .object({
      guestName: z.string().trim().min(2, m.nameMin).max(80, m.nameMax),
      attendance: z.enum(ATTENDANCE, { message: m.attendanceRequired }),
      guestCount: z.coerce
        .number()
        .int(m.countInteger)
        .min(0)
        .max(10, m.countMax),
    })
    .refine((data) => data.attendance !== "ATTENDING" || data.guestCount >= 1, {
      message: m.countMinWhenAttending,
      path: ["guestCount"],
    });
}

export type RsvpInput = z.infer<ReturnType<typeof rsvpSchema>>;
```

Lakukan hal yang sama untuk `wishSchema`. `toFieldErrors` tidak berubah.

- [ ] **Step 5: Sesuaikan route handler**

Keduanya memakai kamus Indonesia, sehingga respons API sama persis seperti sebelumnya:

```ts
import { dictionaries } from "@/lib/i18n";

// Pesan server tetap satu bahasa: tamu tidak pernah melihatnya karena
// browser sudah memvalidasi lebih dulu dengan aturan yang sama.
const parsed = rsvpSchema(dictionaries.id.errors).safeParse(body);
```

- [ ] **Step 6: Ubah `timeAgo` memakai template**

```ts
export function timeAgo(date: Date, now: Date, t: Dict): string {
  const diff = now.getTime() - date.getTime();
  const ago = (template: string, n: number) =>
    template.replace("{n}", String(n));

  if (diff < MINUTE) return t.time.justNow;
  if (diff < HOUR) return ago(t.time.minutes, Math.floor(diff / MINUTE));
  if (diff < DAY) return ago(t.time.hours, Math.floor(diff / HOUR));
  if (diff < 7 * DAY) return ago(t.time.days, Math.floor(diff / DAY));

  return date.toLocaleDateString(t.locale, { day: "numeric", month: "long", year: "numeric" });
}
```

Fungsi ini menerima kamus utuh, bukan `t.time` saja, karena ia juga butuh
`t.locale`. **Jangan menambahkan `locale` kedua di dalam grup `time`** — satu
nilai di dua tempat cepat atau lambat akan berselisih.

Perbarui test `timeAgo` yang ada supaya mengirim kamus, dan tambahkan satu test yang membuktikan `{n}` benar-benar tergantikan.

- [ ] **Step 7: Tambahkan kunci `rsvp` dan `wishes` ke kedua kamus**

`en`:

```ts
  rsvp: {
    title: "RSVP",
    name: "Name",
    namePlaceholder: "Your name",
    attendance: "Will you attend?",
    attending: "Yes, I will be there",
    notAttending: "Sorry, I cannot come",
    guestCount: "Number of guests",
    guestCountHint: "Including yourself, maximum 10 people.",
    submit: "Send Confirmation",
    sending: "Sending…",
    failed: "Failed to send your confirmation.",
    offline: "Cannot reach the server. Please check your connection.",
    thankYou: "Thank you",
    received: "We have received your confirmation.",
    another: "Fill in for another guest",
    summary: "{attending} attending · {notAttending} unable · {pax} people",
  },

  wishes: {
    title: "Kind Words",
    name: "Name",
    namePlaceholder: "Your name",
    message: "Message",
    messagePlaceholder: "Write your wishes and prayers…",
    submit: "Send Wishes",
    sending: "Sending…",
    failed: "Failed to send your wishes.",
    offline: "Cannot reach the server. Please check your connection.",
    received: "Thank you, we have received your wishes.",
    listFailed: "The list of wishes cannot be loaded right now.",
    empty: "No wishes yet. Be the first.",
  },
```

`id` — nilai untuk kunci yang sudah ada di kode sekarang disalin apa adanya (`"RSVP"`, `"Nama"`, `"Nama Anda"`, `"Konfirmasi Kehadiran"`, `"Ya, saya akan hadir"`, `"Maaf, saya berhalangan"`, `"Jumlah Orang"`, `"Termasuk Anda sendiri, maksimal 10 orang."`, `"Kirim Konfirmasi"`, `"Mengirim…"`, `"Gagal mengirim konfirmasi."`, `"Tidak bisa menghubungi server. Periksa koneksi Anda."`, `"Terima kasih"`, `"Konfirmasi Anda sudah kami terima."`, `"Isi untuk tamu lain"`, `"Kind Words"` → `"Ucapan & Doa"`, `"Ucapan"`, `"Tuliskan doa dan ucapan Anda…"`, `"Kirim Ucapan"`, `"Gagal mengirim ucapan."`, `"Terima kasih, ucapan Anda sudah kami terima."`, `"Daftar ucapan sedang tidak bisa dimuat."`, `"Belum ada ucapan. Jadilah yang pertama."`), ditambah:

```ts
    summary: "{attending} hadir · {notAttending} berhalangan · {pax} orang",
```

- [ ] **Step 8: Pakai di `Rsvp.tsx` dan `Wishes.tsx`**

Kedua komponen menambah prop `t: Dict`. Ganti seluruh teks yang di-hardcode dengan kunci di atas, dan panggil schema dengan `rsvpSchema(t.errors)`.

**Hapus `lang="id"` dari `<Section>` di kedua berkas** — halaman kini konsisten satu bahasa lewat `<main lang>`, jadi tambalan Step 8 lama tidak lagi diperlukan.

Ringkasan RSVP memakai `t.rsvp.summary` dengan tiga penggantian:

```tsx
{t.rsvp.summary
  .replace("{attending}", String(summary.attending))
  .replace("{notAttending}", String(summary.notAttending))
  .replace("{pax}", String(summary.totalPax))}
```

Syarat tampilnya tidak berubah: hanya muncul kalau `attending + notAttending > 0`.

- [ ] **Step 9: Verifikasi hijau lalu commit**

```bash
npm run typecheck && npm run lint && npm run test && npm run build
git add lib/schemas.ts lib/i18n.ts lib/utils.ts app/api components/sections/Rsvp.tsx components/sections/Wishes.tsx tests
git commit -m "feat(i18n): form RSVP dan Wishes dua bahasa, pesan validasi ikut kamus"
```

---

### Task 7: Metadata mengikuti bahasa

**Files:**
- Modify: `app/layout.tsx`, `app/page.tsx`, `lib/i18n.ts`, `lib/config.ts`

- [ ] **Step 1: Pindahkan judul dan deskripsi ke kamus**

Hapus `title` dan `description` dari `site` di `lib/config.ts` (sisakan `url`), lalu tambahkan ke kedua kamus:

```ts
  meta: {
    title: "The Wedding of Ricky & Fellycia",
    description:
      "Together with joyful hearts, we cordially request the honor of your presence at our wedding celebration — 26 December 2026, Semarang.",
  },
```

```ts
  meta: {
    title: "Pernikahan Ricky & Fellycia",
    description:
      "Dengan penuh sukacita, kami mengundang Bapak/Ibu/Saudara untuk hadir di pernikahan kami — 26 Desember 2026, Semarang.",
  },
```

- [ ] **Step 2: Kurangi `metadata` di `app/layout.tsx`**

Sisakan hanya yang tidak bergantung bahasa:

```tsx
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
};
```

Ikon dan `opengraph-image` tetap berasal dari konvensi nama berkas — tidak ada yang perlu ditulis.

- [ ] **Step 3: Tambahkan `generateMetadata` di `app/page.tsx`**

```tsx
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { lang } = await searchParams;
  const t = dictionaries[pickLang(lang)];

  return {
    title: t.meta.title,
    description: t.meta.description,
    openGraph: {
      title: t.meta.title,
      description: t.meta.description,
      type: "website",
      url: site.url,
    },
    twitter: { card: "summary_large_image" },
  };
}
```

- [ ] **Step 4: Buktikan tag benar-benar berubah**

```bash
npm run build && npx next start -p 3101 &
curl -s http://localhost:3101 | grep -oE '<meta property="og:title[^>]*>'
curl -s 'http://localhost:3101/?lang=id' | grep -oE '<meta property="og:title[^>]*>'
```

Expected: yang kedua berbunyi "Pernikahan Ricky & Fellycia". Pastikan `og:image` **tetap ada** di keduanya.

- [ ] **Step 5: Verifikasi hijau lalu commit**

```bash
npm run typecheck && npm run lint && npm run test
git add app/layout.tsx app/page.tsx lib/i18n.ts lib/config.ts
git commit -m "feat(i18n): judul dan deskripsi pratinjau tautan ikut bahasa"
```

---

### Task 8: Section Access Card

**Files:**
- Create: `components/sections/AccessCard.tsx`
- Modify: `lib/utils.ts`, `tests/utils.test.ts`, `lib/i18n.ts`, `lib/config.ts`, `app/page.tsx`
- Dependency: `npm install qrcode-generator`

**Interfaces:**
- Consumes: `Dict`, `site.url`
- Produces: `export function invitationUrl(guestName?: string, lang?: Lang): string`

`qrcode-generator` sudah diperiksa: menyertakan tipenya sendiri (`types: dist/qrcode.d.ts`) dan **nol dependensi**. Tidak perlu paket `@types/`.

Dua hal yang sudah dipastikan supaya tidak jadi kejutan saat implementasi:

- `tsconfig.json` memakai `"esModuleInterop": true`, jadi `import qrcode from "qrcode-generator"` sah. Kalau ternyata tetap ditolak, ganti ke `import * as qrcodeNs` lalu panggil `qrcodeNs.default ?? qrcodeNs`.
- `lib/utils.ts` saat ini **tidak meng-import apa pun**, dan `lib/config.ts` juga tidak. Menambahkan `import { site } from "@/lib/config"` di `utils.ts` karena itu tidak membuat impor melingkar.

- [ ] **Step 1: Tulis test yang gagal untuk pembangun URL**

Tambahkan di `tests/utils.test.ts`:

```ts
import { invitationUrl } from "@/lib/utils";
import { site } from "@/lib/config";

describe("invitationUrl", () => {
  it("mengembalikan URL polos tanpa nama tamu", () => {
    expect(invitationUrl()).toBe(site.url);
  });

  it("menyertakan nama tamu yang di-encode", () => {
    expect(invitationUrl("Budi Santoso")).toBe(`${site.url}/?to=Budi+Santoso`);
  });

  it("menyertakan bahasa hanya kalau bukan default", () => {
    expect(invitationUrl("Budi", "en")).toBe(`${site.url}/?to=Budi`);
    expect(invitationUrl("Budi", "id")).toBe(`${site.url}/?to=Budi&lang=id`);
  });
});
```

- [ ] **Step 2: Jalankan, pastikan GAGAL**

Run: `npm run test -- tests/utils.test.ts`
Expected: FAIL — `invitationUrl` belum ada.

- [ ] **Step 3: Implementasikan di `lib/utils.ts`**

```ts
/**
 * Alamat undangan ini, lengkap dengan nama tamu kalau ada.
 * Dipakai sebagai isi QR pada Access Card.
 */
export function invitationUrl(guestName?: string, lang: Lang = "en"): string {
  const params = new URLSearchParams();
  if (guestName) params.set("to", guestName);
  if (lang === "id") params.set("lang", "id");
  return params.size > 0 ? `${site.url}/?${params}` : site.url;
}
```

- [ ] **Step 4: Jalankan, pastikan LOLOS**

Run: `npm run test -- tests/utils.test.ts`

- [ ] **Step 5: Pasang dependensi**

```bash
npm install qrcode-generator
```

- [ ] **Step 6: Tambahkan kunci `accessCard` dan entri nav**

`en`:

```ts
  accessCard: {
    title: "Access Card",
    intro: "Please show this card when you arrive.",
    guest: "Guest",
    honoredGuest: "Honored Guest",
    admits: "Admits",
    qrAlt: "Decorative QR code containing the link to this invitation",
  },
```

`id`:

```ts
  accessCard: {
    title: "Kartu Undangan",
    intro: "Mohon tunjukkan kartu ini saat tiba di lokasi.",
    guest: "Tamu",
    honoredGuest: "Tamu Undangan",
    admits: "Berlaku untuk",
    qrAlt: "Kode QR hiasan berisi tautan undangan ini",
  },
```

Di `lib/config.ts`, sisipkan `{ id: "access" }` pada `navLinks` **setelah** `{ id: "details" }`. Kunci `nav.access` sudah dibuat di Task 2.

- [ ] **Step 7: Buat `components/sections/AccessCard.tsx`**

```tsx
import qrcode from "qrcode-generator";
import Section, { SectionTitle } from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";
import Divider from "@/components/ui/Divider";
import CoupleNames from "@/components/ui/CoupleNames";
import { mapVenue, weddingDate } from "@/lib/config";
import { formatEventDate, invitationUrl } from "@/lib/utils";
import type { Dict, Lang } from "@/lib/i18n";

/**
 * Mengubah teks menjadi SATU path SVG.
 *
 * Library-nya hanya ditanya kotak mana yang gelap; path-nya kita gambar
 * sendiri. Dua alasan: tidak perlu dangerouslySetInnerHTML, dan satu path
 * jauh lebih ringan daripada ratusan <rect> terpisah.
 */
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

export default function AccessCard({
  t,
  lang,
  guestName,
}: {
  t: Dict;
  lang: Lang;
  guestName?: string;
}) {
  const { d, size } = qrPath(invitationUrl(guestName, lang));

  return (
    <Section id="access" className="bg-cream">
      <SectionTitle>{t.accessCard.title}</SectionTitle>

      <Reveal delay={100}>
        <p className="mt-4 text-center font-body text-lg text-ink/80">
          {t.accessCard.intro}
        </p>
      </Reveal>

      <Reveal delay={180}>
        <div className="mt-10 rounded-sm border border-ink/15 bg-white/70 p-8 text-center shadow-sm">
          <p className="font-display text-[0.65rem] tracking-[0.3em] text-ink/70 uppercase">
            {t.accessCard.guest}
          </p>
          <p className="mt-2 font-display text-2xl tracking-[0.05em] text-ink">
            {guestName || t.accessCard.honoredGuest}
          </p>

          <Divider className="mt-6 text-ink/40" />

          <svg
            viewBox={`0 0 ${size} ${size}`}
            role="img"
            aria-label={t.accessCard.qrAlt}
            className="mx-auto mt-6 h-40 w-40"
            shapeRendering="crispEdges"
          >
            <path d={d} fill="currentColor" className="text-ink" />
          </svg>

          <p className="mt-6 font-body text-base text-ink/80">
            {formatEventDate(weddingDate, t.locale)}
          </p>
          <p className="font-body text-base text-ink/80">{mapVenue.venue}</p>

          <p className="mt-4 font-script text-xl text-ink/70">
            <CoupleNames andClassName="mx-2" />
          </p>
        </div>
      </Reveal>
    </Section>
  );
}
```

- [ ] **Step 8: Sisipkan di `app/page.tsx`**

Letakkan **setelah `<LocationMap />` dan sebelum `<Rsvp />`**, mengikuti urutan template referensi:

```tsx
<AccessCard t={t} lang={lang} guestName={guestName} />
```

- [ ] **Step 9: Buktikan QR-nya benar-benar terbaca**

Jangan menilai dari tampilannya. Bandingkan hasil decode dengan URL yang diharapkan:

```bash
npm run dev
```

Di console browser pada `/?to=Budi`, pastikan `<path>` punya isi dan ukurannya masuk akal:

```js
const p = document.querySelector('#access svg path');
p.getAttribute("d").length > 100          // true
document.querySelector('#access svg').getAttribute("viewBox")  // "0 0 N N", N ganjil 21-45
```

Lalu scan QR-nya dengan kamera ponsel: harus membuka `.../?to=Budi`.

- [ ] **Step 10: Verifikasi hijau lalu commit**

```bash
npm run typecheck && npm run lint && npm run test && npm run build
git add package.json package-lock.json components/sections/AccessCard.tsx lib/utils.ts lib/config.ts lib/i18n.ts tests/utils.test.ts app/page.tsx
git commit -m "feat: section Access Card dengan QR dekoratif"
```

---

### Task 9: Verifikasi menyeluruh, dokumentasi, dan deploy

**Files:**
- Modify: `README.md`, `CLAUDE.md`

- [ ] **Step 1: Verifikasi responsif dan bebas overflow di kedua bahasa**

Terjemahan Bahasa Indonesia hampir selalu lebih panjang daripada Inggris — itulah cara tata letak jebol. Ukur dengan iframe (cara yang terbukti berhasil di mesin ini, `CLAUDE.md` §9):

```js
document.body.innerHTML =
  '<iframe src="/?lang=id" style="width:375px;height:800px;border:0"></iframe>' +
  '<iframe src="/?lang=id" style="width:768px;height:800px;border:0"></iframe>';
```

Untuk tiap iframe periksa `contentDocument.documentElement.scrollWidth <= contentWindow.innerWidth`. Ulangi untuk `?lang=en`.

- [ ] **Step 2: Verifikasi tidak ada teks yang tertinggal**

```js
// cari sisa string Inggris saat halaman berbahasa Indonesia
["Open Invitation","Save the Date","Thank You","Kind Words","See Location"]
  .filter(s => document.body.innerText.includes(s));   // harus []
```

- [ ] **Step 3: Perbarui `README.md`**

- Bagian 3 (Fitur): tambahkan toggle EN/ID dan Access Card, tandai keduanya sebagai tambahan di luar PRD §1.5
- Bagian 4 (Arsitektur): jelaskan bahasa disimpan di URL dan alasan project tetap tidak butuh Context
- Bagian 6 (Keputusan teknis): catat penolakan rute `/en` `/id` dan penolakan cookie
- Bagian 8 (Testing): jumlah test yang baru

- [ ] **Step 4: Perbarui `CLAUDE.md`**

- §4 struktur: tambah `lib/i18n.ts`, `components/ui/LanguageToggle.tsx`, `components/sections/AccessCard.tsx`
- §7 Scope: pindahkan toggle EN/ID dari "Stretch" ke yang dikerjakan
- §11 Progress: tambahkan Step 12 beserta hasil pengukuran Task 1
- §11c: perbarui alur data RSVP — pesan validasi kini datang dari kamus

- [ ] **Step 5: Terjemahan dibaca ulang oleh user**

Tampilkan seluruh isi kamus `id` dan minta user membacanya. Ini satu-satunya bagian yang tidak bisa diverifikasi mesin: terjemahannya dikarang, bukan diambil dari sumber resmi. Perhatikan khusus ayat Kidung Agung 5:2 — pastikan user setuju dengan versinya.

- [ ] **Step 6: Commit dan deploy**

```bash
npm run typecheck && npm run lint && npm run test && npm run build
git add README.md CLAUDE.md
git commit -m "docs: catat toggle bahasa dan Access Card"
git push origin main
```

Tunggu deploy Vercel selesai, lalu verifikasi di production:

```bash
U=https://invitato-wedding-invitation-navy.vercel.app
curl -s "$U/?lang=id" | grep -c "Buka Undangan"     # harus 1
curl -s "$U/?lang=xx" | grep -c "Open Invitation"   # harus 1
curl -s "$U/api/rsvp"                                # kontrak API tidak berubah
```
