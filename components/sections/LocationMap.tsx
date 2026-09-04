import Section, { SectionTitle } from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import { mapVenue } from "@/lib/config";
import { mapEmbedUrl, mapLinkUrl } from "@/lib/utils";

const query = `${mapVenue.venue}, ${mapVenue.address}`;

/**
 * Peta lokasi resepsi.
 *
 * Memakai URL embed Google Maps (`output=embed`) yang tidak memerlukan
 * API key — jadi tidak ada kunci rahasia yang harus dititipkan di repo
 * maupun di environment variable, dan tidak ada tagihan yang bisa membengkak.
 */
export default function LocationMap() {
  return (
    <Section id="location">
      <SectionTitle>Location</SectionTitle>

      <Reveal delay={100}>
        <p className="mt-6 text-center font-body text-lg text-ink/75">
          {mapVenue.venue}
        </p>
        <p className="mt-1 text-center font-body text-base text-ink/65">
          {mapVenue.address}
        </p>
      </Reveal>

      <Reveal delay={180}>
        <div className="relative mt-8 aspect-[4/3] w-full border border-ink/20">
          <iframe
            src={mapEmbedUrl(query)}
            title={`Peta lokasi ${mapVenue.venue}`}
            // lazy: peta baru dimuat saat tamu benar-benar men-scroll ke sini,
            // sehingga tidak memperlambat pemuatan awal undangan.
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-full w-full"
          />
        </div>
      </Reveal>

      <Reveal delay={240}>
        <div className="mt-8 text-center">
          <Button href={mapLinkUrl(query)} external>
            Buka di Google Maps
          </Button>
        </div>
      </Reveal>
    </Section>
  );
}
