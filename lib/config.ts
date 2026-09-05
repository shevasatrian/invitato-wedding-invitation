/**
 * Satu-satunya sumber data acara.
 *
 * Semua teks, tanggal, nama, dan alamat yang muncul di undangan diambil dari
 * sini — tidak ada yang di-hardcode di dalam komponen. Kalau pasangan lain
 * ingin memakai template ini, cukup ubah file ini saja.
 */

export const couple = {
  groom: {
    fullName: "Ricky Ravanelli, S.E.",
    shortName: "Ricky",
    father: "Mr. Hendra Ravanelli",
    mother: "Mrs. Lianawati Ravanelli",
    instagram: "groomricky",
    photo: "/images/groom.webp",
  },
  bride: {
    fullName: "Fellycia Indriyani Pratama, S.I.Kom.",
    shortName: "Fellycia",
    father: "Mr. Bambang Pratama",
    mother: "Mrs. Sylvia Indriyani",
    instagram: "bridefelly",
    photo: "/images/bride.webp",
  },
  hashtag: "#RickyFellinlove",
} as const;



/**
 * Tanggal acara dalam ISO 8601 lengkap dengan offset +07:00 (WIB).
 *
 * Offset ditulis eksplisit supaya countdown menghitung mundur ke waktu yang
 * sama untuk semua tamu, di zona waktu mana pun mereka membuka undangan.
 */
export const weddingDate = new Date("2026-12-26T11:00:00+07:00");

export const events = [
  {
    id: "matrimony",
    time: "11.00 WIB",
    venue: "GBT Kristus Alfa Omega Puri Anjasmoro",
    address: "Jalan Puri Anjasmoro No 10 Blok J1, Semarang",
    startsAt: new Date("2026-12-26T11:00:00+07:00"),
    endsAt: new Date("2026-12-26T13:00:00+07:00"),
  },
  {
    id: "reception",
    time: "18.00 WIB",
    venue: "MAC Ballroom",
    address: "Jalan Majapahit No 168, Gayamsari, Kec. Gayamsari, Kota Semarang",
    startsAt: new Date("2026-12-26T18:00:00+07:00"),
    endsAt: new Date("2026-12-26T21:00:00+07:00"),
  },
] as const;

/** Venue yang ditampilkan di peta (resepsi — acara utama untuk tamu undangan). */
export const mapVenue = events[1];

/**
 * Foto yang dipakai di luar galeri.
 * Semuanya hasil `npm run optimize-images` — lihat scripts/optimize-images.mjs.
 */
export const images = {
  /** Halaman pembuka. Potret tinggi, pas untuk layar HP. */
  cover: "/images/cover.webp",
  /**
   * Panel dekoratif di kiri pada tampilan desktop.
   * Sengaja memakai foto lanskap: panel ini melebar, sedangkan cover.webp
   * berbentuk potret tinggi (836x1881) yang akan terpotong habis di sana.
   */
  desktopPanel: "/images/moment.webp",
  welcoming: "/images/welcoming.webp",
  /** Latar belakang section hitung mundur. Nuansa hangat, teks krem. */
  countdown: "/images/gallery-4.webp",
  /** Latar belakang footer. Sengaja foto gelap agar teks putih terbaca. */
  footer: "/images/gallery-2.webp",
  /** Tekstur kain sutra, dipakai sebagai latar halus. */
  texture: "/images/texture.webp",
} as const;

/**
 * Foto galeri. Hanya path-nya di sini — teks alternatifnya ada di
 * `lib/i18n.ts` (`gallery.alts`), berpasangan menurut urutan yang sama.
 */
export const gallery = [
  { src: "/images/gallery-1.webp" },
  { src: "/images/gallery-2.webp" },
  { src: "/images/gallery-3.webp" },
  { src: "/images/gallery-4.webp" },
  { src: "/images/gallery-5.webp" },
] as const;

/**
 * Tautan yang dipakai di nav drawer. Urutannya mengikuti urutan section.
 *
 * Hanya id-nya yang di sini. Labelnya tinggal di `lib/i18n.ts` (`nav`)
 * karena ikut berganti saat tamu mengganti bahasa.
 */
export const navLinks = [
  { id: "couple" },
  { id: "details" },
  { id: "access" },
  { id: "gallery" },
  { id: "rsvp" },
  { id: "wishes" },
] as const;

/**
 * Musik latar.
 *
 * "Romantic Piano Inspiring" oleh PaulYudin, diunduh dari Pixabay:
 * https://pixabay.com/music/wedding-romantic-piano-inspiring-155910/
 *
 * Pixabay Content License membolehkan penggunaan komersial dan tidak
 * mewajibkan atribusi. Kredit di bawah tetap ditampilkan karena mencantumkan
 * sumber karya orang lain adalah hal yang pantas, bukan karena diharuskan.
 */
export const music = {
  src: "/audio/backsound.mp3",
  /** Judul karya dan nama pemusiknya — sama di bahasa mana pun. */
  title: "PaulYudin — Romantic Piano Inspiring",
} as const;

export const site = {
  /**
   * Alamat undangan setelah tayang. Dipakai metadataBase di app/layout.tsx
   * supaya URL gambar pratinjau jadi absolut — WhatsApp dan Facebook
   * mengabaikan URL relatif saat mengambil pratinjau tautan.
   *
   * Judul dan deskripsinya ada di lib/i18n.ts (`meta`) karena ikut
   * berganti bahasa.
   */
  url: "https://invitato-wedding-invitation-navy.vercel.app",
} as const;
