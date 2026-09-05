import Image from "next/image";
import Section, { SectionTitle } from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";
import Divider from "@/components/ui/Divider";
import Button from "@/components/ui/Button";
import { couple } from "@/lib/config";
import type { Dict } from "@/lib/i18n";

/** Profil kedua mempelai beserta nama orang tua masing-masing. */
export default function CoupleProfile({ t }: { t: Dict }) {
  return (
    <Section id="couple">
      <SectionTitle>{t.couple.title}</SectionTitle>

      <PersonCard person={couple.groom} role={t.couple.sonOf} t={t} />
      <Divider className="my-14 text-ink/50" />
      <PersonCard person={couple.bride} role={t.couple.daughterOf} t={t} />
    </Section>
  );
}

/**
 * Satu kartu mempelai. Dipakai dua kali dengan data berbeda, sehingga
 * tampilan mempelai pria dan wanita dijamin persis sama.
 */
function PersonCard({
  person,
  role,
  t,
}: {
  person: typeof couple.groom | typeof couple.bride;
  /** "The Son of" atau "The Daughter of" — berbeda per mempelai. */
  role: string;
  t: Dict;
}) {
  return (
    <div className="mt-12 text-center">
      <Reveal>
        <div className="relative mx-auto w-[85%]">
          <div className="absolute -top-3 -right-3 h-full w-full border border-ink/25" />
          <Image
            src={person.photo}
            alt={person.fullName}
            width={1000}
            height={666}
            sizes="(min-width: 1024px) 420px, 85vw"
            className="relative h-auto w-full object-cover"
          />
        </div>
      </Reveal>

      <Reveal delay={120}>
        <h3 className="mt-8 font-display text-2xl text-ink">
          {person.fullName}
        </h3>

        <p className="mt-4 font-body text-base font-semibold text-ink/80">
          {role}
        </p>
        <p className="font-body text-base text-ink/80">{person.father}</p>
        <p className="font-script text-lg text-ink/80">&amp;</p>
        <p className="font-body text-base text-ink/80">{person.mother}</p>

        <Button
          href={`https://www.instagram.com/${person.instagram}`}
          external
          className="mt-6 px-6 py-2 text-xs"
          aria-label={t.couple.instagram.replace("{name}", person.fullName)}
        >
          @{person.instagram}
        </Button>
      </Reveal>
    </div>
  );
}
