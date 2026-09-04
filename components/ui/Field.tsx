/**
 * Pembungkus satu baris form: label, isian, dan pesan error di bawahnya.
 *
 * Isiannya sendiri (`<input>`, `<select>`, `<textarea>`) dikirim sebagai
 * children, jadi komponen ini tidak perlu tahu jenis isian apa pun —
 * cukup satu komponen untuk semua field di RSVP maupun Wishes.
 *
 * Bagian aksesibilitas yang penting:
 *   - `htmlFor` pada label menunjuk ke `id` isian, sehingga menekan teks
 *     label akan memfokuskan isiannya.
 *   - `aria-describedby` menghubungkan isian dengan pesan error, supaya
 *     pembaca layar ikut membacakan errornya, bukan hanya orang yang melihat.
 */
export default function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  /** Harus sama dengan `id` pada elemen isian di dalam children. */
  id: string;
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block font-body text-base tracking-wide text-ink"
      >
        {label}
      </label>

      {hint && (
        <p id={`${id}-hint`} className="font-body text-xs text-stone italic">
          {hint}
        </p>
      )}

      {children}

      {error && (
        <p
          id={`${id}-error`}
          // role="alert" membuat pesan langsung dibacakan begitu muncul.
          role="alert"
          className="font-ui text-xs text-red-700"
        >
          {error}
        </p>
      )}
    </div>
  );
}

/** Kelas dasar isian form, dipakai bersama oleh input, select, dan textarea. */
export const inputClasses =
  "w-full border border-ink/20 bg-white/70 px-4 py-2.5 font-body text-base " +
  "text-ink placeholder:text-stone/60 transition-colors " +
  "focus:border-ink focus:outline-none " +
  "disabled:cursor-not-allowed disabled:opacity-60";
