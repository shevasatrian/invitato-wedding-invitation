# Desain — Toggle Bahasa EN/ID dan Section Access Card

**Tanggal:** 5 September 2026
**Status:** disetujui, siap dibuatkan rencana implementasi
**Berlaku untuk:** undangan pernikahan Ricky & Fellycia (Next.js 16.3.4, sudah live)

---

## 1. Tujuan

Menambah dua fitur ke undangan yang sudah tayang:

1. **Toggle bahasa EN/ID** — tamu bisa membaca seluruh undangan dalam Bahasa Inggris atau Bahasa Indonesia.
2. **Section Access Card** — kartu bergaya tiket berisi nama tamu dan QR, meniru section "QR Card" pada template referensi Invitato.

Keduanya tunduk pada aturan utama project: **kode harus bisa dijelaskan junior programmer dalam dua kalimat.** Solusi yang lebih canggih tapi butuh penjelasan panjang ditolak.

## 2. Keputusan yang mengunci desain

Diambil bersama user sebelum desain ditulis:

| Pertanyaan | Keputusan |
|---|---|
| Apa saja yang berganti bahasa? | **Semua yang dilihat tamu** — narasi, judul section, nav, label form, tombol, dan pesan error |
| Bahasa default | **Inggris**, sama seperti sekarang dan sama seperti template referensi |
| Isi QR | **URL undangan lengkap dengan `?to=`**, sehingga scan menghasilkan sesuatu yang masuk akal |
| Mekanisme bahasa | **Bahasa di URL (`?lang=id`)**, meniru mekanisme `?to=` yang sudah ada |

Dua pendekatan lain ditolak dan alasannya dicatat supaya tidak diusulkan ulang:

- **Render dua bahasa lalu sembunyikan salah satu.** Setiap kalimat muncul dua kali di DOM; pembaca layar berisiko membacakan keduanya — persis jenis cacat yang sudah diberantas di Step 8. Halaman juga hampir dua kali lebih berat.
- **Rute terpisah `/en` dan `/id`.** Seluruh isi `app/` harus pindah ke segmen dinamis, muncul konsep `generateStaticParams`, dan URL yang sudah dibagikan (`/`) memerlukan redirect. Terlalu mahal untuk dua bahasa di satu halaman.

## 3. Pemisahan fakta dan kalimat

`lib/config.ts` saat ini mencampur dua hal yang berbeda sifatnya. Hanya kalimat yang perlu diterjemahkan.

**Tetap di `lib/config.ts` — fakta acara:**

- `couple`: `fullName`, `shortName`, `father`, `mother`, `instagram`, `photo`, `hashtag`
- `weddingDate`, dan pada tiap `events[]`: `id`, `time`, `venue`, `address`, `startsAt`, `endsAt`
- `images`, `gallery[].src`, `navLinks[].id` beserta urutannya
- `music.src`, judul lagu dan nama artis
- `site.url`

**Pindah ke `lib/i18n.ts` — kalimat:**

- `couple.groom.role` dan `couple.bride.role` ("The Son of" / "Putra dari")
- `verse.text` dan `verse.source`
- `quote`
- `events[].title` ("Holy Matrimony" / "Pemberkatan Nikah")
- `navLinks[].label`
- `gallery[].alt` — sekalian memperbaiki cacat yang ada: alt-nya kini Bahasa Indonesia di dalam halaman `lang="en"`
- Kata "Song by" pada kredit musik
- `site.title` dan `site.description`

Hasil sampingannya, `config.ts` menjadi lebih benar: satu berkas berisi fakta acara, satu berkas berisi bahasa.

## 4. Bentuk kamus

`lib/i18n.ts`:

```ts
export type Lang = "en" | "id";

const en = {
  cover: { ... },
  welcoming: { ... },
  couple: { ... },
  countdown: { ... },
  details: { ... },
  accessCard: { ... },
  gallery: { ... },
  rsvp: { ... },
  wishes: { ... },
  footer: { ... },
  nav: { ... },
  errors: { ... },
  meta: { title, description },
  language: { ... },
};                                  // sengaja TANPA "as const"

export type Dict = typeof en;

const id: Dict = { ... };           // satu kunci terlewat -> tsc gagal

export const dictionaries: Record<Lang, Dict> = { en, id };

export function pickLang(raw?: string): Lang {
  return raw === "id" ? "id" : "en";
}
```

Dua hal yang disengaja:

- **`en` ditulis tanpa `as const`.** Dengan `as const`, tipe setiap nilai menjadi literal, sehingga kamus `id` dipaksa berisi string yang sama persis dengan `en` — mustahil diterjemahkan. Tanpa `as const`, tipenya `string` dan kamus `id` bebas isinya tetapi wajib sama strukturnya.
- **`const id: Dict`** adalah pengamannya. Kalau ada satu string yang lupa diterjemahkan, `npm run typecheck` gagal. Kelengkapan terjemahan dijamin compiler, bukan pemeriksaan manual.

