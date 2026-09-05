import { couple } from "@/lib/config";
import type { Dict } from "@/lib/i18n";

/**
 * "RICKY and FELLYCIA" dengan kata "and" memakai font tulisan tangan.
 *
 * Susunan ini muncul di enam tempat (sampul, sambutan, galeri, footer,
 * menu, panel desktop), jadi dibuat satu komponen supaya formatnya seragam.
 *
 * Perhatikan `{" "}` di antara nama dan kata "and": JSX membuang spasi yang
 * mengandung baris baru, sehingga tanpa itu teksnya terbaca sebagai
 * "RICKYandFELLYCIA" oleh pembaca layar — walaupun di layar terlihat
 * berjarak karena margin.
 */
export default function CoupleNames({
  t,
  /** Kelas tambahan untuk kata penghubung, biasanya untuk mengatur ukurannya. */
  andClassName = "",
}: {
  t: Dict;
  andClassName?: string;
}) {
  return (
    <>
      {couple.groom.shortName}{" "}
      <span className={`font-script normal-case ${andClassName}`}>
        {t.couple.and}
      </span>{" "}
      {couple.bride.shortName}
    </>
  );
}
