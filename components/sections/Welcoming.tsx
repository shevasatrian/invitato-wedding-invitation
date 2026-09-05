import Image from "next/image";
import Section from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";
import Divider from "@/components/ui/Divider";
import CoupleNames from "@/components/ui/CoupleNames";
import { couple, images } from "@/lib/config";
import type { Dict } from "@/lib/i18n";

/** Sambutan pembuka, tepat setelah tamu menekan "Open Invitation". */
export default function Welcoming({ t }: { t: Dict }) {
  return (
    <Section id="welcoming" className="relative overflow-hidden bg-cream">
      {/* Tekstur kain sutra dari asset pack, dibuat sangat samar supaya
          hanya terasa sebagai permukaan, bukan gambar tersendiri. */}
      <Image
        src={images.texture}
        alt=""
        fill
        sizes="(min-width: 1024px) 512px, 100vw"
        className="object-cover opacity-40"
      />

      <div className="relative text-center">
        <Reveal>
          {/* whitespace-pre-line: pemenggalan barisnya ikut kamus, bukan
              <br /> yang dipaku di sini — panjang kalimat tiap bahasa beda. */}
          <p className="font-body text-lg whitespace-pre-line text-ink/75">
            {t.welcoming.intro}
          </p>
        </Reveal>

        <Reveal delay={120}>
          <p className="mt-8 font-display text-3xl tracking-[0.05em] text-ink uppercase">
            <CoupleNames andClassName="mx-2 text-2xl" />
          </p>
        </Reveal>

        <Reveal delay={200}>
          <p className="mt-4 font-script text-2xl text-ink/70">
            {couple.hashtag}
          </p>
        </Reveal>

        <Reveal delay={280}>
          {/* Bingkai bertumpuk: sebuah kotak bergaris digeser sedikit ke
              kiri-atas di belakang foto, meniru gaya frame template referensi. */}
          <div className="relative mx-auto mt-12 w-[78%]">
            <div className="absolute -top-4 -left-4 h-full w-full border border-ink/25" />
            <Image
              src={images.welcoming}
              alt={`${couple.groom.shortName} dan ${couple.bride.shortName}`}
              width={1000}
              height={1500}
              sizes="(min-width: 1024px) 400px, 78vw"
              className="relative h-auto w-full object-cover"
            />
          </div>
        </Reveal>

        <Divider className="mt-16 text-ink/50" />
      </div>
    </Section>
  );
}
