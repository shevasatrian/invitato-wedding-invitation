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
    role: "The Son of",
    father: "Mr. Hendra Ravanelli",
    mother: "Mrs. Lianawati Ravanelli",
    instagram: "groomricky",
    photo: "/images/groom.webp",
  },
  bride: {
    fullName: "Fellycia Indriyani Pratama, S.I.Kom.",
    shortName: "Fellycia",
    role: "The Daughter of",
    father: "Mr. Bambang Pratama",
    mother: "Mrs. Sylvia Indriyani",
    instagram: "bridefelly",
    photo: "/images/bride.webp",
  },
  hashtag: "#RickyFellinlove",
} as const;

export const verse = {
  text:
    "I was sound asleep, but in my dreams I was wide awake. " +
    "Oh, listen! It's the sound of my lover knocking, calling!",
  source: "Song of Songs 5:2 MSG",
} as const;

export const quote =
  "True love is when both people think they're the lucky one";

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
    title: "Holy Matrimony",
    time: "11.00 WIB",
    venue: "GBT Kristus Alfa Omega Puri Anjasmoro",
    address: "Jalan Puri Anjasmoro No 10 Blok J1, Semarang",
    startsAt: new Date("2026-12-26T11:00:00+07:00"),
    endsAt: new Date("2026-12-26T13:00:00+07:00"),
  },
  {
    id: "reception",
    title: "Wedding Reception",
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

export const gallery = [
  { src: "/images/gallery-1.webp", alt: "Ricky dan Fellycia di atas kapal layar saat matahari terbenam" },
  { src: "/images/gallery-2.webp", alt: "Ricky dan Fellycia bersulang di ruang bar berpanel kayu" },
  { src: "/images/gallery-3.webp", alt: "Ricky dan Fellycia berdiri di depan jendela tinggi" },
  { src: "/images/gallery-4.webp", alt: "Ricky dan Fellycia duduk berdampingan di bingkai jendela" },
  { src: "/images/gallery-5.webp", alt: "Fellycia berdiri di ambang jendela, Ricky bersandar menatapnya" },
] as const;

/** Tautan yang dipakai di nav drawer. Urutannya mengikuti urutan section. */
export const navLinks = [
  { id: "couple", label: "Groom & Bride" },
  { id: "details", label: "Wedding Details" },
  { id: "gallery", label: "Gallery" },
  { id: "rsvp", label: "RSVP" },
  { id: "wishes", label: "Kind Words" },
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
  credit: "Song by PaulYudin — Romantic Piano Inspiring",
} as const;

export const site = {
  title: "The Wedding of Ricky & Fellycia",
  description:
    "Together with joyful hearts, we cordially request the honor of your presence at our wedding celebration — 26 December 2026, Semarang.",
} as const;
