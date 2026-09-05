/**
 * Semua kalimat yang dilihat tamu, dalam dua bahasa.
 *
 * Pembagian tugasnya tegas: `lib/config.ts` menyimpan FAKTA acara — tanggal,
 * alamat, path foto — yang sama saja di bahasa mana pun. Berkas ini menyimpan
 * KALIMAT-nya.
 *
 * Kamus ini diteruskan dari Server Component ke Client Component, jadi isinya
 * hanya boleh string: tidak boleh ada fungsi, Date, atau Map. Teks yang memuat
 * angka memakai penanda {n} yang diganti di tempat pemakaiannya.
 */

export type Lang = "en" | "id";

/**
 * Versi Inggris sengaja ditulis TANPA `as const`.
 *
 * Dengan `as const`, tipe setiap nilai menjadi literal ("Gallery", bukan
 * string), sehingga kamus Indonesia akan dipaksa berisi teks yang sama persis —
 * mustahil diterjemahkan. Tanpa itu, tipenya `string` dan kamus Indonesia bebas
 * isinya tapi wajib sama strukturnya.
 */
const en = {
  /** Kode locale untuk toLocaleDateString. Lihat lib/utils.ts. */
  locale: "en-GB",

  nav: {
    menu: "Invitation menu",
    open: "Open menu",
    close: "Close menu",
    couple: "Groom & Bride",
    details: "Wedding Details",
    gallery: "Gallery",
    rsvp: "RSVP",
    wishes: "Kind Words",
  },

  language: {
    label: "Language",
    /** Nama bahasa yang SEDANG TIDAK dipakai — itulah teks tombolnya. */
    other: "Bahasa Indonesia",
  },

  cover: {
    theWeddingOf: "The Wedding Of",
    dear: "Dear Mr/Mrs/Ms,",
    open: "Open Invitation",
  },

  verse: {
    text:
      "I was sound asleep, but in my dreams I was wide awake. " +
      "Oh, listen! It's the sound of my lover knocking, calling!",
    source: "Song of Songs 5:2 MSG",
  },

  welcoming: {
    /** Pemenggalan barisnya ikut kamus, dirender dengan whitespace-pre-line. */
    intro: `Together with joyful hearts and the grace of God,
we cordially request the honour of your presence
at the wedding celebration of`,
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
};

export type Dict = typeof en;

/**
 * Anotasi `: Dict` di sini adalah pengamannya. Kalau ada satu kunci saja yang
 * lupa diterjemahkan, `npm run typecheck` gagal — kelengkapan terjemahan
 * dijamin compiler, bukan diperiksa manual satu per satu.
 */
const id: Dict = {
  locale: "id-ID",

  nav: {
    menu: "Menu undangan",
    open: "Buka menu",
    close: "Tutup menu",
    couple: "Mempelai",
    details: "Detail Acara",
    gallery: "Galeri",
    rsvp: "Konfirmasi",
    wishes: "Ucapan & Doa",
  },

  language: {
    label: "Bahasa",
    other: "English",
  },

  cover: {
    theWeddingOf: "Pernikahan",
    dear: "Kepada Bapak/Ibu/Saudara,",
    open: "Buka Undangan",
  },

  verse: {
    text:
      "Aku tidur, tetapi hatiku bangun. Dengarlah, kekasihku mengetuk, " +
      "memanggil-manggil!",
    source: "Kidung Agung 5:2",
  },

  welcoming: {
    intro: `Dengan penuh sukacita dan atas rahmat Tuhan,
kami mengundang Bapak/Ibu/Saudara untuk hadir
di pernikahan kami`,
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
};

export const dictionaries: Record<Lang, Dict> = { en, id };

/** Apa pun selain "id" dianggap Inggris — termasuk nilai kosong dan asing. */
export function pickLang(raw?: string): Lang {
  return raw === "id" ? "id" : "en";
}
