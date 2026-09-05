"use client";

import { useEffect, useState } from "react";

import Section, { SectionTitle } from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";
import Divider from "@/components/ui/Divider";
import Button from "@/components/ui/Button";
import Field, { inputClasses } from "@/components/ui/Field";
import { rsvpSchema, toFieldErrors } from "@/lib/schemas";
import type { Dict } from "@/lib/i18n";

/**
 * Form konfirmasi kehadiran.
 *
 * Alurnya: safeParse di browser -> kalau lolos baru fetch ke /api/rsvp ->
 * server memvalidasi ulang dengan schema yang sama -> simpan ke Postgres.
 * Aturan validasinya sendiri hanya ditulis sekali, di `lib/schemas.ts`.
 *
 * Bentuk komponen ini sengaja dibuat mirip `Wishes.tsx`. Keduanya berdiri
 * sendiri tanpa hook bersama: satu form cukup dibaca dari atas ke bawah
 * tanpa harus membuka file lain dulu.
 */

type Summary = {
  attending: number;
  notAttending: number;
  totalPax: number;
};

/** Isi form apa adanya — semuanya string, persis seperti yang diketik tamu. */
const EMPTY_FORM = { guestName: "", attendance: "", guestCount: "1" };

/**
 * Mengambil ringkasan kehadiran dari server.
 *
 * Ditulis di luar komponen supaya bisa dipanggil dari `useEffect` maupun
 * setelah submit, tanpa ikut jadi dependency yang harus diurus React.
 * Mengembalikan null kalau gagal — ringkasan hanya pelengkap, kegagalannya
 * tidak boleh mengganggu tamu yang sedang mengisi form.
 */
async function fetchSummary(): Promise<Summary | null> {
  try {
    const response = await fetch("/api/rsvp");
    if (!response.ok) return null;
    return (await response.json()) as Summary;
  } catch {
    return null;
  }
}

export default function Rsvp({ t }: { t: Dict }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );
  const [serverError, setServerError] = useState("");
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    fetchSummary().then(setSummary);
  }, []);

  function update(field: keyof typeof EMPTY_FORM, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    // Validasi pertama: di browser. Kalau gagal, tidak ada request sama
    // sekali — tamu langsung tahu kesalahannya tanpa menunggu jaringan.
    const parsed = rsvpSchema(t.errors).safeParse(form);
    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error));
      setStatus("idle");
      return;
    }

    setErrors({});
    setServerError("");
    setStatus("sending");

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const json = (await response.json()) as {
        error?: string;
        fieldErrors?: Record<string, string>;
      };

      if (!response.ok) {
        setErrors(json.fieldErrors ?? {});
        setServerError(json.error ?? t.rsvp.failed);
        setStatus("error");
        return;
      }

      setStatus("done");

      // Angka ringkasan diambil ulang dari server, bukan ditambah sendiri di
      // browser, supaya yang tampil selalu sama dengan isi database.
      const fresh = await fetchSummary();
      if (fresh) setSummary(fresh);
    } catch {
      setServerError(t.rsvp.offline);
      setStatus("error");
    }
  }

  const sending = status === "sending";
  const attending = form.attendance === "ATTENDING";

  return (
    <Section id="rsvp" className="bg-cream">
      <SectionTitle>{t.rsvp.title}</SectionTitle>

      <Reveal delay={100}>
        <Divider className="mt-6 text-ink/70" />

        <p className="mt-6 text-center font-body text-lg text-ink/75">
          {t.rsvp.intro}
        </p>
      </Reveal>

      <Reveal delay={200} className="mt-10">
        {status === "done" ? (
          // Setelah berhasil, form diganti ucapan terima kasih. Tombol di
          // bawahnya untuk tamu yang mengisikan beberapa orang sekaligus.
          <div className="border border-ink/15 bg-white/60 px-6 py-10 text-center">
            <p className="font-display text-xl tracking-[0.12em] text-ink uppercase">
              {t.rsvp.thankYou}
            </p>
            <p className="mt-4 font-body text-lg text-ink/75">
              {t.rsvp.received}
            </p>

            <Button
              variant="outline"
              className="mt-8"
              onClick={() => {
                setForm(EMPTY_FORM);
                setStatus("idle");
              }}
            >
              {t.rsvp.another}
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <Field id="guestName" label={t.rsvp.name} error={errors.guestName}>
              <input
                id="guestName"
                name="guestName"
                type="text"
                autoComplete="name"
                placeholder={t.rsvp.namePlaceholder}
                value={form.guestName}
                onChange={(event) => update("guestName", event.target.value)}
                disabled={sending}
                aria-invalid={Boolean(errors.guestName)}
                aria-describedby={
                  errors.guestName ? "guestName-error" : undefined
                }
                className={inputClasses}
              />
            </Field>

            <Field
              id="attendance"
              label={t.rsvp.attendance}
              error={errors.attendance}
            >
              <select
                id="attendance"
                name="attendance"
                value={form.attendance}
                onChange={(event) => update("attendance", event.target.value)}
                disabled={sending}
                aria-invalid={Boolean(errors.attendance)}
                aria-describedby={
                  errors.attendance ? "attendance-error" : undefined
                }
                className={inputClasses}
              >
                <option value="" disabled>
                  {t.rsvp.choose}
                </option>
                <option value="ATTENDING">{t.rsvp.attending}</option>
                <option value="NOT_ATTENDING">{t.rsvp.notAttending}</option>
              </select>
            </Field>

            {/* Jumlah orang hanya relevan kalau hadir. Yang berhalangan tidak
                perlu ditanya — server pun menyimpannya sebagai 0. */}
            {attending && (
              <Field
                id="guestCount"
                label={t.rsvp.guestCount}
                hint={t.rsvp.guestCountHint}
                error={errors.guestCount}
              >
                <input
                  id="guestCount"
                  name="guestCount"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={10}
                  value={form.guestCount}
                  onChange={(event) => update("guestCount", event.target.value)}
                  disabled={sending}
                  aria-invalid={Boolean(errors.guestCount)}
                  aria-describedby={
                    errors.guestCount ? "guestCount-error" : "guestCount-hint"
                  }
                  className={inputClasses}
                />
              </Field>
            )}

            {serverError && (
              <p role="alert" className="font-ui text-xs text-red-700">
                {serverError}
              </p>
            )}

            <Button type="submit" disabled={sending} className="w-full">
              {sending ? t.rsvp.sending : t.rsvp.submit}
            </Button>
          </form>
        )}
      </Reveal>

      {/* Ringkasan baru ditampilkan setelah ada yang mengisi. Sebelum itu
          barisnya berbunyi "0 hadir · 0 berhalangan · 0 orang", yang terbaca
          seperti halaman rusak, bukan seperti undangan yang masih baru. */}
      {summary && summary.attending + summary.notAttending > 0 && (
        <p className="mt-8 text-center font-ui text-xs tracking-[0.12em] text-stone uppercase">
          {t.rsvp.summary
            .replace("{attending}", String(summary.attending))
            .replace("{notAttending}", String(summary.notAttending))
            .replace("{pax}", String(summary.totalPax))}
        </p>
      )}
    </Section>
  );
}
