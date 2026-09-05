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
    access: "Access Card",
    gallery: "Gallery",
    rsvp: "RSVP",
    wishes: "Kind Words",
  },

  language: {
    label: "Language",
    /** Nama lengkap tiap bahasa, dipakai untuk aria-label tombol. */
    names: { en: "English", id: "Bahasa Indonesia" },
    switchTo: "Switch to {lang}",
    current: "Current language: {lang}",
  },

  meta: {
    title: "The Wedding of Ricky & Fellycia",
    description:
      "Together with joyful hearts, we cordially request the honor of your presence at our wedding celebration — 26 December 2026, Semarang.",
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

  accessCard: {
    title: "Access Card",
    intro: "Please show this card when you arrive.",
    guest: "Guest",
    honoredGuest: "Honored Guest",
    qrAlt: "Decorative QR code containing the link to this invitation",
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

  rsvp: {
    title: "RSVP",
    intro: "It would be an honour if you could confirm your attendance.",
    name: "Name",
    namePlaceholder: "Your name",
    attendance: "Will you attend?",
    choose: "Choose one",
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
    intro: "Your prayers and wishes are the most meaningful gift to us.",
    name: "Name",
    namePlaceholder: "Your name",
    message: "Message",
    messagePlaceholder: "Write your wishes and prayers…",
    submit: "Send Wishes",
    sending: "Sending…",
    failed: "Failed to send your wishes.",
    offline: "Cannot reach the server. Please check your connection.",
    received: "Thank you, we have received your wishes.",
    loading: "Loading wishes…",
    listFailed: "The list of wishes cannot be loaded right now.",
    empty: "No wishes yet. Be the first.",
  },

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
    access: "Kartu Undangan",
    gallery: "Galeri",
    rsvp: "Konfirmasi",
    wishes: "Ucapan & Doa",
  },

  language: {
    label: "Bahasa",
    names: { en: "English", id: "Bahasa Indonesia" },
    switchTo: "Ganti ke {lang}",
    current: "Bahasa saat ini: {lang}",
  },

  meta: {
    title: "Pernikahan Ricky & Fellycia",
    description:
      "Dengan penuh sukacita, kami mengundang Bapak/Ibu/Saudara untuk hadir di pernikahan kami — 26 Desember 2026, Semarang.",
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

  accessCard: {
    title: "Kartu Undangan",
    intro: "Mohon tunjukkan kartu ini saat tiba di lokasi.",
    guest: "Tamu",
    honoredGuest: "Tamu Undangan",
    qrAlt: "Kode QR hiasan berisi tautan undangan ini",
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

  rsvp: {
    title: "RSVP",
    intro:
      "Merupakan suatu kehormatan bagi kami apabila Anda berkenan mengonfirmasi kehadiran.",
    name: "Nama",
    namePlaceholder: "Nama Anda",
    attendance: "Konfirmasi Kehadiran",
    choose: "Pilih salah satu",
    attending: "Ya, saya akan hadir",
    notAttending: "Maaf, saya berhalangan",
    guestCount: "Jumlah Orang",
    guestCountHint: "Termasuk Anda sendiri, maksimal 10 orang.",
    submit: "Kirim Konfirmasi",
    sending: "Mengirim…",
    failed: "Gagal mengirim konfirmasi.",
    offline: "Tidak bisa menghubungi server. Periksa koneksi Anda.",
    thankYou: "Terima kasih",
    received: "Konfirmasi Anda sudah kami terima.",
    another: "Isi untuk tamu lain",
    summary: "{attending} hadir · {notAttending} berhalangan · {pax} orang",
  },

  wishes: {
    title: "Ucapan & Doa",
    intro: "Doa dan ucapan Anda adalah hadiah yang paling berarti bagi kami.",
    name: "Nama",
    namePlaceholder: "Nama Anda",
    message: "Ucapan",
    messagePlaceholder: "Tuliskan doa dan ucapan Anda…",
    submit: "Kirim Ucapan",
    sending: "Mengirim…",
    failed: "Gagal mengirim ucapan.",
    offline: "Tidak bisa menghubungi server. Periksa koneksi Anda.",
    received: "Terima kasih, ucapan Anda sudah kami terima.",
    loading: "Memuat ucapan…",
    listFailed: "Daftar ucapan sedang tidak bisa dimuat.",
    empty: "Belum ada ucapan. Jadilah yang pertama.",
  },

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

/**
 * Label pendek pada tombol bahasa. Bukan kalimat melainkan kode, jadi
 * bunyinya sama di bahasa mana pun dan tidak perlu masuk kamus.
 */
export const languageCodes: Record<Lang, string> = { en: "EN", id: "ID" };

/** Urutan tampil pada tombol bahasa. */
export const languages: Lang[] = ["en", "id"];

/** Apa pun selain "id" dianggap Inggris — termasuk nilai kosong dan asing. */
export function pickLang(raw?: string): Lang {
  return raw === "id" ? "id" : "en";
}
