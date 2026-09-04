"use client";

import Image from "next/image";
import { useState } from "react";
import Section, { SectionTitle } from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";
import Lightbox from "@/components/ui/Lightbox";
import CoupleNames from "@/components/ui/CoupleNames";
import { couple, gallery, quote } from "@/lib/config";

/**
 * Galeri foto pre-wedding.
 *
 * Satu-satunya state di sini: indeks foto yang sedang dibuka layar penuh,
 * atau `null` kalau tidak ada. Lightbox-nya sendiri komponen terpisah.
 */
export default function Gallery() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <Section id="gallery">
      <SectionTitle>A Portrait Of</SectionTitle>

      <Reveal delay={100}>
        <p className="mt-5 text-center font-display text-2xl tracking-[0.05em] text-ink uppercase">
          <CoupleNames andClassName="mx-2 text-xl" />
        </p>

        <p className="mt-5 text-center font-body text-lg text-ink/75 italic">
          &ldquo;{quote}&rdquo;
        </p>
      </Reveal>

      {/* Foto pertama dibuat selebar dua kolom sebagai penarik perhatian,
          empat sisanya berpasangan. */}
      <div className="mt-10 grid grid-cols-2 gap-3">
        {gallery.map((photo, index) => (
          <Reveal
            key={photo.src}
            delay={index * 80}
            className={index === 0 ? "col-span-2" : ""}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(index)}
              aria-label={`Perbesar foto: ${photo.alt}`}
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

      <p className="mt-6 text-center font-script text-xl text-ink/60">
        {couple.hashtag}
      </p>

      <Lightbox
        photos={gallery}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onChange={setOpenIndex}
      />
    </Section>
  );
}
