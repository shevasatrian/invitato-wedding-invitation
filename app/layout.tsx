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
 * Gambar pratinjau tautan diambil Next dari app/opengraph-image.jpg lewat
 * konvensi nama berkas — tidak perlu disebut di sini. metadataBase yang
 * mengubah path-nya jadi URL absolut. Twitter mewarisi gambar yang sama,
 * jadi cukup satu berkas.
 */
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.title,
  description: site.description,
  openGraph: {
    title: site.title,
    description: site.description,
    type: "website",
    url: site.url,
  },
  twitter: { card: "summary_large_image" },
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
