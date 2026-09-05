import type { Metadata } from "next";
import {
  Marcellus,
  Cormorant_Upright,
  Montserrat,
  Parisienne,
} from "next/font/google";
import "./globals.css";
import { site } from "@/lib/config";

/**
 * Empat font, masing-masing punya tugas sendiri.
 *
 * Tiga yang pertama sama persis dengan template referensi Invitato.
 * Yang keempat, Parisienne, adalah pengganti "Boheme Floral" — font script
 * berbayar yang dipakai template asli untuk kata "and" dan hashtag.
 *
 * next/font mengunduh font saat build dan menyajikannya dari domain sendiri,
 * jadi tidak ada request ke Google saat halaman dibuka (lebih cepat sekaligus
 * tidak membocorkan data tamu ke pihak ketiga).
 */
const marcellus = Marcellus({
  variable: "--font-marcellus",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const cormorant = Cormorant_Upright({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

const parisienne = Parisienne({
  variable: "--font-parisienne",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

/**
 * Hanya `metadataBase` yang tinggal di sini.
 *
 * Layout tidak menerima `searchParams`, jadi ia tidak bisa tahu bahasa yang
 * diminta tamu — judul dan deskripsi karena itu dibuat di `generateMetadata`
 * pada app/page.tsx.
 *
 * Gambar pratinjau dan ikon tidak perlu disebut sama sekali: Next mengambilnya
 * dari konvensi nama berkas (app/opengraph-image.jpg, app/icon.png). Tugas
 * `metadataBase` adalah mengubah path-nya menjadi URL absolut, karena WhatsApp
 * dan Facebook mengabaikan URL relatif saat mengambil pratinjau.
 */
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      // globals.css memasang `scroll-behavior: smooth` supaya tautan nav
      // meluncur halus ke section tujuan. Sejak Next.js 16, atribut ini
      // diperlukan agar Next tetap mematikan smooth-scroll sementara saat
      // pindah halaman — kalau tidak, perpindahan halaman ikut ter-animasi.
      data-scroll-behavior="smooth"
      className={`${marcellus.variable} ${cormorant.variable} ${montserrat.variable} ${parisienne.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
