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
};

export const dictionaries: Record<Lang, Dict> = { en, id };

/** Apa pun selain "id" dianggap Inggris — termasuk nilai kosong dan asing. */
export function pickLang(raw?: string): Lang {
  return raw === "id" ? "id" : "en";
}
