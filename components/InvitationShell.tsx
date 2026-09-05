import Image from "next/image";
import CoupleNames from "@/components/ui/CoupleNames";
import { images } from "@/lib/config";
import type { Dict, Lang } from "@/lib/i18n";

/**
 * Kerangka halaman, meniru cara template Invitato tampil di desktop.
 *
 *   Mobile  : satu kolom penuh. Undangannya saja.
 *   Desktop : layar dibagi dua. Kiri sebuah foto besar yang DIAM di tempat
 *             saat halaman di-scroll, kanan kolom selebar ~512px berisi
 *             seluruh undangan (persis tampilan mobile-nya).
 *
 * Panel kiri dibuat "diam" dengan `sticky top-0 h-screen`: ia ikut mengalir
 * dalam layout biasa, tapi berhenti menempel begitu menyentuh atas layar.
 * Ini lebih sederhana daripada `position: fixed`, yang mengharuskan kita
 * menghitung sendiri margin kolom kanan supaya tidak tertimpa.
 */
export default function InvitationShell({
  t,
  lang,
  children,
}: {
  t: Dict;
  /**
   * Bahasa isi undangan. Dipasang di <main>, bukan di <html>, karena
   * layout tidak menerima searchParams. Pembaca layar memakai atribut
   * lang terdekat, jadi menandainya di sini sudah benar.
   */
  lang: Lang;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-[1600px]">
      <DesktopPanel t={t} />

      {/* 32rem = 512px, sedikit lebih lebar dari layar HP terbesar,
          sehingga tata letak mobile tetap terasa lapang di desktop. */}
      <main
        lang={lang}
        className="w-full bg-mist lg:w-[32rem] lg:shrink-0 lg:shadow-2xl lg:shadow-charcoal/20"
      >
        {children}
      </main>
    </div>
  );
}

/**
 * Panel dekoratif di kiri, hanya tampil pada layar >= 1024px.
 *
 * Ditandai `aria-hidden` karena isinya mengulang informasi yang sudah ada
 * di halaman sampul: pembaca layar tidak perlu mendengar nama pengantin dan
 * ayat yang sama dua kali.
 */
function DesktopPanel({ t }: { t: Dict }) {
  return (
    <aside
      aria-hidden="true"
      className="sticky top-0 hidden h-screen flex-1 overflow-hidden lg:block"
    >
      <Image
        src={images.desktopPanel}
        alt=""
        fill
        priority
        sizes="(min-width: 1024px) 60vw, 0px"
        className="object-cover"
      />

      {/* Sisi kiri foto ini berupa panel kayu gelap. Gradien menggelapkannya
          sedikit lagi supaya teks krem di atasnya punya kontras yang cukup,
          tanpa menutupi cahaya jendela di tengah foto. */}
      <div className="absolute inset-0 bg-gradient-to-r from-charcoal/75 via-charcoal/25 to-transparent" />

      <div className="relative flex h-full flex-col justify-center p-14 xl:p-20">
        <p className="font-display text-sm tracking-[0.32em] text-cream/75 uppercase">
          {t.cover.theWeddingOf}
        </p>

        <p className="mt-5 font-display text-5xl tracking-[0.06em] text-cream uppercase xl:text-6xl">
          <CoupleNames t={t} andClassName="mx-3 text-4xl xl:text-5xl" />
        </p>

        <p className="mt-8 max-w-md font-body text-lg leading-relaxed text-cream/80 italic">
          &ldquo;{t.verse.text}&rdquo;
        </p>

        <p className="mt-3 font-body text-base text-cream/65">
          &mdash; {t.verse.source}
        </p>
      </div>
    </aside>
  );
}
