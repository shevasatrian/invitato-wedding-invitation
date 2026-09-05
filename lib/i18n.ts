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
    /** Kata penghubung nama mempelai, ditulis dengan font tulisan tangan. */
    and: "and",
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

  details: {
    saveTheDate: "Save the Date",
    seeLocation: "See Location",
    /** Dipetakan lewat events[].id di lib/config.ts. */
    events: { matrimony: "Holy Matrimony", reception: "Wedding Reception" },
  },

  location: {
    title: "Location",
    openMaps: "Open in Google Maps",
    mapOf: "Map of {venue}",
  },

  gallery: {
    title: "A Portrait Of",
    quote: "True love is when both people think they are the lucky one",
    zoom: "Enlarge photo: {alt}",
    /** Urutannya harus sama dengan `gallery` di lib/config.ts. */
    alts: [
      "Ricky and Fellycia aboard a sailboat at sunset",
      "Ricky and Fellycia toasting in a wood-panelled bar",
      "Ricky and Fellycia standing before a tall window",
      "Ricky and Fellycia seated together in a window frame",
      "Fellycia on the window ledge as Ricky leans in to watch her",
    ],
  },

  lightbox: {
    close: "Close",
    previous: "Previous photo",
    next: "Next photo",
  },

  footer: {
    thankYou: "Thank You,",
    songBy: "Song by",
    rights: "All Rights Reserved.",
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
    and: "dan",
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

  details: {
    saveTheDate: "Simpan Tanggalnya",
    seeLocation: "Lihat Lokasi",
    events: { matrimony: "Pemberkatan Nikah", reception: "Resepsi Pernikahan" },
  },

  location: {
    title: "Lokasi",
    openMaps: "Buka di Google Maps",
    mapOf: "Peta lokasi {venue}",
  },

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

  lightbox: {
    close: "Tutup",
    previous: "Foto sebelumnya",
    next: "Foto berikutnya",
  },

  footer: {
    thankYou: "Terima Kasih,",
    songBy: "Lagu oleh",
    rights: "Seluruh hak cipta dilindungi.",
  },
};

export const dictionaries: Record<Lang, Dict> = { en, id };

/** Apa pun selain "id" dianggap Inggris — termasuk nilai kosong dan asing. */
export function pickLang(raw?: string): Lang {
  return raw === "id" ? "id" : "en";
}