`pickLang` menerima nilai apa pun dan mengembalikan bahasa yang sah; `?lang=xx`, `?lang=`, atau tanpa `?lang` sama-sama menghasilkan `"en"`. Tidak ada jalan untuk membuat halaman gagal lewat parameter ini.

## 5. Bagaimana kamus sampai ke komponen

Lewat prop biasa. Tidak ada Context, tidak ada state manager — konsisten dengan keputusan project.

```
page.tsx    lang = pickLang(searchParams.lang);  t = dictionaries[lang]
  |
  +-- InvitationShell  t, lang      panel desktop (ayat) + atribut lang di <main>
  +-- Invitation       t            "use client"
  |     +-- Cover      t
  |     +-- NavDrawer  t
  +-- children: Welcoming, CoupleProfile, Countdown, EventDetails, LocationMap,
                AccessCard, Rsvp, Gallery, Wishes, Footer   -- masing-masing menerima t

AccessCard menerima satu prop tambahan: guestName, dari `?to=` yang sama dengan
yang dipakai Cover. Keduanya membacanya dari page.tsx, bukan masing-masing sendiri.
```

Kedalaman maksimum dua tingkat, dan hanya karena `Cover` dan `NavDrawer` memang dirender oleh `Invitation`.

Kamus adalah objek biasa, jadi aman diteruskan dari Server Component ke Client Component. Section undangan tetap Server Component — kamus tidak menambah satu byte pun JavaScript ke browser tamu.

### Atribut bahasa

`<html lang="en">` di `app/layout.tsx` **tidak berubah**, karena layout tidak menerima `searchParams`. Sebagai gantinya `lang={lang}` dipasang pada `<main>` di `InvitationShell`. Pembaca layar memakai atribut `lang` terdekat, jadi ini benar.

Konsekuensi yang diinginkan: tambalan `lang="id"` per-section yang dipasang di Step 8 pada Rsvp dan Wishes **dihapus**, karena seluruh halaman kini konsisten satu bahasa. Prop `lang` pada komponen `Section` tetap dipertahankan — masih dipakai, hanya pemakainya berpindah.

## 6. Pesan error validasi

`lib/schemas.ts` berubah dari konstanta menjadi fungsi:

```ts
export function rsvpSchema(m: Dict["errors"]) { ... }
export function wishSchema(m: Dict["errors"]) { ... }
```

- **Client** memanggil `rsvpSchema(t.errors)` — tamu melihat pesan dalam bahasa yang sedang dipakainya.
- **Server** memanggil dengan kamus Indonesia, sehingga **kontrak API tidak berubah sama sekali** dan README tidak perlu direvisi.

Alasan server tidak ikut dua bahasa: tamu tidak pernah melihat pesan server, karena browser memvalidasi lebih dulu dengan aturan yang sama persis dari berkas yang sama. Pesan server hanya muncul kalau seseorang melewati browser, misalnya dengan `curl`. Menambah field `lang` ke body POST hanya untuk kasus itu berarti memperumit kontrak API demi jalur yang tidak pernah dilalui tamu.

Aturan validasinya sendiri tidak berubah: `guestName` 2–80 karakter, `guestCount` 1–10 kalau hadir dan dipaksa 0 kalau tidak hadir, `message` 3–500 karakter.

## 7. Toggle bahasa

Tampil di dua tempat, tanpa menambah tombol melayang baru yang menyesaki sudut layar:

- **Halaman sampul**, kecil di bawah tombol Open Invitation
- **Nav drawer**, satu baris `Language · EN | ID`

Keduanya `<Link scroll={false}>` menuju URL yang sama dengan `lang` dibalik, dan `?to=` dipertahankan. Komponen baru `components/ui/LanguageToggle.tsx` membangun URL tujuannya; tidak ada state di dalamnya.

### Risiko yang harus diukur lebih dulu

Berpindah bahasa memicu navigasi. Kalau state `opened` di `Invitation` ikut ter-reset, tamu terlempar kembali ke halaman sampul di tengah membaca.

**Tugas implementasi pertama adalah mengukur ini, bukan menulis fitur.** Dugaannya state bertahan, karena Next melakukan soft navigation dan `Invitation` tidak di-unmount, tetapi dugaan bukan bukti — dan project ini punya riwayat panjang salah menuduh berdasarkan dugaan (`Reveal` dan NavDrawer dua kali disangka rusak padahal tidak).

- **Kalau `opened` bertahan:** toggle dipasang di kedua tempat sesuai rencana.
- **Kalau ter-reset:** toggle di nav drawer dibuang, hanya tersisa di halaman sampul; tamu memilih bahasa di gerbang sebelum masuk. Keputusan ini diambil berdasarkan hasil pengukuran, bukan preferensi.

## 8. Section Access Card

Berkas baru `components/sections/AccessCard.tsx`, Server Component, tanpa state.

