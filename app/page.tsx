import InvitationShell from "@/components/InvitationShell";
import Section, { SectionTitle } from "@/components/ui/Section";
import Divider from "@/components/ui/Divider";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import Field, { inputClasses } from "@/components/ui/Field";
import { couple, verse } from "@/lib/config";

/**
 * SEMENTARA — halaman contoh untuk menguji design system.
 * Akan diganti dengan susunan section undangan yang sebenarnya.
 */
export default function Home() {
  return (
    <InvitationShell>
      <Section className="text-center">
        <Reveal>
          <p className="font-display text-xs tracking-[0.3em] text-ink/60 uppercase">
            The Wedding Of
          </p>
        </Reveal>

        <Reveal delay={100}>
          <h1 className="mt-6 font-display text-4xl tracking-[0.05em] text-ink uppercase">
            {couple.groom.shortName}
            <span className="mx-2 font-script text-3xl normal-case">and</span>
            {couple.bride.shortName}
          </h1>
        </Reveal>

        <Reveal delay={200}>
          <p className="mt-6 font-body text-lg leading-relaxed text-ink/75 italic">
            &ldquo;{verse.text}&rdquo;
          </p>
          <p className="mt-3 font-display text-xs tracking-[0.15em] text-ink/60 uppercase">
            &mdash; {verse.source}
          </p>
        </Reveal>

        <Divider className="mt-12 text-ink/50" />
      </Section>

      <Section className="bg-cream">
        <SectionTitle>Contoh Section</SectionTitle>

        <Reveal delay={100}>
          <div className="mt-10 space-y-6">
            <Field id="demo-name" label="Nama:" hint="contoh isian form">
              <input
                id="demo-name"
                className={inputClasses}
                placeholder="Nama Anda"
              />
            </Field>

            <Field id="demo-error" label="Dengan error:" error="Nama minimal 2 karakter">
              <input id="demo-error" className={inputClasses} defaultValue="A" />
            </Field>

            <div className="flex flex-wrap justify-center gap-3">
              <Button>Tombol Solid</Button>
              <Button variant="outline">Tombol Outline</Button>
            </div>
          </div>
        </Reveal>
      </Section>

      <Section className="text-center">
        <SectionTitle>Ritme Vertikal</SectionTitle>
        <Reveal delay={100}>
          <p className="mt-6 font-body text-lg text-ink/75">
            Section ini ada supaya halaman cukup panjang untuk menguji panel
            kiri yang diam saat di-scroll dan animasi munculnya konten.
          </p>
        </Reveal>
        <Divider className="mt-12 text-ink/50" />
      </Section>
    </InvitationShell>
  );
}
