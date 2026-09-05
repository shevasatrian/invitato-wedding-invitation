"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import Section from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import { couple, events, images, weddingDate } from "@/lib/config";
import { getTimeLeft, googleCalendarUrl, pad, type TimeLeft } from "@/lib/utils";
import type { Dict } from "@/lib/i18n";

const matrimony = events[0];

export default function Countdown({ t }: { t: Dict }) {
  /**
   * Sengaja mulai dari `null`, bukan dari hasil hitungan.
   *
   * Halaman ini dirender lebih dulu di server. Jam server dan jam browser
   * tamu tidak pernah persis sama, jadi kalau angkanya dihitung saat render
   * server, React akan menemukan angka berbeda saat hydration dan protes.
   * Karena itu hitungan baru dimulai lewat useEffect — yang hanya berjalan
   * di browser.
   */
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const tick = () => setTimeLeft(getTimeLeft(weddingDate));

    tick(); // tampilkan angka pertama tanpa menunggu 1 detik
    const timer = setInterval(tick, 1000);

    // Hentikan timer saat komponen dilepas, supaya tidak ada interval
    // yang terus berjalan di latar belakang.
    return () => clearInterval(timer);
  }, []);

  return (
    <Section className="relative overflow-hidden">
      <Image
        src={images.countdown}
        alt=""
        fill
        sizes="(min-width: 1024px) 512px, 100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-charcoal/65" />

      <div className="relative text-center">
        <Reveal>
          <h2 className="font-display text-2xl tracking-[0.12em] text-white">
            {t.countdown.title}
          </h2>
        </Reveal>

        <Reveal delay={120}>
          <div className="mt-10 flex items-start justify-center gap-3 sm:gap-5">
            <Unit value={timeLeft?.days} label={t.countdown.days} digits={3} />
            <Colon />
            <Unit value={timeLeft?.hours} label={t.countdown.hours} />
            <Colon />
            <Unit value={timeLeft?.minutes} label={t.countdown.minutes} />
            <Colon />
            <Unit value={timeLeft?.seconds} label={t.countdown.seconds} />
          </div>
        </Reveal>

        {timeLeft?.isOver && (
          <p className="mt-8 font-body text-lg text-white/90 italic">
            {t.countdown.over}
          </p>
        )}

        <Reveal delay={220}>
          <Button
            href={googleCalendarUrl({
              title: `The Wedding of ${couple.groom.shortName} & ${couple.bride.shortName}`,
              details: `${matrimony.title} — ${matrimony.venue}`,
              location: `${matrimony.venue}, ${matrimony.address}`,
              startsAt: matrimony.startsAt,
              endsAt: matrimony.endsAt,
            })}
            external
            className="mt-12 border border-white/50 bg-white/10 text-white backdrop-blur-sm hover:bg-white hover:text-ink"
          >
            {t.countdown.save}
          </Button>
        </Reveal>
      </div>
    </Section>
  );
}

/**
 * Satu satuan waktu.
 *
 * `digits` memaksa lebar minimum angka supaya tata letaknya tidak bergeser
 * setiap detik berubah dari, misalnya, "10" menjadi "9".
 */
function Unit({
  value,
  label,
  digits = 2,
}: {
  value: number | undefined;
  label: string;
  digits?: number;
}) {
  return (
    <div className="min-w-14 text-center">
      <p className="font-display text-3xl text-white tabular-nums sm:text-4xl">
        {/* Sebelum hitungan dimulai di browser, tampilkan garis penahan
            tempat supaya tidak ada lompatan tata letak. */}
        {value === undefined ? "--" : pad(value).padStart(digits, "0")}
      </p>
      <p className="mt-2 font-display text-[0.6rem] tracking-[0.2em] text-white/70 uppercase">
        {label}
      </p>
    </div>
  );
}

function Colon() {
  return (
    <span aria-hidden="true" className="font-display text-3xl text-white/40">
      :
    </span>
  );
}
