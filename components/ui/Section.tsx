import Reveal from "./Reveal";

/**
 * Pembungkus standar satu section undangan: id untuk tautan nav,
 * jarak atas-bawah, dan padding kiri-kanan yang seragam.
 *
 * Dengan komponen ini, semua section punya ritme vertikal yang sama —
 * tidak ada satu section yang paddingnya meleset dari yang lain.
 */
export default function Section({
  id,
  lang,
  children,
  className = "",
}: {
  /** Dipakai nav drawer untuk scroll ke sini. Lihat `navLinks` di lib/config.ts. */
  id?: string;
  /**
   * Kode bahasa isi section, dipakai section yang berbahasa Indonesia
   * (RSVP dan Kind Words) sementara halamannya berbahasa Inggris.
   * Tanpa ini, pembaca layar melafalkan "Kirim Konfirmasi" dengan
   * aturan pengucapan bahasa Inggris.
   */
  lang?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} lang={lang} className={`px-7 py-20 ${className}`}>
      {/* Lebar baca dikunci ~480px. Di layar tablet (768px) undangan tetap
          tampil sebagai kolom ramping di tengah, sama seperti di HP —
          kalau dibiarkan melebar, baris teksnya jadi terlalu panjang
          untuk dibaca nyaman. */}
      <div className="mx-auto max-w-[30rem]">{children}</div>
    </section>
  );
}

/**
 * Judul section: huruf kapital berjarak lebar dengan font Marcellus,
 * persis seperti "THE GROOM & BRIDE" dan "KIND WORDS" di template referensi.
 */
export function SectionTitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Reveal>
      <h2
        className={`text-center font-display text-2xl tracking-[0.18em] text-ink/85 uppercase sm:text-[1.75rem] ${className}`}
      >
        {children}
      </h2>
    </Reveal>
  );
}
