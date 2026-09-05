import Link from "next/link";
import type { Dict, Lang } from "@/lib/i18n";

/**
 * Tombol ganti bahasa.
 *
 * Ini hanya sebuah tautan. Bahasa disimpan di URL, bukan di state, jadi tidak
 * ada apa pun yang perlu diingat komponen ini — dan pilihan bahasa ikut
 * terbawa saat tautan undangan dibagikan.
 *
 * `scroll={false}` menahan Next melompat ke atas halaman, sehingga tamu yang
 * mengganti bahasa di tengah membaca tetap berada di tempatnya.
 */
export default function LanguageToggle({
  lang,
  guestName,
  t,
  className = "",
}: {
  lang: Lang;
  guestName?: string;
  t: Dict;
  className?: string;
}) {
  const params = new URLSearchParams();
  if (guestName) params.set("to", guestName);

  // Inggris adalah bahasa default, jadi tidak perlu ditulis di URL.
  if (lang === "en") params.set("lang", "id");

  const href = params.size > 0 ? `/?${params}` : "/";

  return (
    <Link
      href={href}
      scroll={false}
      // Menandai bahasa TUJUAN, bukan bahasa halaman ini — supaya pembaca
      // layar melafalkan "Bahasa Indonesia" dengan aturan yang benar.
      hrefLang={lang === "en" ? "id" : "en"}
      className={className}
    >
      {t.language.other}
    </Link>
  );
}
