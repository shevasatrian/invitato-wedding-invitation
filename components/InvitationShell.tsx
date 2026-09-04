import Image from "next/image";
import CoupleNames from "@/components/ui/CoupleNames";
import { verse, images } from "@/lib/config";

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
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-[1600px]">
      <DesktopPanel />

      {/* 32rem = 512px, sedikit lebih lebar dari layar HP terbesar,
          sehingga tata letak mobile tetap terasa lapang di desktop. */}
      <main className="w-full bg-mist lg:w-[32rem] lg:shrink-0 lg:shadow-2xl lg:shadow-charcoal/20">
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
function DesktopPanel() {
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
          The Wedding Of
        </p>

        <p className="mt-5 font-display text-5xl tracking-[0.06em] text-cream uppercase xl:text-6xl">
          <CoupleNames andClassName="mx-3 text-4xl xl:text-5xl" />
        </p>

        <p className="mt-8 max-w-md font-body text-lg leading-relaxed text-cream/80 italic">
          &ldquo;{verse.text}&rdquo;
        </p>

        <p className="mt-3 font-body text-base text-cream/65">
          &mdash; {verse.source}
        </p>
      </div>
    </aside>
  );
}
