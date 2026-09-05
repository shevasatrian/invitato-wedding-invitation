import type { Dict, Lang } from "@/lib/i18n";
import { site } from "@/lib/config";

/** Fungsi-fungsi kecil tanpa efek samping. Semuanya punya test di tests/utils.test.ts. */

export type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** true kalau tanggal acara sudah lewat. */
  isOver: boolean;
};

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Menghitung sisa waktu dari `now` sampai `target`.
 * Kalau target sudah lewat, semua angka jadi 0 dan `isOver` true —
 * jadi komponen countdown tidak perlu menangani angka negatif.
 */
export function getTimeLeft(target: Date, now: Date = new Date()): TimeLeft {
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true };
  }

  return {
    days: Math.floor(diff / DAY),
    hours: Math.floor((diff % DAY) / HOUR),
    minutes: Math.floor((diff % HOUR) / MINUTE),
    seconds: Math.floor((diff % MINUTE) / SECOND),
    isOver: false,
  };
}

/** Menambah nol di depan supaya countdown tidak "melompat" lebarnya: 9 -> "09". */
export function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/**
 * Membuat URL "tambahkan ke Google Calendar".
 * Google meminta waktu dalam format UTC tanpa pemisah: 20261226T040000Z.
 */
export function googleCalendarUrl(event: {
  title: string;
  details: string;
  location: string;
  startsAt: Date;
  endsAt: Date;
}): string {
  const format = (date: Date) =>
    date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    details: event.details,
    location: event.location,
    dates: `${format(event.startsAt)}/${format(event.endsAt)}`,
  });

  return `https://calendar.google.com/calendar/render?${params}`;
}

/** URL embed Google Maps. Cara ini tidak memerlukan API key. */
export function mapEmbedUrl(query: string): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
}

/** URL untuk membuka Google Maps di tab/aplikasi baru. */
export function mapLinkUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

/**
 * Waktu relatif dalam Bahasa Indonesia untuk daftar wishes: "2 jam lalu".
 * Lewat 7 hari, tanggal penuh lebih berguna daripada "23 hari lalu".
 */
/**
 * Menerima kamus utuh, bukan hanya `t.time`, karena tanggal yang sudah
 * lewat seminggu diformat memakai `t.locale`. Satu nilai locale di satu
 * tempat saja — kalau disalin ke dalam grup `time`, cepat atau lambat
 * keduanya berselisih.
 */
export function timeAgo(date: Date, now: Date, t: Dict): string {
  const diff = now.getTime() - date.getTime();

  /** Menyisipkan angka ke penanda {n} pada teks kamus. */
  const ago = (template: string, n: number) =>
    template.replace("{n}", String(n));

  if (diff < MINUTE) return t.time.justNow;
  if (diff < HOUR) return ago(t.time.minutes, Math.floor(diff / MINUTE));
  if (diff < DAY) return ago(t.time.hours, Math.floor(diff / HOUR));
  if (diff < 7 * DAY) return ago(t.time.days, Math.floor(diff / DAY));

  return date.toLocaleDateString(t.locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** "Sabtu, 26 Desember 2026" — dipakai di section Wedding Details. */
export function formatEventDate(date: Date, locale: string): string {
  return date.toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  });
}

/**
 * Alamat undangan ini secara lengkap, termasuk nama tamu kalau ada.
 *
 * Dipakai sebagai isi QR pada Access Card, jadi URL-nya WAJIB absolut —
 * kode QR dibaca dari kamera ponsel yang tidak punya konteks halaman ini.
 * Inggris adalah bahasa default, jadi `lang` hanya ditulis untuk Indonesia.
 */
export function invitationUrl(guestName?: string, lang: Lang = "en"): string {
  const params = new URLSearchParams();
  if (guestName) params.set("to", guestName);
  if (lang === "id") params.set("lang", "id");

  return params.size > 0 ? `${site.url}/?${params}` : site.url;
}

/**
 * Tautan menuju halaman ini dalam bahasa `target`.
 *
 * Relatif, bukan absolut — ini tautan dalam halaman. Bandingkan dengan
 * `invitationUrl` di atas yang WAJIB absolut karena isinya dibaca kamera.
 *
 * Inggris adalah bahasa default, jadi `lang=en` tidak pernah ditulis: URL
 * tidak menumpuk parameter yang tidak mengubah apa pun.
 */
export function languageHref(target: Lang, guestName?: string): string {
  const params = new URLSearchParams();
  if (guestName) params.set("to", guestName);
  if (target === "id") params.set("lang", "id");

  return params.size > 0 ? `/?${params}` : "/";
}