**Posisi:** setelah `EventDetails` dan `LocationMap`, sebelum `Rsvp` — mengikuti urutan template referensi (Wedding Details → QR Card → RSVP).

**Isi kartu:** nama pengantin, nama tamu dari `?to=`, tanggal acara, venue resepsi, dan QR.

Kalau `?to=` kosong, nama tamu diganti teks dari kamus: `"Honored Guest"` (en) dan
`"Tamu Undangan"` (id). Kartu tanpa nama sama sekali akan terlihat rusak, dan tautan
undangan memang bisa dibuka tanpa parameter itu.

**Pembuatan QR:** memakai `qrcode-generator` — nol dependensi, hanya berjalan di server sehingga tidak pernah ikut ke browser tamu. Library hanya ditanya kotak mana yang gelap (`qr.isDark(baris, kolom)`); SVG-nya digambar sendiri sebagai **satu elemen `<path>`**.

Dua alasan menggambar sendiri:

- Tidak perlu `dangerouslySetInnerHTML` sama sekali.
- Satu `<path>` jauh lebih ringan daripada ratusan elemen `<rect>` yang akan dihasilkan kalau tiap kotak digambar terpisah.

**Isi QR:** `site.url` ditambah `?to=` kalau ada. Fungsi pembangunnya ditaruh di `lib/utils.ts` bersama pembangun URL lain yang sudah ada (`mapLinkUrl`, link Google Calendar), dan diuji.

`navLinks` di `lib/config.ts` bertambah satu entri `{ id: "access" }`, disisipkan
setelah `details` supaya urutan nav tetap mengikuti urutan section. Labelnya tinggal
di kamus: `nav.access` — `"Access Card"` (en) dan `"Kartu Undangan"` (id).

**Catatan verifikasi:** `qrcode-generator` harus dipastikan menyertakan definisi TypeScript-nya sendiri. Kalau tidak, dan `@types/` untuknya tidak tersedia, ganti ke `qrcode-svg` (juga nol dependensi) dengan konsekuensi SVG-nya berupa string. Diperiksa saat implementasi, sebelum kode ditulis.

## 9. Metadata

`title` dan `description` pindah dari `metadata` statis di `app/layout.tsx` ke `generateMetadata` di `app/page.tsx`, supaya pratinjau tautan WhatsApp ikut bahasa yang dibagikan.

`metadataBase`, ikon, dan `opengraph-image` **tetap di layout dan tidak berubah**.

## 10. Testing

**37 test yang ada sekarang wajib tetap hijau.** Yang perlu disesuaikan: 16 test schema kini memanggil `rsvpSchema(pesan)` dan `wishSchema(pesan)`.

Test baru:

| Berkas | Yang diuji |
|---|---|
| `tests/i18n.test.ts` | `pickLang`: `"id"` → `id`; `"en"`, `"xx"`, string kosong, dan `undefined` → `en` |
| `tests/i18n.test.ts` | Kesepadanan kamus saat runtime — menangkap panjang array yang meleset (misalnya alt galeri kurang satu), yang lolos dari TypeScript |
| `tests/utils.test.ts` | Pembangun URL QR: dengan `?to=`, tanpa `?to=`, dan dengan nama berisi spasi |

Test tidak menyentuh database dan tidak bergantung pada jam mesin, mengikuti pola yang sudah ada.

## 11. Yang sengaja TIDAK dikerjakan

- **Bahasa ketiga.** Struktur kamusnya memang memungkinkan, tapi tidak ada kebutuhannya.
- **Deteksi otomatis dari header `Accept-Language`.** Menambah satu konsep (negosiasi bahasa) dan membuat halaman tidak bisa ditebak saat diuji.
- **Menyimpan pilihan bahasa di cookie atau `localStorage`.** Bahasa sudah ada di URL, yang berarti ikut terbawa saat tautan dibagikan dan bisa di-bookmark. Menyimpannya di dua tempat membuka peluang keduanya berselisih.
- **QR yang benar-benar berfungsi sebagai kartu masuk** (validasi kehadiran, pemindaian di lokasi). PRD §1.6 menyatakan Access Card tidak wajib; yang dibuat di sini adalah elemen visual, dan itu memang yang diminta.

## 12. Definisi selesai

- [ ] `npm run typecheck` 0 error — sekaligus bukti tidak ada string yang lupa diterjemahkan
- [ ] `npm run lint` 0 error
- [ ] `npm run test` hijau, 37 test lama ditambah test baru
- [ ] `npm run build` hijau
- [ ] Diverifikasi di browser dengan pengukuran DOM, bukan tangkapan layar: `?lang=id` mengganti seluruh teks, `?lang=xx` jatuh ke Inggris, `?to=` bertahan saat bahasa diganti
- [ ] Perilaku state `opened` saat berpindah bahasa sudah diukur dan letak toggle mengikuti hasilnya
- [ ] Terjemahan Bahasa Indonesia sudah dibaca ulang oleh user
