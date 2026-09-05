"use client";

import Image from "next/image";
import { useState } from "react";
import Section, { SectionTitle } from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";
import Lightbox from "@/components/ui/Lightbox";
import CoupleNames from "@/components/ui/CoupleNames";
import { couple, gallery } from "@/lib/config";
import type { Dict } from "@/lib/i18n";

/**
 * Galeri foto pre-wedding.
 *
 * Satu-satunya state di sini: indeks foto yang sedang dibuka layar penuh,
 * atau `null` kalau tidak ada. Lightbox-nya sendiri komponen terpisah.
 */
export default function Gallery({ t }: { t: Dict }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // src ada di config (fakta), alt ada di kamus (kalimat). Keduanya
  // dipasangkan sekali di sini menurut urutan yang sama.
  const photos = gallery.map((photo, index) => ({
    src: photo.src,
    alt: t.gallery.alts[index],
  }));

  return (
    <Section id="gallery">
      <SectionTitle>{t.gallery.title}</SectionTitle>

      <Reveal delay={100}>
        <p className="mt-5 text-center font-display text-2xl tracking-[0.05em] text-ink uppercase">
          <CoupleNames t={t} andClassName="mx-2 text-xl" />
        </p>

        <p className="mt-5 text-center font-body text-lg text-ink/80 italic">
          &ldquo;{t.gallery.quote}&rdquo;
        </p>
      </Reveal>

      {/* Foto pertama dibuat selebar dua kolom sebagai penarik perhatian,
          empat sisanya berpasangan. */}
      <div className="mt-10 grid grid-cols-2 gap-3">
        {photos.map((photo, index) => (
          <Reveal
            key={photo.src}
            delay={index * 80}
            className={index === 0 ? "col-span-2" : ""}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(index)}
              aria-label={t.gallery.zoom.replace("{alt}", photo.alt)}
              className="group relative block w-full overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                width={1200}
                height={index === 0 ? 800 : 900}
                sizes="(min-width: 1024px) 256px, 50vw"
                className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${
                  index === 0 ? "aspect-[3/2]" : "aspect-[3/4]"
                }`}
              />
            </button>
          </Reveal>
        ))}
      </div>

      <p className="mt-6 text-center font-script text-xl text-ink/80">
        {couple.hashtag}
      </p>

      <Lightbox
        t={t}
        photos={photos}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onChange={setOpenIndex}
      />
    </Section>
  );
}
