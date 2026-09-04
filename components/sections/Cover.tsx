import Image from "next/image";
import Button from "@/components/ui/Button";
import CoupleNames from "@/components/ui/CoupleNames";
import { couple, verse, images } from "@/lib/config";

/**
 * Halaman sampul — yang pertama dilihat tamu.
 *
 * Selama tombol "Open Invitation" belum ditekan, scroll halaman dikunci
 * (lihat components/Invitation.tsx), jadi section ini berfungsi sebagai
 * gerbang: isi undangan baru bisa dijangkau setelah tamu membukanya.
 */
export default function Cover({
  /** Nama tamu dari `?to=` di URL. Kosong kalau tautannya tidak dipersonalisasi. */
  guestName,
  onOpen,
}: {
  guestName?: string;
  onOpen: () => void;
}) {
  return (
    <section className="relative flex h-[100svh] flex-col items-center justify-end overflow-hidden px-7 pb-16 text-center">
      <Image
        src={images.cover}
        alt={`${couple.groom.shortName} dan ${couple.bride.shortName}`}
        fill
        priority
        sizes="(min-width: 1024px) 512px, 100vw"
        className="object-cover"
      />

      {/* Foto ini didominasi dinding putih terang, jadi lapisan gelapnya
          harus cukup pekat agar teks putih tetap terbaca — bukan sekadar
          gradien tipis di tepi bawah. */}
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/65 to-charcoal/30" />

      <div className="relative flex flex-col items-center">
        <p className="font-display text-[0.7rem] tracking-[0.35em] text-white/80 uppercase">
          The Wedding Of
        </p>

        <h1 className="mt-5 font-display text-4xl tracking-[0.05em] text-white uppercase sm:text-5xl">
          <CoupleNames andClassName="mx-2 text-3xl sm:text-4xl" />
        </h1>

        <p className="mt-6 max-w-sm font-body text-base leading-relaxed text-white/85 italic">
          &ldquo;{verse.text}&rdquo;
        </p>

        <p className="mt-3 font-display text-[0.65rem] tracking-[0.2em] text-white/70 uppercase">
          &mdash; {verse.source}
        </p>

        {guestName && (
          <p className="mt-10 font-body text-base text-white/85">
            Dear Mr/Mrs/Ms,
            <span className="mt-1 block text-xl text-white">{guestName}</span>
          </p>
        )}

        <Button
          onClick={onOpen}
          className="mt-10 border border-white/50 bg-white/10 text-white backdrop-blur-sm hover:bg-white hover:text-ink"
        >
          Open Invitation
        </Button>
      </div>
    </section>
  );
}
