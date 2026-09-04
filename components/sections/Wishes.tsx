"use client";

import { useEffect, useState } from "react";

import Section, { SectionTitle } from "@/components/ui/Section";
import Reveal from "@/components/ui/Reveal";
import Divider from "@/components/ui/Divider";
import Button from "@/components/ui/Button";
import Field, { inputClasses } from "@/components/ui/Field";
import { toFieldErrors, wishSchema } from "@/lib/schemas";
import { timeAgo } from "@/lib/utils";

/**
 * Ucapan & doa dari tamu: satu form kecil, lalu daftar ucapan yang masuk.
 *
 * Alurnya sama persis dengan `Rsvp.tsx` — safeParse di browser, fetch,
 * server memvalidasi ulang. Yang berbeda hanya schema dan tampilannya.
 */

/**
 * `createdAt` bertipe string, bukan Date: apa pun yang lewat JSON selalu
 * sampai sebagai teks. Konversinya dilakukan saat dipakai, di `timeAgo`.
 */
type Wish = {
  id: string;
  name: string;
  message: string;
  createdAt: string;
};

const EMPTY_FORM = { name: "", message: "" };

const MESSAGE_MAX = 500;

/** Mengambil daftar ucapan terbaru. null berarti gagal memuat. */
async function fetchWishes(): Promise<Wish[] | null> {
  try {
    const response = await fetch("/api/wishes");
    if (!response.ok) return null;
    const json = (await response.json()) as { data: Wish[] };
    return json.data;
  } catch {
    return null;
  }
}

export default function Wishes() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [serverError, setServerError] = useState("");
  const [sent, setSent] = useState(false);

  const [wishes, setWishes] = useState<Wish[]>([]);
  const [listState, setListState] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  useEffect(() => {
    fetchWishes().then((data) => {
      if (data) {
        setWishes(data);
        setListState("ready");
      } else {
        setListState("error");
      }
    });
  }, []);

  function update(field: keyof typeof EMPTY_FORM, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const parsed = wishSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error));
      return;
    }

    setErrors({});
    setServerError("");
    setSent(false);
    setSending(true);

    try {
      const response = await fetch("/api/wishes", {
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
        setServerError(json.error ?? "Gagal mengirim ucapan.");
        return;
      }

      // Nama sengaja dibiarkan terisi: kalau tamu ingin menulis lagi, ia
      // tidak perlu mengetikkan namanya dua kali.
      update("message", "");
      setSent(true);

      // Daftar diambil ulang dari server, bukan ditambah sendiri di browser,
      // sehingga ucapan tamu lain yang masuk sementara ini ikut terbawa.
      const data = await fetchWishes();
      if (data) setWishes(data);
    } catch {
      setServerError("Tidak bisa menghubungi server. Periksa koneksi Anda.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Section id="wishes" lang="id" className="bg-cream">
      <SectionTitle>Kind Words</SectionTitle>

      <Reveal delay={100}>
        <Divider className="mt-6 text-ink/70" />

        <p className="mt-6 text-center font-body text-lg text-ink/75">
          Doa dan ucapan Anda adalah hadiah yang paling berarti bagi kami.
        </p>
      </Reveal>

      <Reveal delay={200} className="mt-10">
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <Field id="name" label="Nama" error={errors.name}>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Nama Anda"
              value={form.name}
              onChange={(event) => update("name", event.target.value)}
              disabled={sending}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "name-error" : undefined}
              className={inputClasses}
            />
          </Field>

          <Field id="message" label="Ucapan" error={errors.message}>
            <textarea
              id="message"
              name="message"
              rows={4}
              maxLength={MESSAGE_MAX}
              placeholder="Tuliskan doa dan ucapan Anda…"
              value={form.message}
              onChange={(event) => update("message", event.target.value)}
              disabled={sending}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={errors.message ? "message-error" : undefined}
              className={`${inputClasses} resize-y`}
            />
            <p className="text-right font-ui text-xs text-stone">
              {form.message.length}/{MESSAGE_MAX}
            </p>
          </Field>

          {serverError && (
            <p role="alert" className="font-ui text-xs text-red-700">
              {serverError}
            </p>
          )}

          {sent && !serverError && (
            <p role="status" className="font-ui text-xs text-ink/80">
              Terima kasih, ucapan Anda sudah kami terima.
            </p>
          )}

          <Button type="submit" disabled={sending} className="w-full">
            {sending ? "Mengirim…" : "Kirim Ucapan"}
          </Button>
        </form>
      </Reveal>

      <div className="mt-12">
        {listState === "loading" && (
          <p className="text-center font-body text-base text-stone">
            Memuat ucapan…
          </p>
        )}

        {listState === "error" && (
          <p className="text-center font-body text-base text-stone">
            Daftar ucapan sedang tidak bisa dimuat.
          </p>
        )}

        {listState === "ready" && wishes.length === 0 && (
          <p className="text-center font-body text-base text-stone">
            Belum ada ucapan. Jadilah yang pertama.
          </p>
        )}

        {wishes.length > 0 && (
          // Daftarnya bisa panjang, jadi diberi tinggi maksimum dan digulir
          // sendiri supaya tidak mendorong footer terlalu jauh ke bawah.
          <ul className="max-h-96 space-y-3 overflow-y-auto pr-1">
            {wishes.map((wish) => (
              <li
                key={wish.id}
                className="border border-ink/12 bg-white/60 px-5 py-4"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-display text-base tracking-[0.08em] text-ink">
                    {wish.name}
                  </p>
                  <p className="shrink-0 font-ui text-[0.7rem] text-stone">
                    {timeAgo(new Date(wish.createdAt))}
                  </p>
                </div>

                {/* `whitespace-pre-line` menjaga baris baru yang diketik tamu. */}
                <p className="mt-2 font-body text-base whitespace-pre-line text-ink/80">
                  {wish.message}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Section>
  );
}
