import Section from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";
import Divider from "@/components/ui/Divider";
import Button from "@/components/ui/Button";
import { events, weddingDate } from "@/lib/config";
import { formatEventDate, mapLinkUrl } from "@/lib/utils";

/** Tanggal, jam, dan lokasi kedua acara. */
export default function EventDetails() {
  return (
    <Section id="details" className="bg-cream">
      <div className="text-center">
        <Reveal>
          {/* Ini heading section-nya, bukan sekadar teks hiasan: nav drawer
              menautkan ke sini, dan pengguna pembaca layar berpindah antar
              bagian lewat daftar heading. Tampilannya tidak berubah. */}
          <h2 className="font-display text-[0.7rem] tracking-[0.25em] text-ink/80 uppercase">
            Save the Date
          </h2>
          <p className="mt-4 font-display text-2xl tracking-[0.06em] text-ink">
            {formatEventDate(weddingDate)}
          </p>
        </Reveal>

        <Divider className="mt-10 text-ink/50" />

        {events.map((event, index) => (
          <div key={event.id}>
            {/* Garis vertikal tipis sebagai jeda antar dua acara,
                seperti pada template referensi. */}
            {index > 0 && (
              <span
                aria-hidden="true"
                className="mx-auto my-10 block h-14 w-px bg-ink/25"
              />
            )}

            <Reveal delay={index * 100} className={index === 0 ? "mt-10" : ""}>
              <h3 className="font-display text-[0.7rem] tracking-[0.25em] text-ink/80 uppercase">
                {event.title}
              </h3>

              <p className="mt-3 font-display text-3xl text-ink">
                {event.time}
              </p>

              <p className="mt-5 font-body text-lg font-semibold text-ink">
                {event.venue}
              </p>
              <p className="mt-1 font-body text-base text-ink/75">
                {event.address}
              </p>

              <Button
                href={mapLinkUrl(`${event.venue}, ${event.address}`)}
                external
                variant="outline"
                className="mt-6 px-6 py-2 text-xs"
              >
                See Location
              </Button>
            </Reveal>
          </div>
        ))}
      </div>
    </Section>
  );
}
