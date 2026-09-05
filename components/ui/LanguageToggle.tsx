import Link from "next/link";

import { languageCodes, languages } from "@/lib/i18n";
import type { Dict, Lang } from "@/lib/i18n";
import { languageHref } from "@/lib/utils";

/**
 * Pemilih bahasa berbentuk dua segmen berdampingan: EN | ID.
 *
 * Kedua bahasa ditampilkan sekaligus supaya tamu langsung melihat mana yang
 * sedang aktif DAN apa pilihannya. Bentuk sebelumnya — satu tautan bertuliskan
 * nama bahasa yang lain — ambigu: "Bahasa Indonesia" bisa dibaca sebagai
 * bahasa saat ini, bukan sebagai ajakan berpindah.
 *
 * Segmen yang aktif sengaja BUKAN tautan. Menautkannya ke halaman yang sedang
 * dibuka hanya memberi tamu sesuatu untuk diklik yang tidak mengubah apa pun.
 *
 * Tidak ada state di sini: bahasa disimpan di URL, jadi ini murni dua tautan.
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
  const isi = (nama: string, template: string) =>
    template.replace("{lang}", nama);

  return (
    <div
      className={`inline-flex overflow-hidden rounded-full border border-white/40 font-ui text-[0.6rem] tracking-[0.15em] uppercase ${className}`}
    >
      {languages.map((kode) => {
        const aktif = kode === lang;
        const nama = t.language.names[kode];

        if (aktif) {
          return (
            <span
              key={kode}
              // aria-current memberi tahu pembaca layar mana yang sedang
              // dipakai — informasi yang di layar disampaikan lewat warna saja.
              aria-current="true"
              aria-label={isi(nama, t.language.current)}
              className="bg-white px-4 py-2 text-ink"
            >
              {languageCodes[kode]}
            </span>
          );
        }

        return (
          <Link
            key={kode}
            href={languageHref(kode, guestName)}
            // scroll={false} menahan Next melompat ke atas, sehingga tamu yang
            // berpindah bahasa di tengah membaca tetap berada di tempatnya.
            scroll={false}
            hrefLang={kode}
            aria-label={isi(nama, t.language.switchTo)}
            className="px-4 py-2 text-white/85 transition-colors hover:bg-white/20 hover:text-white focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white"
          >
            {languageCodes[kode]}
          </Link>
        );
      })}
    </div>
  );
}
