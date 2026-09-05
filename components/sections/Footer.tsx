import Image from "next/image";
import CoupleNames from "@/components/ui/CoupleNames";
import { couple, images, music, weddingDate } from "@/lib/config";
import type { Dict } from "@/lib/i18n";

/** Penutup undangan. */
export default function Footer({ t }: { t: Dict }) {
  return (
    <footer className="relative overflow-hidden px-7 py-24 text-center">
      <Image
        src={images.footer}
        alt=""
        fill
        sizes="(min-width: 1024px) 512px, 100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-charcoal/75" />

      <div className="relative">
        <p className="font-display text-sm tracking-[0.3em] text-white/85 uppercase">
          {t.footer.thankYou}
        </p>

        <p className="mt-6 font-display text-3xl tracking-[0.05em] text-white uppercase">
          <CoupleNames t={t} andClassName="mx-2 text-2xl" />
        </p>

        <p className="mt-4 font-script text-xl text-white/75">
          {couple.hashtag}
        </p>

        <div className="mt-14 space-y-1 font-body text-sm text-white/55">
          <p>
            {t.footer.songBy} {music.title}
          </p>
          <p>
            &copy; {weddingDate.getFullYear()} {couple.groom.shortName} &amp;{" "}
            {couple.bride.shortName}. {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
